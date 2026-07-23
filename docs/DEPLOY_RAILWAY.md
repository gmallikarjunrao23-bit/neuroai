# 🚀 LegisBot — Railway Deployment Guide

## 📋 Prerequisites

1. **GitHub Account** — [github.com](https://github.com)
2. **Railway Account** — [railway.com](https://railway.com) (sign up with GitHub)
3. **PostgreSQL Plugin** — Available on Railway

---

## 🎯 Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
# From the legisbot directory
cd /home/user/legisbot

# Create GitHub repo (do this on GitHub website first)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/legisbot.git
git branch -M main
git commit -m "Initial commit: LegisBot AI Legal Document Platform"
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to **[Railway Dashboard](https://railway.com/dashboard)**
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `legisbot` repository
4. Click **"Add Variables"** → **"Add Plugin"** → **"PostgreSQL"**
5. Railway will auto-detect the repo structure

### Step 3: Configure Services

Railway will detect monorepo. Create **two services**:

#### Service 1: Frontend (Next.js)

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Start Command** | `npx next start -p $PORT` |
| **HTTP Port** | `$PORT` (auto) |

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://legisbot-backend.up.railway.app
```

#### Service 2: Backend (FastAPI)

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Health Check Path** | `/health` |
| **HTTP Port** | `$PORT` (auto) |

**Environment Variables:**
```
SECRET_KEY=<generate-a-random-secret-key>
DATABASE_URL=<auto-filled-by-postgresql-plugin>
OPENAI_API_KEY=sk-...  (optional)
RAILWAY_PUBLIC_DOMAIN=legisbot-backend.up.railway.app
```

> 💡 **DATABASE_URL** will be auto-filled when you add the PostgreSQL plugin

### Step 4: Get the PostgreSQL URL

Railway auto-injects the `DATABASE_URL` when you add the PostgreSQL plugin. 
The URL format will be: `postgresql://user:pass@host:port/railway`

**Important:** The backend uses `asyncpg` driver. Replace `postgresql://` with `postgresql+asyncpg://` in the variable:
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/railway
```

### Step 5: Generate Secret Key

```bash
# Run this locally to generate a secure key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and set it as `SECRET_KEY` variable in the backend service.

### Step 6: Add Domain (Optional)

1. Go to **Frontend Service** → **Settings** → **Domains**
2. Click **"Generate Domain"** — Railway gives you `*.up.railway.app` domain
3. (Optional) Add custom domain like `legisbot.com`

### Step 7: Deploy!

1. Click **"Deploy"**
2. Watch the logs for each service
3. Once both services show **"Running"**, click on the frontend URL
4. 🎉 **Your LegisBot is LIVE!**

---

## 🔧 Environment Variables Reference

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL (e.g., `https://backend.up.railway.app`) |
| `NEXT_PUBLIC_APP_URL` | ❌ | Frontend URL (auto-detected) |

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | ✅ | Random 32+ char string for JWT signing |
| `DATABASE_URL` | ✅ | PostgreSQL connection string with `+asyncpg` |
| `OPENAI_API_KEY` | ❌ | OpenAI API key for AI generation (falls back to templates) |
| `RAILWAY_PUBLIC_DOMAIN` | ❌ | Backend domain (for CORS) |
| `RAZORPAY_KEY_ID` | ❌ | Razorpay payment gateway |
| `RAZORPAY_KEY_SECRET` | ❌ | Razorpay secret |
| `AI_MODEL` | ❌ | Default: `gpt-4o` |

---

## 🔄 Updating Deployment

```bash
# Make changes, then:
git add .
git commit -m "Update feature"
git push
```

Railway auto-deploys on every push to the connected branch! 🚀

---

## 🐛 Troubleshooting

### Frontend shows blank page
- Check browser console → CORS errors?
- Verify `NEXT_PUBLIC_API_URL` matches the backend domain
- Run `curl https://your-backend.up.railway.app/health`

### Backend won't start
- Check logs in Railway dashboard
- Verify `DATABASE_URL` has correct format with `+asyncpg`
- Ensure `SECRET_KEY` is set
- Try: `DATABASE_URL=sqlite+aiosqlite:///./test.db` for quick testing

### Database connection fails
- Make sure PostgreSQL plugin is added
- Replace `postgresql://` with `postgresql+asyncpg://` in DATABASE_URL
- Check if Railway PostgreSQL is in the same region

---

## 📊 Monitoring & Logs

- **Logs**: Railway Dashboard → Service → Logs tab
- **Metrics**: Railway Dashboard → Service → Metrics tab
- **Deployments**: Railway Dashboard → Service → Deployments tab

---

## 💰 Pricing

Railway free tier includes:
- **$5 credit** per month (enough for small apps)
- **PostgreSQL** (up to 100MB free)
- **1 GB RAM** per service

LegisBot on free tier: ~$2-3/month (frontend + backend + database)

---

<div align="center">
  <p>Need help? Contact: hello@legisbot.com</p>
  <p><strong>Happy deploying! 🚀⚖️</strong></p>
</div>
