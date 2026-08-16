# Coffee Brew Log — Documentation

This project is a small full-stack app to log brews. It includes a React frontend and an Express/Prisma backend (SQLite).

Prereqs
- Node.js 18+ (or newer LTS)
- npm (or pnpm/yarn)
- Git (recommended)

Local setup

1. Clone the repo:
   git clone <your-repo-url>
   cd <repo-root>

2. Copy env files
   cp .env.example backend/.env.example
   cp .env.example frontend/.env.example
   Edit values if needed.

Backend (Express + Prisma with SQLite)
- Change into backend:
  cd backend
- Install:
  npm install
- Initialize Prisma DB + run seed:
  npx prisma generate
  npx prisma migrate dev --name init
  node prisma/seed.js
- Start backend:
  npm run start
  By default it starts on port 4000. API base: http://localhost:4000/api/brews

Frontend (React + Vite)
- In a new terminal:
  cd frontend
  npm install
  npm run dev
- Open the dev URL printed by Vite (typically http://localhost:5173)
- The page title will be "Brews: {brewCount}" where brewCount is the number of displayed brews.

Endpoints
- GET /api/brews — list all brews; optional filter ?method=Espresso
- POST /api/brews — create a brew
- GET /api/brews/:id — get one brew
- PUT /api/brews/:id — update a brew
- DELETE /api/brews/:id — delete a brew

Validation
- Backend will return 400 if required fields are missing or invalid.
- Frontend forms prevent submission if there are blank required fields.

Deployment
- See deployment.md for notes about deploying to Render or similar.
