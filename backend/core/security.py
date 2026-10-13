from datetime import datetime, timedelta, timezone
import os
from jose import jwt, JWTError
from passlib.context import CryptContext


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "development-only-secret-key-change-me",
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 60*24
COOKIE_SECURE = True

COOKIE_SAMESITE = "none"

pwd_context = CryptContext(

    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        hours=ACCESS_TOKEN_EXPIRE_HOURS
    )

    to_encode.update({
        "iat": datetime.now(timezone.utc),
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def verify_access_token(token: str):
    if not token:
        return None

    try:
        decoded_token = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        sub = decoded_token.get("sub")

        if not sub:
            return None

        return sub

    except JWTError:
        return None