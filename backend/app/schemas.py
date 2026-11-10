from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str


class SignupIn(BaseModel):
    username: str = Field(min_length=1, max_length=60)
    email: EmailStr
    password: str = Field(min_length=1)


class LoginIn(BaseModel):
    username: str
    password: str


class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    rating: int
    comment: str
    created_at: datetime
    author: UserOut


class Geometry(BaseModel):
    type: str = "Point"
    coordinates: list[float]


class ImageOut(BaseModel):
    url: str
    filename: str


class ListingOut(BaseModel):
    id: int
    title: str
    description: str
    image: ImageOut
    price: int
    location: str
    country: str
    geometry: Geometry
    owner: UserOut
    review_count: int
    avg_rating: float | None


class ListingDetail(ListingOut):
    reviews: list[ReviewOut]
