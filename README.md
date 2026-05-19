# Cynex

React + Express department website with MongoDB-backed authentication.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example` and update these values:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/cynex
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
ADMIN_EMAILS=professor@example.com,hod@example.com
```

3. Add professor/admin emails to `ADMIN_EMAILS`. New accounts using those emails are redirected to the admin dashboard after login.

4. Add SMTP values in `.env` to send password reset emails. Without SMTP, the backend prints the reset link in the server console for local development.

5. Run the frontend and backend in separate terminals:

```bash
npm run dev
npm run dev:server
```

## API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET /api/materials`
- `POST /api/materials` (admin only, accepts optional `file` upload)
- `DELETE /api/materials/:id` (admin only)

Uploaded files are stored locally in `server/uploads/materials`. Supported upload formats are PDF, PPT, and PPTX up to 25 MB.
