# Deployment Guide

## Local Development (Zero Dependencies)

```bash
# 1. Start Backend
cd apps/api
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 2. Start Frontend
cd ../web
npm install
npm run dev
```

Frontend runs at: `http://localhost:5185`  
API Swagger runs at: `http://127.0.0.1:8000/docs`

## Docker Deployment (Production)

```bash
docker compose up -d --build
```

Services started:
- `contractflow-api`: FastAPI REST engine on port 8000.
- `contractflow-web`: Nginx-served React SPA on port 3000.
- `contractflow-db`: PostgreSQL 16 on port 5432.
