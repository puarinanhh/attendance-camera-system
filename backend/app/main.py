from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.api.v1 import auth, attendance, employees, face_recognition
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole

app = FastAPI(
    title=settings.APP_NAME,
    description="Attendance Camera System API",
    version="1.0.0",
    debug=settings.DEBUG
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(employees.router, prefix="/api/v1/employees", tags=["Employees"])
app.include_router(attendance.router, prefix="/api/v1/attendance", tags=["Attendance"])
app.include_router(face_recognition.router, prefix="/api/v1/face", tags=["Face Recognition"])

@app.get("/")
async def root():
    return {
        "message": "Attendance Camera System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}

@app.on_event("startup")
async def on_startup() -> None:
    # Create database tables
    Base.metadata.create_all(bind=engine)

    # Seed default admin user if not exists
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == "admin").first()
        if not existing:
            user = User(
                username="admin",
                email="admin@example.com",
                full_name="System Administrator",
                hashed_password=get_password_hash("123456"),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.commit()
            print("Default admin user created: admin/123456")
    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)