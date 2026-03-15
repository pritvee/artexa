from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import api_router
import app.db.base  # noqa: F401 — registers all models with metadata
from app.db.base_class import Base
from app.db.session import engine

app = FastAPI(title="Artexa E-Commerce API", version="1.0.0")

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://pritvee.github.io",
        "https://artexa.in",
        "https://www.artexa.in",
        "*", # Fallback for other origins not requiring credentials, though specific origins are preferred
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Artexa E-Commerce API"}

import os
from app.core.config import settings

# Create uploads directory if it doesn't exist to prevent StaticFiles error
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
# Mount uploads folder as static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(api_router, prefix="/api/v1")

# Create tables in development
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
