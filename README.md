# ProblemFinder — All-in-One Productivity Platform

ProblemFinder is a full-stack productivity workspace built with React/Vite, Node.js/Express and MongoDB/Mongoose.

## Features
- JWT authentication + bcrypt password hashing
- Dashboard statistics and recent activity
- PlanIt plans with progress steps
- Digital Locker upload/download/delete/edit
- TeamMate projects and tasks
- IdeaLab ideas
- LinkSpace bookmarks
- Global search
- Notifications
- Profile and password settings
- Responsive SaaS UI
- Owner-based authorization
- Vercel-ready frontend + backend

## Stack
- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express
- Database: MongoDB Atlas + Mongoose
- Auth: JWT + bcrypt
- Uploads: Multer memory storage + MongoDB binary data

## Local setup

Requirements: Node.js 20+, npm, MongoDB Atlas.

### 1. Backend
Open a terminal:

```bash
cd server
npm install
```

Create `server/.env` from `server/.env.example`:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
PORT=5000
```

Run:

```bash
npm run dev
```

### 2. Frontend
Open another terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run:

```bash
npm run dev
```

Open `http://localhost:5173`.

Backend health check:
`http://localhost:5000/api/health`

A demo account is created automatically by the backend:
- Email: `demo@problemfinder.local`
- Password: `Demo1234`

## Vercel deployment

Use **two Vercel projects** from the same GitHub repository.

### Backend
- Import repository
- Root Directory: `server`
- Environment variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `CLIENT_URL` = deployed frontend URL
  - `MAX_FILE_SIZE=10485760`
- Deploy
- Check `/api/health`

### Frontend
- Create another Vercel project from the same repository
- Root Directory: `client`
- Environment variable:
  - `VITE_API_URL=https://YOUR-BACKEND.vercel.app/api`
- Deploy

After getting the frontend URL, put that exact URL in backend `CLIENT_URL` and redeploy backend.

See `DEPLOYMENT.md` for the full checklist.

## Security
- Passwords are hashed with bcrypt.
- JWT protects private API routes.
- Records are scoped to the authenticated owner.
- Upload size/type is restricted.
- Real secrets belong only in environment variables.
- Do not commit `server/.env`.

## Important
The ZIP intentionally does not include `.git`, `node_modules`, or real `.env` credentials. Install dependencies with `npm install`.
