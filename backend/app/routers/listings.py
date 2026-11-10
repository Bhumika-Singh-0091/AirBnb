import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from ..auth import get_current_user
from ..config import ALLOWED_EXT, DEFAULT_IMAGE, MAX_UPLOAD_BYTES, UPLOAD_DIR
from ..database import get_db
from ..geocode import geocode
from ..models import Listing, Review, User
from ..schemas import ListingDetail, ListingOut

router = APIRouter(prefix="/api/listings", tags=["listings"])


def to_out(l: Listing) -> dict:
    ratings = [r.rating for r in l.reviews]
    return {
        "id": l.id,
        "title": l.title,
        "description": l.description,
        "image": {"url": l.image_url, "filename": l.image_filename},
        "price": l.price,
        "location": l.location,
        "country": l.country,
        "geometry": {"type": "Point", "coordinates": [l.longitude, l.latitude]},
        "owner": l.owner,
        "review_count": len(ratings),
        "avg_rating": round(sum(ratings) / len(ratings), 2) if ratings else None,
    }


def _get_or_404(db: Session, listing_id: int) -> Listing:
    l = db.scalar(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(selectinload(Listing.owner), selectinload(Listing.reviews).selectinload(Review.author))
    )
    if not l:
        raise HTTPException(404, "Listing you requested for does not exist!")
    return l


async def _save_image(file: UploadFile | None) -> tuple[str, str] | None:
    if not file or not file.filename:
        return None
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Image must be a PNG, JPG, JPEG or WEBP file")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(400, "Image must be 5MB or smaller")
    name = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / name).write_bytes(data)
    return f"/uploads/{name}", name


def _remove_local_image(l: Listing):
    if l.image_url.startswith("/uploads/"):
        (UPLOAD_DIR / Path(l.image_url).name).unlink(missing_ok=True)


def _validate(title: str, description: str, location: str, country: str, price: int):
    if not all(s.strip() for s in (title, description, location, country)):
        raise HTTPException(400, "Title, description, location and country are required")
    if price < 0:
        raise HTTPException(400, "Price must be 0 or more")


@router.get("", response_model=list[ListingOut])
def list_listings(q: str | None = None, db: Session = Depends(get_db)):
    stmt = select(Listing).options(selectinload(Listing.owner), selectinload(Listing.reviews)).order_by(Listing.id)
    if q and q.strip():
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(Listing.title.ilike(like), Listing.location.ilike(like), Listing.country.ilike(like),
                Listing.description.ilike(like))
        )
    return [to_out(l) for l in db.scalars(stmt)]


@router.get("/{listing_id}", response_model=ListingDetail)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    l = _get_or_404(db, listing_id)
    out = to_out(l)
    out["reviews"] = l.reviews
    return out


@router.post("", response_model=ListingOut, status_code=201)
async def create_listing(
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    country: str = Form(...),
    price: int = Form(...),
    image: UploadFile | None = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _validate(title, description, location, country, price)
    saved = await _save_image(image)
    lng, lat = await geocode(location)
    l = Listing(
        title=title.strip(), description=description.strip(), location=location.strip(),
        country=country.strip(), price=price, owner_id=user.id, longitude=lng, latitude=lat,
        image_url=saved[0] if saved else DEFAULT_IMAGE,
        image_filename=saved[1] if saved else "default",
    )
    db.add(l)
    db.commit()
    return to_out(_get_or_404(db, l.id))


@router.put("/{listing_id}", response_model=ListingOut)
async def update_listing(
    listing_id: int,
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    country: str = Form(...),
    price: int = Form(...),
    image: UploadFile | None = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    l = _get_or_404(db, listing_id)
    if l.owner_id != user.id:
        raise HTTPException(403, "You are not the owner of this listing")
    _validate(title, description, location, country, price)
    if location.strip() != l.location:
        l.longitude, l.latitude = await geocode(location)
    l.title, l.description = title.strip(), description.strip()
    l.location, l.country, l.price = location.strip(), country.strip(), price
    saved = await _save_image(image)
    if saved:
        _remove_local_image(l)
        l.image_url, l.image_filename = saved
    db.commit()
    return to_out(_get_or_404(db, l.id))


@router.delete("/{listing_id}")
def delete_listing(listing_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    l = _get_or_404(db, listing_id)
    if l.owner_id != user.id:
        raise HTTPException(403, "You are not the owner of this listing")
    _remove_local_image(l)
    db.delete(l)  # reviews cascade
    db.commit()
    return {"ok": True}
