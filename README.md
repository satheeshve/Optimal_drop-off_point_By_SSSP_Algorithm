# Optimal Drop-off Point by SSSP

Safety-first public transport planning platform with shortest-path route recommendations, safety scoring, hazard reporting, emergency workflows, and admin moderation.

## Features

- Shortest-path based route recommendation engine (SSSP-focused)
- Safety-aware route scoring and hazard impact modeling
- Police patrol visibility and management views
- Emergency/SOS support flow
- Admin dashboard for hazard verification and control
- GTFS/GTFS-RT transit integration support

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: FastAPI, Python, SQLAlchemy
- Database: SQLite (default) or PostgreSQL (production)
- Deployment: Docker, Docker Compose, Nginx

## Repository Structure

```text
.
|- src/                 Frontend source
|- backend/             FastAPI application
|  |- routers/          Backend API route modules
|  |- services/         Backend service modules
|  |- requirements.txt  Python dependencies
|  `- main.py           API entrypoint
|- docker/              Container and reverse-proxy config
|- public/              Static assets
|- package.json         Frontend dependencies and scripts
`- docker-compose.yml   Local container orchestration
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- npm

## Local Development

### 1. Install Frontend Dependencies

```powershell
npm install --legacy-peer-deps
```

### 2. Install Backend Dependencies

```powershell
cd backend
python -m venv venv
venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..
```

### 3. Start Backend

```powershell
cd backend
venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start Frontend

```powershell
npm run dev
```

Frontend: http://localhost:8080  
Backend API: http://localhost:8000  
API docs: http://localhost:8000/api/docs

## Environment Configuration

- Frontend template: `.env.production`
- Backend template: `backend/.env.example` and `backend/.env.production`
- Keep real secrets in local `.env` files only (excluded by `.gitignore`)

## Build and Deployment

### Frontend Production Build

```powershell
npm run build
```

### Docker Compose

```powershell
docker compose up --build -d
```

## Quality and Maintenance

- Lint frontend: `npm run lint`
- Prefer one JS package manager in this repo (`npm`)
- Keep generated artifacts (`dist`, `node_modules`, virtual environments) out of source control
