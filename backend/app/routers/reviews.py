from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Listing, Review, User
from ..schemas import ReviewIn, ReviewOut

router = APIRouter(prefix="/api/listings/{listing_id}/reviews", tags=["reviews"])


@router.post("", response_model=ReviewOut, status_code=201)
def create_review(listing_id: int, data: ReviewIn, user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    if not db.get(Listing, listing_id):
        raise HTTPException(404, "Listing you requested for does not exist!")
    if not data.comment.strip():
        raise HTTPException(400, "Comment is required")
    review = Review(listing_id=listing_id, author_id=user.id, rating=data.rating, comment=data.comment.strip())
    db.add(review)
    db.commit()
    db.refresh(review)
    review.author = user
    return review


@router.delete("/{review_id}")
def delete_review(listing_id: int, review_id: int, user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    review = db.get(Review, review_id)
    if not review or review.listing_id != listing_id:
        raise HTTPException(404, "Review not found")
    if review.author_id != user.id:
        raise HTTPException(403, "You are not the owner of this review")
    db.delete(review)
    db.commit()
    return {"ok": True}
