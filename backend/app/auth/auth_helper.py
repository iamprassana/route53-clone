from fastapi import Cookie, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from core.security import verify_access_token
from app.database import get_db
from app.schema.schema import User

def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db)
):
    return get_user_from_token(access_token, db)


def get_user_from_token(
    access_token: str | None,
    db: Session,
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not access_token:
        raise credentials_exception

    user_id = verify_access_token(token=access_token)

    if user_id is None:
        raise credentials_exception

    try:
        user = (
            db.query(User)
            .filter(User.id == int(user_id))
            .first()
        )
    except (TypeError, ValueError):
        raise credentials_exception

    if user is None:
        raise credentials_exception

    return user



def getId(request: Request):
    cookie = request.cookies.get("access_token")

    if not cookie:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please login to access the page.",
        )

    user_id = verify_access_token(cookie)

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Please login to access the page."
        )

    try:
        return int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please login to access the page.",
        )