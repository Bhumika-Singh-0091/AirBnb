# 🏡 WanderNest — Next.js + FastAPI + SQLite

WanderNest rebuilt on a modern stack (originally Node/Express/EJS/MongoDB).

| Layer     | Before                    | Now                                            |
|-----------|---------------------------|------------------------------------------------|
| Frontend  | EJS templates             | **Next.js 14 (App Router) + TypeScript**       |
| Backend   | Express + Passport        | **Python + FastAPI** (JWT in httpOnly cookie)  |
| Database  | MongoDB Atlas / Mongoose  | **SQLite** via SQLAlchemy 2.0                  |
| Images    | Cloudinary                | Local uploads (`backend/uploads`)              |
| Maps      | Leaflet + OSM             | Leaflet + OSM (React component)                |
| Geocoding | Mapbox                    | Mapbox if `MAP_TOKEN` set, else free Nominatim |

## Run it

**1. Backend** (port 8000)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                    # optional, set SECRET
uvicorn app.main:app --reload --port 8000
```
The SQLite DB is created and seeded with 9 sample listings on first start.
Demo login: `seed-admin` / `admin1234`. Re-seed anytime: `python -m app.seed`.
Interactive API docs: http://localhost:8000/docs

**2. Frontend** (port 3000)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000. Next.js proxies `/api/*` and `/uploads/*` to FastAPI
(set `API_URL` in `frontend/.env.local` if the backend isn't on 127.0.0.1:8000),
so the browser stays same-origin and the auth cookie just works.

## Features (all preserved)
Browse/search/filter listings · create, edit, delete listings with image upload ·
owner-only edit/delete · sign up / log in / log out · reviews with star ratings ·
Leaflet map on each listing · flash messages · login redirects back to where you were.

## API
| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout` | – |
| GET | `/api/auth/me` | optional |
| GET | `/api/listings?q=` , `/api/listings/{id}` | – |
| POST | `/api/listings` (multipart) | login |
| PUT / DELETE | `/api/listings/{id}` | owner |
| POST | `/api/listings/{id}/reviews` | login |
| DELETE | `/api/listings/{id}/reviews/{rid}` | review author |

## Project layout
```
backend/app/   main.py · models.py · schemas.py · auth.py · geocode.py · seed.py · routers/
frontend/src/  app/ (pages) · components/ · context/AppContext.tsx · lib/api.ts, types.ts
```

## Changes vs. the original (worth knowing)
- Ratings on cards / listing page are now **real** (average of reviews, "New" if none) instead of hard-coded 4.8 / 4.87 / 128.
- Review delete button now shows for the **review author** (the old UI showed it to the listing owner while the server only allowed the author).
- Category chips now filter by keywords in title/description (the data has no category field).
- Map popup text is inserted as plain text (no HTML injection).
- Passwords hashed with bcrypt; uploads limited to PNG/JPG/WEBP, 5 MB.
- The old `init/data.js` had stray leftover lines after `module.exports`; seed data was recovered from the valid part (9 listings).
- `style.css` had one stray `}` that browsers ignored but the Next.js build rejects; removed.
