import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import api_router
import app.db.base  # noqa: F401 — registers all models with metadata
from app.db.base_class import Base
from app.db.session import engine
from app.core.config import settings

app = FastAPI(title="Artexa E-Commerce API", version="1.0.0")

# Define specific origins for production and development
allowed_origins = [
    "https://artexa.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Support custom frontend URL from environment variable
env_frontend_url = os.getenv("FRONTEND_URL")
if env_frontend_url:
    allowed_origins.append(env_frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def read_root():
    return {"message": "Welcome to Artexa E-Commerce API"}


# Create uploads directory if it doesn't exist to prevent StaticFiles error
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
# Mount uploads folder as static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(api_router, prefix="/api/v1")

# Create tables in development
@app.on_event("startup")
def on_startup():
    try:
        print("DEBUG: Attempting to connect to database and create tables...")
        Base.metadata.create_all(bind=engine)
        print("DEBUG: Database connection successful and tables verified.")
    except Exception as e:
        print(f"ERROR: Database connection failed: {str(e)}")
        print("CRITICAL: The application may not function correctly without a database connection.")



