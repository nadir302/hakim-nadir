#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# Smart Shuttle — First-time VPS Setup
# Run this ONCE on a fresh Ubuntu 22.04/24.04 VPS
# ─────────────────────────────────────────────
# Usage: bash infra/scripts/setup-vps.sh
# Prerequisites: Root or sudo access
# ─────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ─── Configuration ──────────────────────
DOMAIN="${DOMAIN:-}"
ADMIN_EMAIL="${ADMIN_EMAIL:-}"
REPO_URL="${REPO_URL:-}"

if [ -z "$DOMAIN" ] || [ -z "$ADMIN_EMAIL" ]; then
    echo ""
    echo "Before running, set these environment variables:"
    echo "  export DOMAIN=your-domain.com"
    echo "  export ADMIN_EMAIL=admin@your-domain.com"
    echo "  export REPO_URL=https://github.com/your-org/smart-shuttle.git"
    echo ""
    read -p "Domain (e.g., smart-shuttle.example.com): " DOMAIN
    read -p "Admin email (for Let's Encrypt): " ADMIN_EMAIL
    read -p "Git repository URL: " REPO_URL

    if [ -z "$DOMAIN" ] || [ -z "$ADMIN_EMAIL" ]; then
        log_error "Domain and admin email are required"
        exit 1
    fi
fi

log_info "═══════════════════════════════════════════"
log_info "  Smart Shuttle — VPS Provisioning"
log_info "  Domain: $DOMAIN"
log_info "═══════════════════════════════════════════"

# ─── Step 1: System updates ─────────────
log_info "1/8  Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ─── Step 2: Install dependencies ───────
log_info "2/8  Installing Docker + Nginx + Certbot..."
apt-get install -y -qq apt-transport-https ca-certificates curl software-properties-common nginx certbot python3-certbot-nginx

# Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -qq && apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

# ─── Step 3: Firewall ───────────────────
log_info "3/8  Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ─── Step 4: Clone repository ───────────
log_info "4/8  Cloning repository..."
if [ ! -d /opt/smart-shuttle ]; then
    mkdir -p /opt
    git clone "$REPO_URL" /opt/smart-shuttle
else
    log_info "  Repository already exists, pulling latest..."
    cd /opt/smart-shuttle && git pull --ff-only
fi
cd /opt/smart-shuttle

# ─── Step 5: Create .env files ──────────
log_info "5/8  Setting up environment files..."
if [ ! -f backend/.env ]; then
    cat > backend/.env <<-ENVEOF
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@aws-0-region.pooler.supabase.com:5432/postgres
QR_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=https://$DOMAIN
UPLOAD_DIR=uploads
ENVEOF
    log_warn "  !!! EDIT backend/.env with your actual Supabase credentials !!!"
else
    log_info "  backend/.env already exists"
fi

if [ ! -f .env ]; then
    log_warn "  !!! Create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY !!!"
fi

# ─── Step 6: SSL certificate ────────────
log_info "6/8  Obtaining SSL certificate..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$ADMIN_EMAIL" || log_warn "  SSL failed. Run manually: certbot --nginx -d $DOMAIN"

# ─── Step 7: Configure Nginx reverse proxy
log_info "7/8  Configuring Nginx reverse proxy..."
if [ -f infra/nginx/smart-shuttle.conf ]; then
    sed "s/your-domain\.com/$DOMAIN/g" infra/nginx/smart-shuttle.conf > /etc/nginx/sites-available/smart-shuttle
    ln -sf /etc/nginx/sites-available/smart-shuttle /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    log_info "  Nginx configured ✓"
else
    log_warn "  infra/nginx/smart-shuttle.conf not found, skipping"
fi

# ─── Step 8: Build and start containers ─
log_info "8/8  Building and starting Docker containers..."
docker compose -f docker-compose.yml -f infra/docker-compose.prod.yml build
docker compose -f docker-compose.yml -f infra/docker-compose.prod.yml up -d

# ─── Verify ──────────────────────────────
sleep 5
echo ""
log_info "═══════════════════════════════════════════"
log_info "  Setup complete!"
log_info ""
log_info "  Your site: https://$DOMAIN"
log_info "  Health:    https://$DOMAIN/api/health"
log_info "  API Docs:  https://$DOMAIN/api-docs"
log_info ""
log_info "  Next steps:"
log_info "  1. Edit /opt/smart-shuttle/backend/.env with Supabase credentials"
log_info "  2. Edit /opt/smart-shuttle/.env with VITE_SUPABASE_*"
log_info "  3. Run: cd /opt/smart-shuttle && bash infra/scripts/deploy.sh --build"
log_info "  4. Set up automatic renewals: certbot renew --dry-run"
log_info "═══════════════════════════════════════════"
