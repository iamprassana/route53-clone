from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.orm import Session

from app.auth.schemas import UserCreate, UserLogin, UserResponse
from app.database import get_db

from app.auth.service import (
    userLoginService,
    userRegisterService,
)

from app.auth.auth_helper import get_user_from_token
from core.security import COOKIE_SECURE, COOKIE_SAMESITE


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login", status_code=200)
def loginUser(
    data: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    return userLoginService(data, db, response)


@router.post("/register", status_code=201)
def registerUser(
    data: UserCreate,
    db: Session = Depends(get_db)
):
    return userRegisterService(data, db)


@router.get("/me", response_model=UserResponse, status_code=200)
def getUser(
    request: Request,
    db: Session = Depends(get_db),
):
    cookie = request.cookies.get("access_token")
    return get_user_from_token(cookie, db)

@router.post("/logout", status_code=204)
def logoutUser(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
    )
    return None