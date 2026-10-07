from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from backend.app.auth.schemas import UserCreate, UserLogin, UserResponse
from backend.app.database import get_db

from backend.app.auth.service import (
    userLoginService,
    userRegisterService,
    getUserService,
)

from backend.app.auth.auth_helper import get_current_user
from backend.app.schema.schema import User
from backend.core.security import COOKIE_SECURE, COOKIE_SAMESITE


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
    current_user: User = Depends(get_current_user),
):
    return getUserService(current_user)


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