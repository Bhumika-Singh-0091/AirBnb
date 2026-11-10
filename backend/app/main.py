from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, select

from .config import FRONTEND_ORIGIN, UPLOAD_DIR
from .database import Base, SessionLocal, engine
from .models import Listing
from .routers import auth, listings, reviews


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    # Auto-seed an empty database so the app has content on first run
    with SessionLocal() as db:
        empty = not db.scalar(select(func.count()).select_from(Listing))
    if empty:
        from . import seed
        seed.run(reset=False)
    yield


app = FastAPI(title="WanderNest API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(reviews.router)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}
