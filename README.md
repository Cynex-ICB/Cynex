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
```

3. Add SMTP values in `.env` to send password reset emails. Without SMTP, the backend prints the reset link in the server console for local development.

4. Run the frontend and backend in separate terminals:

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
- `GET /api/features`
