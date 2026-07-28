# Smart Shuttle — Production Deployment Guide

## Prerequisites

- **Ubuntu 22.04/24.04 VPS** (min 2GB RAM, 2 vCPUs, 20GB SSD)
- **Domain** pointing to your VPS IP (A record)
- **Supabase project** (Pro tier at minimum for production)
- **GitHub repository** with your code

## Architecture

```
Internet
   │
   ▼
Nginx (443 SSL) ─── Let's Encrypt
   │
   ├── / → Frontend Container (port 3000)
   ├── /api → Backend Container (port 5000)
   └── /socket.io → Backend (WebSocket)

Backend → Supabase Cloud (PostgreSQL, Auth, Storage, Realtime)
```

## Step 1: Provision the VPS

SSH into your VPS and run the automated setup:

```bash
# Set your variables
export DOMAIN=smart-shuttle.yourdomain.com
export ADMIN_EMAIL=admin@yourdomain.com
export REPO_URL=https://github.com/your-org/smart-shuttle.git

# Run setup script
bash infra/scripts/setup-vps.sh
```

This script will:
- Install Docker, Nginx, and Certbot
- Configure UFW firewall (SSH + HTTP/HTTPS only)
- Clone the repository to `/opt/smart-shuttle`
- Create `backend/.env` with a random QR_SECRET
- Obtain Let's Encrypt SSL certificate
- Configure Nginx reverse proxy
- Build and start Docker containers

## Step 2: Configure Supabase Credentials

Edit `/opt/smart-shuttle/backend/.env` with your Supabase project credentials:

```bash
nano /opt/smart-shuttle/backend/.env
```

Required values from [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api):

| Variable | Where to find |
|----------|---------------|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key (**keep secret!**) |
| `DATABASE_URL` | Project Settings → Database → Connection string (URI) — use **Pooling** connection |
| `FRONTEND_URL` | Set to `https://your-domain.com` |

Also create `/opt/smart-shuttle/.env` for the frontend build:

```bash
nano /opt/smart-shuttle/.env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The `anon` key is found next to the `service_role` key in Supabase API settings.

## Step 3: Run Database Migrations

Connect to your Supabase PostgreSQL and apply Prisma migrations:

```bash
cd /opt/smart-shuttle
docker compose run --rm backend npx prisma migrate deploy
```

This requires the `DATABASE_URL` to be correctly set in `backend/.env`.

## Step 4: Deploy

```bash
cd /opt/smart-shuttle

# Full deploy (build + start)
bash infra/scripts/deploy.sh --build
```

## Step 5: Verify

Check that everything is running:

```bash
# Check container status
docker compose ps

# Run health checks
bash infra/scripts/diagnostics.sh check

# View logs
bash infra/scripts/diagnostics.sh logs
```

Then visit:

| URL | What |
|-----|------|
| `https://your-domain.com` | Frontend app |
| `https://your-domain.com/api/health` | Backend health check |
| `https://your-domain.com/api-docs` | Swagger API docs |

## Daily Operations

### Monitoring

```bash
# Quick health check
bash infra/scripts/diagnostics.sh check

# Deep container inspection
bash infra/scripts/diagnostics.sh inspect

# Tail logs in real-time
bash infra/scripts/diagnostics.sh logs
```

### Updates

```bash
cd /opt/smart-shuttle

# Pull latest code and redeploy
git pull
bash infra/scripts/deploy.sh --build
```

### Database Backup

```bash
bash infra/scripts/diagnostics.sh backup
```

For full Supabase backup, use the Supabase Dashboard:
- Project Settings → Database → Database Backup → Create backup

### Cleanup

```bash
# Remove unused Docker images, containers, build cache
bash infra/scripts/diagnostics.sh cleanup
```

## Rollback

If a deployment fails, roll back to the previous version:

```bash
bash infra/scripts/deploy.sh --rollback
```

For a full rollback (including database), restore from Supabase backup first.

## SSL Renewal

Certbot auto-renewal is configured by default. Test it:

```bash
certbot renew --dry-run
```

To force renewal:

```bash
certbot renew
systemctl reload nginx
```

## Troubleshooting

### "Container exited with code 1"

Check logs:

```bash
docker compose logs backend --tail=50
```

Common causes:
- `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` missing → backend crashes at startup
- `DATABASE_URL` invalid → Prisma connection fails
- Port 5000 already in use → check `lsof -i :5000`

### "502 Bad Gateway" from Nginx

The backend container might be down or not listening on port 5000:

```bash
docker compose ps
docker compose logs backend
curl http://localhost:5000/api/health
```

### WebSocket not working (real-time GPS)

Ensure `/socket.io` is proxied in Nginx with upgrade headers. The provided config in `infra/nginx/smart-shuttle.conf` handles this correctly.

### CORS errors

The backend's CORS config uses `FRONTEND_URL`. Ensure it's set to `https://your-domain.com` (no trailing slash).

### Permission denied on uploads

```bash
# Uploads are stored in a Docker volume
# Ensure the volume has correct ownership
docker compose exec backend ls -la /app/uploads
```

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is kept secret (never exposed to frontend)
- [ ] `QR_SECRET` changed from default value
- [ ] Backend ports bind to `127.0.0.1` only (handled by `infra/docker-compose.prod.yml`)
- [ ] Nginx returns 404 for `.env`, `.git`, and other sensitive paths
- [ ] UFW firewall allows only SSH (22) and Nginx Full (80, 443)
- [ ] HTTPS enforced (HTTP → 301 redirect)
- [ ] HSTS enabled
- [ ] Regular SSL renewal verified (`certbot renew --dry-run`)

## Resource Limits

The production Compose override (`infra/docker-compose.prod.yml`) sets:

| Service | Memory | CPU |
|---------|--------|-----|
| Backend | 512 MB limit / 256 MB reserved | 0.75 limit / 0.25 reserved |
| Frontend | 128 MB limit / 64 MB reserved | 0.25 limit / 0.10 reserved |

Adjust as needed based on traffic.

## Files Reference

| File | Purpose |
|------|---------|
| `infra/docker-compose.prod.yml` | Production overrides (ports, limits, logging) |
| `infra/nginx/smart-shuttle.conf` | Nginx reverse proxy config |
| `infra/scripts/deploy.sh` | Deployment script (build, health check, rollback) |
| `infra/scripts/setup-vps.sh` | First-time VPS provisioning |
| `infra/scripts/diagnostics.sh` | Monitoring, logs, backup, cleanup |
| `infra/.env.production` | Environment variable template |
