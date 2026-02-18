# StreamTracker

Cross-platform app to manage streaming subscriptions and track watchlists across Netflix, Hulu, Disney+, HBO Max, Prime Video, and Apple TV+.

## Stack

- **Backend**: FastAPI · SQLAlchemy (async) · SQLite · Pydantic v2
- **Frontend**: React Native · Expo · React Navigation

## Quick start

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`. Docs at `/docs`.

### Frontend

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` for iOS / Android simulator.

> **Note**: update `BASE_URL` in `src/services/api.js` if the backend runs on a different host/port.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/platforms/` | List platforms |
| POST | `/api/v1/platforms/` | Add platform |
| PATCH | `/api/v1/platforms/{id}` | Update platform |
| DELETE | `/api/v1/platforms/{id}` | Delete platform |
| GET | `/api/v1/watchlist/` | List watchlist (optional `?status=` filter) |
| POST | `/api/v1/watchlist/` | Add item |
| PATCH | `/api/v1/watchlist/{id}` | Update item |
| DELETE | `/api/v1/watchlist/{id}` | Remove item |
