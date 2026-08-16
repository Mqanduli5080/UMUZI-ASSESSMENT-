# ☕ Brew Log — Micro-Roastery Coffee Journal

A full-stack TypeScript application for logging and managing coffee brewing sessions.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase account

### Installation

```bash
# Clone and install
git clone https://github.com/Mqanduli5080/UMUZI-ASSESSMENT-.git
cd UMUZI-ASSESSMENT-
npm install

# Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials
```

### Run Development Servers

```bash
# Terminal 1 - Frontend (port 5173)
cd frontend
npm run dev

# Terminal 2 - Backend (port 3000)
cd backend
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📁 Project Structure

```
UMUZI-ASSESSMENT-/
├── frontend/
│   ├── src/
│   │   ├── routes/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   └── index.ts
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
└── package.json
```

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, TanStack Router, React Query, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Supabase
- **Database**: PostgreSQL (Supabase)

## 📝 Environment Variables

Create `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=pk_xxx
SUPABASE_SERVICE_ROLE=sb_xxx
PORT=3000
```

## 🎯 Features

- ✨ Log coffee brewing sessions
- 🔍 Filter by brewing method
- ✏️ Edit and delete brews
- ⭐ Rate and review brews
- 📊 Track tasting notes

## 📄 License

Umuzi Assessment Project
