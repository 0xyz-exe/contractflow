import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, contracts, approvals, templates, obligations, dashboard

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

# Ensure storage directory exists
os.makedirs(settings.STORAGE_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Open-Source Contract Lifecycle & Approval Management Platform"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(contracts.router, prefix=settings.API_V1_STR)
app.include_router(approvals.router, prefix=settings.API_V1_STR)
app.include_router(templates.router, prefix=settings.API_V1_STR)
app.include_router(obligations.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "ContractFlow CLM REST Engine",
        "version": settings.VERSION
    }

@app.get("/", tags=["System"])
def root():
    return {
        "message": "ContractFlow CLM API is operational",
        "docs_url": "/docs",
        "health_check": "/health"
    }
