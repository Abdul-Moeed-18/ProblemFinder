# ProblemFinder — Full-Stack Productivity Platform

ProblemFinder is a React/Vite frontend with an Express/Mongoose backend and MongoDB Atlas.

## Stack

- Frontend: React 19 + Vite
- Backend: Node.js 24 + Express 5
- Database: MongoDB / MongoDB Atlas
- Authentication: JWT + bcrypt
- File storage: MongoDB binary data (Digital Locker)
- Deployment: two Vercel projects from the same GitHub repository

## Local setup

Requirements:

- Node.js 24.x
- npm
- MongoDB Atlas (or a local MongoDB instance)

Install everything from the repository root:

```bash
npm install
npm run install:all
```

Create `server/.env` from `server/.env.example`:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/problemfinder
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=4194304
NODE_ENV=development
```

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start both applications:

```bash
npm run dev
```

Or separately:

```bash
npm run server
npm run client
```

Local URLs:

- Frontend: `http://localhost:5173`
- API health: `http://localhost:5000/api/health`

## Production architecture

This repository is intentionally deployed as two Vercel projects:

### Frontend

Vercel Root Directory:

```text
client
```

Environment variable:

```text
VITE_API_URL=https://YOUR-BACKEND.vercel.app/api
```

`client/vercel.json` provides the SPA fallback so direct visits to routes such as `/dashboard` do not return a 404.

### Backend

Vercel Root Directory:

```text
server
```

Environment variables:

```text
MONGODB_URI=your MongoDB Atlas connection string
JWT_SECRET=a-long-random-secret-at-least-32-characters
CLIENT_URL=https://YOUR-FRONTEND.vercel.app
MAX_FILE_SIZE=4194304
NODE_ENV=production
```

After deployment:

```text
https://YOUR-BACKEND.vercel.app/api/health
```

should return:

```json
{
  "ok": true,
  "service": "ProblemFinder API",
  "storage": "MongoDB"
}
```

## Digital Locker / uploads

Vercel Functions should not be used as permanent local file storage. The Digital Locker therefore stores uploaded file bytes in MongoDB.

The application intentionally limits uploads to about 4 MB. Vercel currently documents a 4.5 MB maximum Function payload, so the lower application limit leaves room for multipart request overhead.

For a larger-file production system, move file storage to object storage and keep only file metadata in MongoDB.

## Security

- Real environment files are not included in the deployment package.
- `JWT_SECRET` is required and must be at least 32 characters in production.
- Private API routes require JWT authentication.
- User-owned records are filtered by authenticated user.
- Document download also requires authentication and ownership.
- Uploads are limited by size and MIME type.
- Binary document data is excluded from normal document-list queries.

## Important deployment rule

Do not put real secrets in GitHub or inside the ZIP.

Configure production secrets in the Vercel project Environment Variables instead.

## Notes

The old `server/data/*.json` files are no longer the application's database layer. MongoDB/Mongoose is the active data layer.

The old local `server/uploads/` approach is no longer used for persistent document storage.
