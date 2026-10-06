import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.auth.router import router as auth_router
from backend.app.database import engine
from backend.app.schema.schema import Base
from backend.app.records.router import router as records_router
from backend.app.zones.router import router as zones_router

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("ROUTE53_FRONTEND_ORIGIN", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(zones_router)
app.include_router(records_router)

@app.get("/")
def intro():
    return {
        "message": "Welcome to Route53 clone"
    }

@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }
