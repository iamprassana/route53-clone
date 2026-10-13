from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth.router import router as auth_router
from app.database import engine
from app.schema.schema import Base
from app.records.router import router as records_router
from app.zones.router import router as zones_router

Base.metadata.create_all(bind=engine)

app = FastAPI()


#Global exception handler to handle all the thrown expections
@app.exception_handler(Exception)
async def global_exception_handler():
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
    # Covers production, preview, and branch deployment URLs from Vercel.
    allow_origin_regex=r"https://[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.vercel\.app",
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
