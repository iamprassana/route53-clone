from datetime import datetime, timedelta, timezone
import os

from jose import jwt
from passlib.context import CryptContext


SECRET_KEY = os.getenv(
    "ROUTE53_SECRET_KEY",
    "development-only-secret-key-change-me",
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
COOKIE_SECURE = os.getenv("ROUTE53_COOKIE_SECURE", "false").lower() == "true"


pwd_context = CryptContext(
    # PBKDF2 is provided by passlib and does not depend on a separate
    # bcrypt backend, so it works consistently in this project environment.
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
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "iat": datetime.now(timezone.utc),
        "username": data.get("username"),
        "id": data.get("id"),
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )