# Production Deployment Guide: Knottiingale

This project is a full-stack e-commerce application (Vite React SPA + Express TypeScript API + MongoDB Atlas). It is pre-configured for instant deployment on all major hosting providers with zero configuration overhead.

---

## Architecture Overview

| Component | Technology | Recommended Host | Configuration File |
| :--- | :--- | :--- | :--- |
| **Backend API** | Node.js, Express, Docker | **Render** or **Railway** | `render.yaml`, `backend/Dockerfile`, `backend/railway.toml` |
| **Frontend SPA** | React 19, Vite, Tailwind CSS | **Vercel**, **Render**, or **Netlify** | `frontend/vercel.json`, `frontend/netlify.toml`, `frontend/public/_redirects` |
| **Database** | MongoDB Atlas | MongoDB Cloud | Hosted on Atlas (No change needed) |

---

## Method 1: Render All-In-One (Fastest & 100% Free)

You can launch both the **Backend Web Service** and **Frontend Static Site** in one step using the included Render Blueprint (`render.yaml`).

### Step 1: Push latest code to GitHub
Make sure your GitHub repository (`shrutirai29/shikha`) is up to date:
```bash
git push origin master
```

### Step 2: Create Blueprint on Render
1. Go to [dashboard.render.com](https://dashboard.render.com) and log in with your GitHub account.
2. Click **New +** (top right) and select **Blueprint**.
3. Select your repository `shrutirai29/shikha`.
4. Render will automatically read `render.yaml` and discover two services:
   - `knottiingale-backend` (Docker Web Service)
   - `knottiingale-frontend` (Static Site)
5. Fill in the required environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `CLIENT_URL`: Enter your temporary frontend URL or leave blank until frontend generates (you can update it right after).
6. Click **Apply**. Render will build and deploy both services!

### Step 3: Connect Frontend & Backend
1. Once deployed, copy your backend URL (e.g., `https://knottiingale-backend.onrender.com`).
2. Go to **knottiingale-frontend** -> **Environment** -> Set:
   ```env
   VITE_API_URL=https://knottiingale-backend.onrender.com
   ```
3. Copy your frontend URL (e.g., `https://knottiingale-frontend.onrender.com`).
4. Go to **knottiingale-backend** -> **Environment** -> Set:
   ```env
   CLIENT_URL=https://knottiingale-frontend.onrender.com
   ```
5. Trigger manual redeploy on both (or click "Clear cache and deploy").

---

## Method 2: Vercel (Frontend) + Render / Railway (Backend) — Recommended for Best Performance

Vercel provides the fastest global CDN for the React frontend, while Render or Railway hosts the Express API.

### Deploy Frontend to Vercel (2 Minutes)
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New..."** -> **"Project"**.
3. Find and import `shrutirai29/shikha`.
4. Configure the project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: Click "Edit" and choose `frontend`.
   - **Build Command**: `npm run build` (Default)
   - **Output Directory**: `dist` (Default)
5. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://<your-backend-url>
   ```
   *(e.g., `https://knottiingale-backend.onrender.com` or `https://shikha-backend.up.railway.app`)*
6. Click **Deploy**. Vercel will build and assign you a free HTTPS domain (e.g., `https://shikha-crochet.vercel.app`).
   *(SPA routing fallback is handled automatically via `frontend/vercel.json`)*.

---

## Method 3: Deploy Backend to Railway

Railway provides high-speed Docker builds and generous compute limits.

### Via Web Dashboard
1. Go to [railway.app](https://railway.app) and log in with GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select `shrutirai29/shikha`.
4. Go to **Settings**:
   - **Root Directory**: `backend`
   - Railway will automatically detect `backend/Dockerfile` and `backend/railway.toml`.
5. Under **Variables**, add your production secrets (see Checklist below).
6. Under **Networking**, click **Generate Domain** (gives you `https://<name>.up.railway.app`).

### Via Railway CLI (Locally)
```bash
railway login
cd backend
railway init
railway up
```

---

## Method 4: Deploy Frontend to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign in.
2. Click **"Add new site"** -> **"Import an existing project"** -> **GitHub**.
3. Select `shrutirai29/shikha`.
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://<your-backend-url>
   ```
6. Click **Deploy Shikha**.
   *(SPA rewrites are pre-configured in `frontend/netlify.toml` and `frontend/public/_redirects`)*.

---

## Production Environment Variables Checklist

### Backend Service (Render / Railway)
| Variable | Value / Description | Required? |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | **Yes** |
| `PORT` | `5000` | **Yes** |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/shikha` | **Yes** |
| `JWT_SECRET` | Strong random string ($\ge 16$ characters) | **Yes** |
| `JWT_REFRESH_SECRET` | Strong random string ($\ge 16$ characters) | **Yes** |
| `CLIENT_URL` | Deployed frontend URL (e.g. `https://knottiingale.vercel.app`) | **Yes** (CORS) |
| `COOKIE_SECRET` | Strong random string (e.g. 32 characters) | Optional |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for product image hosting | Optional (defaults to MongoDB base64) |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Optional |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | Optional (for online payments) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | Optional |
| `RAZORPAY_WEBHOOK_SECRET`| Razorpay Webhook Secret | Optional |
| `SMTP_HOST` | e.g. `smtp.gmail.com` | Optional (for order emails) |
| `SMTP_PORT` | `587` | Optional |
| `SMTP_USER` | Email user | Optional |
| `SMTP_PASS` | Email app password | Optional |
| `EMAIL_FROM` | Sender display email | Optional |

### Frontend Static Site (Vercel / Netlify / Render)
| Variable | Value / Description |
| :--- | :--- |
| `VITE_API_URL` | URL of your deployed backend (e.g., `https://knottiingale-backend.onrender.com` or `https://shikha.up.railway.app`). |

---

## Post-Launch Verification

1. **Verify Backend Health**:
   Open `https://<your-backend-url>/` in your browser. You should see:
   ```json
   {
     "success": true,
     "message": "Shikha E-Commerce API is running",
     "environment": "production"
   }
   ```
2. **Verify Sitemap & SEO**:
   Open `https://<your-backend-url>/sitemap.xml`. It should return your active products and categories in standard XML format.
3. **Verify Frontend**:
   Open your frontend URL. Test loading the homepage, browsing products, opening a product detail page, and signing in.
4. **Custom Domain (Optional)**:
   Add your domain (e.g., `knottiingale.com`) under Vercel / Render **Domains** tab and add the CNAME / A records to your DNS provider.
