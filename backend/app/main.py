import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.auth.router import router as auth_router
from backend.app.database import engine
from backend.app.schema.schema import Base
from backend.app.records.router import router as records_router
from backend.app.zones.router import router as zones_router

Base.metadata.create_all(bind=engine)

app = FastAPI()
logger = logging.getLogger(__name__)


#Global exception handler to handle all the thrown expections
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "Unhandled exception while processing %s %s",
        request.method,
        request.url.path,
        exc_info=exc,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://route53-clone-frontend-ten.vercel.app",
    ],
    allow_credentials=False,
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
