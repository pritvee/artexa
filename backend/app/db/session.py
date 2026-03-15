from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Render provides 'postgres://' but SQLAlchemy requires 'postgresql://'
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
if SQLALCHEMY_DATABASE_URL:
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Enforce SSL for production databases (non-localhost)
    is_local = "localhost" in SQLALCHEMY_DATABASE_URL or "127.0.0.1" in SQLALCHEMY_DATABASE_URL
    if not is_local:
        if "sslmode=" not in SQLALCHEMY_DATABASE_URL:
            separator = "&" if "?" in SQLALCHEMY_DATABASE_URL else "?"
            SQLALCHEMY_DATABASE_URL += f"{separator}sslmode=require"
        
        # NOTE: If using Supabase Connection Pooler (Port 6543), 
        # it handles transaction pooling which is safer for Render's ephemeral nodes.

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True,    # Verify connection is alive before using it
    pool_recycle=1800,     # Recycle every 30 mins to avoid stale connection errors
    pool_size=10,          # Standard pool size
    max_overflow=20        # Allow up to 20 extra connections during spikes
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    try:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    except Exception as e:
        print(f"CRITICAL ERROR in get_db: Failed to initialize database session: {str(e)}")
        import traceback
        traceback.print_exc()
        # Re-raise to be caught by global exception handler
        raise
