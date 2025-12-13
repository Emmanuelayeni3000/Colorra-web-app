# Render Deployment

This backend is configured for deployment on [Render](https://render.com).

## Quick Deploy

1. Push your code to GitHub
2. Connect your repo to Render
3. Render will auto-detect `render.yaml` and configure the service

## Manual Setup

If not using the Blueprint, configure these settings in Render Dashboard:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |

## Environment Variables

Set these in Render Dashboard → Environment:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase connection string (port 6543) |
| `DIRECT_URL` | Supabase direct connection (port 5432) |
| `JWT_SECRET` | Random secret for JWT tokens |
| `FRONTEND_URL` | Your Vercel frontend URL |
| `RESEND_API_KEY` | Resend API key for emails |
| `FROM_EMAIL` | Sender email address |

> **Note**: `NODE_ENV` is automatically set to `production` by Render.
