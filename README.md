# Commuter Genius

Safety-first public transport planning platform with route optimization, hazard reporting, emergency SOS, and admin moderation.

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind
- Backend: FastAPI + Python + SQLAlchemy
- Database: PostgreSQL (recommended)
- Optional infra: Docker and Docker Compose

## Repository Structure

```text
commuter-genius-main/
  src/                    Frontend app source
  backend/                FastAPI backend source
    routers/              API route modules
    requirements.txt      Backend dependencies
    main.py               FastAPI entrypoint
  docker/                 Nginx and container configs
  public/                 Static frontend assets
  Dockerfile              Container image build
  docker-compose.yml      Local multi-service orchestration
  package.json            Frontend scripts and dependencies
```

## Quick Start (Local)

### 1. Frontend

```powershell
npm install --legacy-peer-deps
npm run dev
```

### 2. Backend

```powershell
cd backend
c:/Users/User/Downloads/Optimal_drop-off_point_By_SSSP/venv/Scripts/python.exe -m pip install -r requirements.txt
c:/Users/User/Downloads/Optimal_drop-off_point_By_SSSP/venv/Scripts/python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Build for Production

```powershell
npm run build
```

## Deployment Paths

### Option A: Docker Compose

```powershell
docker compose up --build -d
```

### Option B: Manual
1. Build frontend with `npm run build`
2. Serve `dist/` via Nginx or static hosting
3. Run backend via Uvicorn or Gunicorn
4. Set environment variables for DB and secrets

## Verified Today
- Frontend production build completed successfully.
- Backend import smoke check passed (`import main`).
- Python 3.13 dependency blocker resolved by pinning `aiohttp==3.12.15`.

## Notes
- Keep local `.env` files out of Git.
- Use `npm install --legacy-peer-deps` in this repo due React/Leaflet peer constraints.
