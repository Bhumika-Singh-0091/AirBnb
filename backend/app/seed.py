"""Seed the database with sample listings.  Run:  python -m app.seed"""
import json
from pathlib import Path

from sqlalchemy import select

from .auth import hash_password
from .config import DEFAULT_COORDS, DEFAULT_IMAGE
from .database import Base, SessionLocal, engine
from .models import Listing, User


def run(reset: bool = True):
    Base.metadata.create_all(engine)
    items = json.loads((Path(__file__).parent / "seed_data.json").read_text())
    with SessionLocal() as db:
        admin = db.scalar(select(User).where(User.username == "seed-admin"))
        if not admin:
            admin = User(username="seed-admin", email="admin@wandernest.com", password_hash=hash_password("admin1234"))
            db.add(admin)
            db.commit()
        if reset:
            for l in db.scalars(select(Listing).where(Listing.image_filename == "seed")):
                db.delete(l)
            db.commit()
        for i in items:
            lng, lat = i["coordinates"] or DEFAULT_COORDS
            db.add(Listing(
                title=i["title"], description=i["description"], price=i["price"],
                location=i["location"], country=i["country"], longitude=lng, latitude=lat,
                image_url=i["image"] or DEFAULT_IMAGE, image_filename="seed", owner_id=admin.id,
            ))
        db.commit()
        print(f"Seeded {len(items)} listings. Demo login: seed-admin / admin1234")


if __name__ == "__main__":
    run()
