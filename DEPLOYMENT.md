# Deploying Shikha

The app has two deployable parts:

1. **Backend** (`backend/`) — Express + MongoDB API. Deploys as a Docker
   container (see `backend/Dockerfile`, `backend/railway.toml`, `render.yaml`).
2. **Frontend** (`frontend/`) — static React SPA. Deploys to any static host
   (Vercel, Netlify) with `frontend/vercel.json` / `frontend/netlify.toml`.

MongoDB stays on Atlas — the backend only needs `MONGODB_URI`.

---

## 1. Backend — Railway (recommended)

The Railway CLI is already installed locally.

```bash
railway login                       # opens browser to authenticate
cd backend
railway init                        # pick or create a project
railway up                          # builds the Dockerfile and deploys
```

Then set the environment variables in the Railway dashboard (Project → Variables):

```
NODE_ENV=production
MONGODB_URI=<your Atlas connection string>
JWT_SECRET=<random long string>
JWT_REFRESH_SECRET=<random long string>
CLIENT_URL=https://<your-frontend-domain>
RAZORPAY_KEY_ID=      # optional until payments go live
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
CLOUDINARY_CLOUD_NAME=   # optional
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=             # optional (emails log to console without SMTP)
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

Note: `backend/.env` is gitignored and **never deployed** — production
variables come only from the host's environment. Verify the deploy:
`curl https://<your-app>.up.railway.app/` should return
`{"success":true,...}`.

Alternatively, Render: create a new **Web Service**, point it at this repo,
runtime **Docker**, Dockerfile path `./backend/Dockerfile`, and add the same
env vars (`render.yaml` is included as a blueprint).

## 2. Frontend — Vercel or Netlify

The SPA must know where the backend lives at build time:

| Host  | Config                   | Env var            |
| ----- | ------------------------ | ------------------ |
| Vercel| `frontend/vercel.json` (included) | `VITE_API_URL` |
| Netlify| `frontend/netlify.toml` (included) | `VITE_API_URL` |

**Vercel:** import the repo, root directory `frontend`, add the env var:

```
VITE_API_URL=https://<your-backend>.up.railway.app
```

**Netlify:** build command `npm run build` (root dir `frontend`), publish dir
`dist`, same `VITE_API_URL` env var.

## 3. After deploy

- Set the backend `CLIENT_URL` to the frontend domain so CORS allows the
  browser (credentials mode) to call the API.
- Create a coupon, upload product images, and place a test COD order.
- To go live with payments, replace the Razorpay **test** keys in the backend
  env with **live** keys and register the webhook URL:
  `https://<your-backend>/api/payments/webhook`.
