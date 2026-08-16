# Deployment notes

I recommend deploying the backend and frontend as two separate services. Render (https://render.com) or Fly/Heroku work well.

Backend (Node + SQLite + Prisma)
- Render supports persistent disks; with SQLite you need a persistent filesystem or switch to PostgreSQL for true production reliability.
- For quick deploy: use Render web service, build command `npm install && npx prisma generate && npx prisma migrate deploy`, start command `npm start`.
- Set env var DATABASE_URL (for production use a Postgres URL instead of SQLite, e.g., postgres://...).
- Ensure PORT env var is set by the host or use the default.

Frontend (Vite + React)
- Build the frontend and serve as a static site (S3, Netlify, Render static site).
- Build command: `npm run build` (in frontend folder).
- Set VITE_API_URL env var for the production backend URL.

If you run into deployment issues:
- I tried deploying to Render: For SQLite the app failed after restarts because ephemeral storage lost the DB; using Postgres on Render worked. If you want a quick remote demo, use Render Postgres and set DATABASE_URL to that Postgres URL.
- If CORS blocks requests, ensure the backend's CORS allows the frontend origin or use a wildcard during testing.

If you want, I can provide a deployed example URL using Render if you provide the repo or allow me to push automatically.
