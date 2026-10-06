from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session

from backend.app.auth.schemas import UserCreate, UserLogin, UserResponse
from backend.app.schema.schema import User
from backend.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    COOKIE_SECURE,
    create_access_token,
    hash_password,
    verify_password,
)


def userLoginService(data: UserLogin, db: Session, response: Response):
    userData = db.query(User).filter(User.email == data.email).first()

    if not userData or not verify_password(data.password, userData.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token({"sub": str(userData.id)})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return {
        "message": "Login successful",
        "user": UserResponse.model_validate(userData),
    }


def userRegisterService(data: UserCreate, db: Session):
    existingUser = db.query(User).filter(User.email == data.email).first()

    if existingUser:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    newUser = User(
        email=data.email,
        password=hash_password(data.password),
        username=data.username,
    )

    db.add(newUser)
    db.commit()
    db.refresh(newUser)

    return UserResponse.model_validate(newUser)


def getUserService(user: User):
    return UserResponse.model_validate(user)
