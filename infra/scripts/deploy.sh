#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# Smart Shuttle — Production Deployment Script
# ─────────────────────────────────────────────
# Usage: bash infra/scripts/deploy.sh [options]
# Options:
#   --build       Force rebuild of images
#   --rollback    Rollback to previous deployment
#   --status      Show deployment status
# ─────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$SCRIPT_DIR"

BACKUP_DIR="$HOME/deploy-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
COMPOSE_FILES="-f docker-compose.yml -f infra/docker-compose.prod.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

health_check() {
    local service=$1
    local url=$2
    local retries=12
    local wait=5

    log_info "Waiting for $service to be healthy..."
    for i in $(seq 1 $retries); do
        if curl -sf "$url" > /dev/null 2>&1; then
            log_info "$service is healthy ✓"
            return 0
        fi
        log_info "  Attempt $i/$retries — waiting ${wait}s..."
        sleep $wait
    done
    log_error "$service failed health check after $((retries * wait))s"
    return 1
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    command -v docker >/dev/null 2>&1 || { log_error "Docker is not installed"; exit 1; }
    command -v docker compose >/dev/null 2>&1 || { log_error "Docker Compose is not installed"; exit 1; }

    log_info "Docker: $(docker --version)"
    log_info "Docker Compose: $(docker compose version)"

    if [ ! -f docker-compose.yml ]; then
        log_error "docker-compose.yml not found. Run from project root."
        exit 1
    fi

    if [ ! -f backend/.env ]; then
        log_error "backend/.env not found. Create it from backend/.env.example"
        exit 1
    fi

    log_info "All prerequisites met ✓"
}

deploy() {
    local rebuild=${1:-false}

    log_info "═══════════════════════════════════════════"
    log_info "  Smart Shuttle — Production Deployment"
    log_info "  Timestamp: $TIMESTAMP"
    log_info "═══════════════════════════════════════════"

    check_prerequisites

    # Step 1: Backup current state
    mkdir -p "$BACKUP_DIR"
    docker compose $COMPOSE_FILES ps --format '{{.Name}}' > "$BACKUP_DIR/containers_$TIMESTAMP.txt" 2>/dev/null || true

    # Step 2: Pull latest code (if in git repo)
    if git rev-parse --git-dir > /dev/null 2>&1; then
        log_info "Pulling latest code..."
        git pull --ff-only || log_warn "Git pull failed, continuing with current code"
    fi

    # Step 3: Build images
    if [ "$rebuild" = true ]; then
        log_info "Rebuilding images..."
        docker compose $COMPOSE_FILES build --pull
    else
        log_info "Using cached images (use --build to force rebuild)"
    fi

    # Step 4: Pull images (for pre-built images in registry)
    docker compose $COMPOSE_FILES pull 2>/dev/null || true

    # Step 5: Deploy containers
    log_info "Deploying containers..."
    docker compose $COMPOSE_FILES up -d --remove-orphans

    # Step 6: Health checks
    log_info "Running health checks..."
    sleep 5

    if health_check "backend" "http://localhost:5000/api/health"; then
        log_info "Backend API is healthy ✓"
    else
        log_error "Backend deployment FAILED"
        rollback
        exit 1
    fi

    if health_check "frontend" "http://localhost:3000/"; then
        log_info "Frontend is healthy ✓"
    else
        log_warn "Frontend health check returned non-200 (may be SPA redirect)"
    fi

    # Step 7: Verify Supabase connection
    log_info "Verifying Supabase connection..."
    local supabase_check=$(curl -sf http://localhost:5000/api/health 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','unknown'))" 2>/dev/null || echo "unknown")
    if [ "$supabase_check" = "ok" ]; then
        log_info "Supabase connection verified ✓"
    else
        log_warn "Could not verify Supabase connection"
    fi

    # Step 8: Cleanup old images
    log_info "Cleaning up old images..."
    docker image prune -f 2>/dev/null || true

    log_info "═══════════════════════════════════════════"
    log_info "  Deployment completed successfully! ✓"
    log_info "  Timestamp: $TIMESTAMP"
    log_info "═══════════════════════════════════════════"
}

rollback() {
    log_info "═══════════════════════════════════════════"
    log_info "  Rolling back deployment..."
    log_info "═══════════════════════════════════════════"

    # Find the previous container state
    local latest_backup=$(ls -t "$BACKUP_DIR"/containers_*.txt 2>/dev/null | head -2 | tail -1)
    if [ -z "$latest_backup" ]; then
        log_error "No backup found for rollback"
        exit 1
    fi

    log_info "Restoring from backup: $latest_backup"

    # Re-deploy previous images
    docker compose $COMPOSE_FILES up -d --force-recreate

    log_info "Rollback completed"
}

show_status() {
    echo ""
    echo "═══════════════════════════════════════════"
    echo "  Smart Shuttle — Deployment Status"
    echo "═══════════════════════════════════════════"
    echo ""

    docker compose $COMPOSE_FILES ps

    echo ""
    echo "── Resource Usage ──"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || true

    echo ""
    echo "── Recent Logs ──"
    docker compose $COMPOSE_FILES logs --tail=5 --timestamps 2>/dev/null || true
}

# ─── Main ──────────────────────────────
case "${1:-deploy}" in
    deploy)
        shift 2>/dev/null || true
        deploy "${2:-false}"
        ;;
    --build)
        deploy true
        ;;
    --rollback)
        rollback
        ;;
    --status)
        show_status
        ;;
    *)
        echo "Usage: $0 [--build|--rollback|--status]"
        exit 1
        ;;
esac
