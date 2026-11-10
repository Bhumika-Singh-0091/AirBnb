from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import auth
from ..config import COOKIE_SECURE, TOKEN_DAYS
from ..database import get_db
from ..models import User
from ..schemas import LoginIn, SignupIn, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _set_cookie(response: Response, user_id: int):
    response.set_cookie(
        auth.COOKIE_NAME,
        auth.create_token(user_id),
        max_age=TOKEN_DAYS * 86400,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        path="/",
    )


@router.post("/signup", response_model=UserOut, status_code=201)
def signup(data: SignupIn, response: Response, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(func.lower(User.username) == data.username.lower())):
        raise HTTPException(400, "A user with the given username is already registered")
    if db.scalar(select(User).where(func.lower(User.email) == data.email.lower())):
        raise HTTPException(400, "A user with the given email is already registered")
    user = User(username=data.username, email=data.email, password_hash=auth.hash_password(data.password))
    db.add(user)
    db.commit()
    _set_cookie(response, user.id)
    return user


@router.post("/login", response_model=UserOut)
def login(data: LoginIn, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(func.lower(User.username) == data.username.lower()))
    if not user or not auth.verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Password or username is incorrect")
    _set_cookie(response, user.id)
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(auth.COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me", response_model=UserOut | None)
def me(user: User | None = Depends(auth.get_optional_user)):
    return user
