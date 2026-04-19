# Klasio

SaaS dla nauczycieli — minimalizuj czas pracy administracyjnej.

## Szybki start (Docker)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Docs: http://localhost:8000/docs

## Lokalny development (bez Docker)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Stack
- **Backend:** FastAPI + PostgreSQL + SQLAlchemy + Alembic
- **Frontend:** React + Vite + TailwindCSS + React Query
- **Auth:** JWT
