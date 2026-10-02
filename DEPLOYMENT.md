# ProblemFinder deployment

This project is deployed as **two Vercel projects** because the frontend is a Vite SPA and the backend is an Express serverless function.

## 1. MongoDB Atlas
Create/select a MongoDB Atlas database named `problemfinder`.
Create a database user.
For a school/demo deployment, allow Vercel to connect by adding `0.0.0.0/0` in Atlas Network Access. Use a strong database password.

## 2. Backend on Vercel
Import this GitHub repository into Vercel.
Set the **Root Directory** to `server`.
Vercel will use `server/vercel.json`.

Environment Variables:
- `MONGODB_URI` = your Atlas connection string
- `JWT_SECRET` = a long random secret
- `CLIENT_URL` = your frontend Vercel URL, for example `https://problemfinder-frontend.vercel.app`
- `MAX_FILE_SIZE` = `10485760`

Deploy, then open:
`https://YOUR-BACKEND.vercel.app/api/health`

You should get JSON containing `ok: true` and `storage: "MongoDB"`.

## 3. Frontend on Vercel
Create a second Vercel project from the same GitHub repository.
Set **Root Directory** to `client`.

Environment Variable:
- `VITE_API_URL` = `https://YOUR-BACKEND.vercel.app/api`

Deploy.

## 4. Important
After the frontend URL is known, update the backend `CLIENT_URL` to that exact URL and redeploy the backend.

The Digital Locker files are stored in MongoDB as binary data, so uploads do not depend on Vercel's temporary filesystem.

Never commit `server/.env` or database credentials.
