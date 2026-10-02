# ProblemFinder — All-in-One Productivity Platform

ProblemFinder is a full-stack productivity workspace with React/Vite on the frontend and Node.js/Express on the backend.

> **Local-first version:** for easy localhost testing, this build uses **JSON files as the database** instead of MongoDB. Your data is stored in `server/data/*.json`. MongoDB/Mongoose can be added later as a production upgrade.

## Features
- JWT login/register with bcrypt password hashing
- User-isolated private data
- Dashboard statistics and recent activity
- PlanIt plans and progress steps
- Digital Locker file upload/download/delete/edit using Multer
- TeamMate projects and tasks
- IdeaLab ideas
- LinkSpace bookmarks
- Global search
- Notifications
- Profile and password settings
- Responsive SaaS UI

## Requirements
- Node.js 20+ recommended
- npm
- VS Code

**MongoDB is NOT required for this local JSON-storage version.**

## 1. Extract and open
Extract `ProblemFinder.zip`, then open the extracted `ProblemFinder` folder in VS Code.

## 2. Install dependencies
Open a terminal in the project root:

```bash
npm install
npm run install:all
```

## 3. Configure environment
Copy `.env.example` to `server/.env`.

Example:

```env
JWT_SECRET=use_a_long_random_secret_here
PORT=5000
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
```

Then copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Do not commit your real `server/.env` file.

## 4. Start the application
From the project root:

```bash
npm run dev
```

Or use two terminals:

### Terminal 1 — backend
```bash
npm run server
```

### Terminal 2 — frontend
```bash
npm run client
```

Open:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health

The health endpoint should show `"storage":"JSON"`.

## 5. Demo data
To create a ready-to-test account and demo records:

```bash
npm run seed
```

Demo login:

- Email: `demo@problemfinder.local`
- Password: `Demo1234`

The seed creates plans, projects/tasks, ideas, links and notifications. Upload your own file from Digital Locker to test file storage.

## JSON database
Local data is kept here:

```text
server/data/
├── users.json
├── plans.json
├── documents.json
├── projects.json
├── tasks.json
├── ideas.json
├── links.json
└── notifications.json
```

These files are automatically created and updated by the backend. If you delete a JSON file, the backend recreates it as an empty array on the next request/startup.

Uploaded files are stored in `server/uploads/`.

## API overview
Authentication:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PUT /api/auth/password`

Plans:
- `GET /api/plans`
- `POST /api/plans`
- `GET /api/plans/:id`
- `PUT /api/plans/:id`
- `DELETE /api/plans/:id`

Documents:
- `GET /api/documents`
- `POST /api/documents`
- `GET /api/documents/:id`
- `GET /api/documents/:id/download`
- `PUT /api/documents/:id`
- `DELETE /api/documents/:id`

Projects/tasks:
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:projectId/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Ideas, links and notifications have the CRUD endpoints described in the project source.

## Security
- Passwords are hashed with bcrypt.
- JWT authentication protects private API routes.
- Each private record is checked against the authenticated user.
- Document downloads require ownership.
- Uploads are limited by size and MIME type.
- JWT secret and other configuration values are environment variables.
- JSON files contain local development data and should not be publicly served.

## Troubleshooting
### Backend says MongoDB connection failed
That should no longer happen in this version. The backend does not call `mongoose.connect()` and does not require MongoDB.

If you still see the old MongoDB message, you are running an older extracted ZIP/folder. Download and extract the new ZIP again.

### Port already in use
Change `PORT` in `server/.env`, then change `VITE_API_URL` in `client/.env` to match the new backend port.

### Login fails
Run:

```bash
npm run seed
```

Then use the demo credentials above, or register a new account from the app.

### Data reset
Stop the backend and delete the desired files inside `server/data/`. They will be recreated as empty JSON arrays. Uploaded files can be removed from `server/uploads/`.

## Production note
JSON storage is intended for this first localhost/testing version. For a real multi-user production deployment, replace the JSON data layer with MongoDB/Mongoose or another persistent database and use cloud/object storage for uploaded files.
