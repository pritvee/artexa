from fastapi import FastAPI, Request, Depends
from datetime import datetime
import os
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import api_router
import app.db.base  # noqa: F401 — registers all models with metadata
from app.db.base_class import Base
from app.db.session import engine, get_db, SessionLocal
from app.core.config import settings
import traceback
import logging
from sqlalchemy import text

app = FastAPI(
    title="Artexa E-Commerce API", 
    version="1.0.0",
    redirect_slashes=True
)

# Define specific origins for production and development
allowed_origins = [
    "https://artexa.vercel.app",
    "https://www.artexa.in",
    "https://artexa.in",
    "https://pritvee.github.io",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Support custom frontend URL from environment variable
env_frontend_url = os.getenv("FRONTEND_URL")
if env_frontend_url:
    allowed_origins.append(env_frontend_url.rstrip("/"))

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"CRITICAL ERROR: Unhandled exception at {request.url}")
    print(f"Error details: {str(exc)}")
    traceback.print_exc()
    
    response_content = {
        "detail": "Internal Server Error",
        "error_type": type(exc).__name__,
        "message": str(exc),
        "path": str(request.url.path)
    }
    
    response = JSONResponse(
        status_code=500,
        content=response_content
    )
    
    # Manually add CORS headers to 500 responses to avoid CORS block in browser
    origin = request.headers.get("origin")
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        
    return response

@app.middleware("http")
async def ensure_cors_for_all_responses(request: Request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin")
    if origin in allowed_origins and "access-control-allow-origin" not in {k.lower() for k in response.headers.keys()}:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def read_root():
    return {"message": "Welcome to Artexa E-Commerce API", "status": "online"}

@app.get("/health")
def health_check():
    health_info = {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "database": "disconnected"
    }
    
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        health_info["database"] = "connected"
    except Exception as e:
        health_info["status"] = "error"
        health_info["database_error"] = str(e)
        
    return health_info


# Create uploads directory if it doesn't exist to prevent StaticFiles error
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
# Mount uploads folder as static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(api_router, prefix="/api/v1")

# Create tables in development
@app.on_event("startup")
def on_startup():
    try:
        # 1. Run migrations first
        from app.db.migrations import ensure_columns
        ensure_columns()
        
        # 2. Sync metadata
        Base.metadata.create_all(bind=engine)
        print("DEBUG: Database connection successful and tables verified.")
    except Exception as e:
        print(f"ERROR: Database connection failed: {str(e)}")
        import traceback
        traceback.print_exc()
        print("CRITICAL: The application may not function correctly without a database connection.")



