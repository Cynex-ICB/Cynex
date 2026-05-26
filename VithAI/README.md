# VithAI

Full-stack aptitude assessment platform for placement and interview preparation.

## Stack

- React.js + React Router + Tailwind CSS
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcrypt
- NVIDIA NIM / OpenAI-compatible API for AI question generation

## Setup

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Configure environment:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Set `MONGODB_URI`, `JWT_SECRET`, and your NVIDIA NIM settings in `server/.env`.

```bash
AI_PROVIDER=nvidia
NVIDIA_NIM_API_KEY=your_nim_key
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_MODEL=minimaxai/minimax-m2.7
AI_USE_RESPONSE_FORMAT=false
AI_DEFAULT_GENERATION_MODE=fast
AI_BATCH_SIZE=5
AI_BATCH_CONCURRENCY=2
AI_TIMEOUT_MS=120000
AI_FILE_CONTEXT_CHARS=5000
```

4. Run VithAI:

```bash
npm run dev
```

Client: `http://localhost:5173`

Server: `http://localhost:5000`

## AI Generation

The admin form is dropdown-driven. The backend constructs the fixed prompt privately, optionally adds uploaded PDF/DOCX/TXT context, calls the configured NVIDIA NIM/OpenAI-compatible chat completion endpoint through the OpenAI SDK, validates returned JSON, and saves the assessment plus questions.

Admins can choose `Fast` or `AI Enhanced` during assessment creation. `Fast` returns an editable aptitude draft immediately. `AI Enhanced` calls NVIDIA NIM and runs in small parallel batches.

## Production

Build the VithAI client with:

```bash
npm run build
```

The Express server serves `client/dist` in production.
