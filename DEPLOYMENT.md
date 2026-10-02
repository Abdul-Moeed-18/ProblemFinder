# ProblemFinder — Vercel deployment

Deploy the frontend and backend as two separate Vercel projects from the same GitHub repository.

## 1. MongoDB Atlas

Create a MongoDB database named `problemfinder` and a database user.

Use the MongoDB connection string as:

```text
MONGODB_URI
```

For a first/demo deployment, configure MongoDB Atlas Network Access so Vercel can connect. Use the narrowest practical network policy for your setup.

## 2. Backend Vercel project

Create a new Vercel project from the GitHub repository.

Set:

```text
Root Directory: server
```

The backend contains `api/index.js` and `server/vercel.json`.

Add these Environment Variables:

```text
MONGODB_URI=your MongoDB Atlas connection string
JWT_SECRET=long random secret (32+ characters)
CLIENT_URL=https://YOUR-FRONTEND.vercel.app
MAX_FILE_SIZE=4194304
NODE_ENV=production
```

Deploy.

Test:

```text
https://YOUR-BACKEND.vercel.app/api/health
```

Expected result:

```json
{
  "ok": true,
  "service": "ProblemFinder API",
  "storage": "MongoDB"
}
```

## 3. Frontend Vercel project

Create a second Vercel project from the same GitHub repository.

Set:

```text
Root Directory: client
```

Add:

```text
VITE_API_URL=https://YOUR-BACKEND.vercel.app/api
```

Deploy.

The included `client/vercel.json` handles React Router SPA fallback.

## 4. CORS

After the frontend deployment URL is known, set the backend variable:

```text
CLIENT_URL=https://YOUR-FRONTEND.vercel.app
```

Then redeploy the backend.

Do not include a trailing slash unless the application is changed to normalize it.

## 5. Digital Locker

Uploaded documents are stored as binary data in MongoDB, not in Vercel's local filesystem.

The upload limit is 4 MB because Vercel currently documents a 4.5 MB Function payload limit. For larger files, use object storage/direct client uploads instead.

## 6. Never upload secrets

Do not commit:

```text
server/.env
client/.env
```

Only the `.env.example` files belong in the repository.

Configure real values in Vercel Environment Variables.
