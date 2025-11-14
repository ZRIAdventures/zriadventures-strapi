#!/bin/bash

# ZRI Adventures Strapi - Docker Deployment Script
# Usage: ./docker-deploy.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
DEV_COMPOSE_FILE="docker-compose.dev.yml"
ENV_FILE=".env"
ENV_EXAMPLE=".env.docker.example"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    log_info "Docker and Docker Compose are installed."
}

check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        log_warn ".env file not found. Creating from example..."
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        log_warn "Please update .env with your configuration before deploying."
        exit 1
    fi
    log_info "Environment file found."
}

generate_secrets() {
    log_info "Generating secret keys..."

    APP_KEY1=$(openssl rand -base64 32)
    APP_KEY2=$(openssl rand -base64 32)
    APP_KEY3=$(openssl rand -base64 32)
    APP_KEY4=$(openssl rand -base64 32)
    API_TOKEN_SALT=$(openssl rand -base64 32)
    ADMIN_JWT_SECRET=$(openssl rand -base64 32)
    TRANSFER_TOKEN_SALT=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 32)

    log_info "Generated secrets:"
    echo "APP_KEYS=$APP_KEY1,$APP_KEY2,$APP_KEY3,$APP_KEY4"
    echo "API_TOKEN_SALT=$API_TOKEN_SALT"
    echo "ADMIN_JWT_SECRET=$ADMIN_JWT_SECRET"
    echo "TRANSFER_TOKEN_SALT=$TRANSFER_TOKEN_SALT"
    echo "JWT_SECRET=$JWT_SECRET"

    log_warn "Please add these to your .env file!"
}

dev_start() {
    log_info "Starting development environment..."
    check_docker
    check_env
    docker-compose -f "$DEV_COMPOSE_FILE" up -d
    log_info "Development environment started!"
    log_info "Access Strapi at: http://localhost:1337/admin"
}

dev_stop() {
    log_info "Stopping development environment..."
    docker-compose -f "$DEV_COMPOSE_FILE" down
    log_info "Development environment stopped."
}

dev_logs() {
    docker-compose -f "$DEV_COMPOSE_FILE" logs -f
}

prod_build() {
    log_info "Building production Docker image..."
    check_docker
    docker-compose -f "$COMPOSE_FILE" build --no-cache --pull
    log_info "Production image built successfully!"
}

prod_start() {
    log_info "Starting production environment..."
    check_docker
    check_env

    # Validate required environment variables
    source "$ENV_FILE"

    if [ -z "$DATABASE_PASSWORD" ] || [ "$DATABASE_PASSWORD" == "your-secure-database-password-here" ]; then
        log_error "Please set DATABASE_PASSWORD in .env file!"
        exit 1
    fi

    if [ -z "$ADMIN_JWT_SECRET" ] || [ "$ADMIN_JWT_SECRET" == "toBeModified" ]; then
        log_error "Please generate and set secrets in .env file! Run: ./docker-deploy.sh secrets"
        exit 1
    fi

    docker-compose -f "$COMPOSE_FILE" up -d
    log_info "Production environment started!"
    log_info "Waiting for services to be healthy..."
    sleep 10

    # Check health
    if curl -f http://localhost:1337/_health > /dev/null 2>&1; then
        log_info "Strapi is healthy and running!"
    else
        log_warn "Strapi may still be starting. Check logs with: ./docker-deploy.sh logs"
    fi
}

prod_stop() {
    log_info "Stopping production environment..."
    docker-compose -f "$COMPOSE_FILE" down
    log_info "Production environment stopped."
}

prod_restart() {
    log_info "Restarting production environment..."
    docker-compose -f "$COMPOSE_FILE" restart
    log_info "Production environment restarted."
}

show_logs() {
    docker-compose -f "$COMPOSE_FILE" logs -f
}

show_status() {
    log_info "Container status:"
    docker-compose -f "$COMPOSE_FILE" ps

    log_info "\nResource usage:"
    docker stats --no-stream
}

backup_db() {
    log_info "Backing up database..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker exec zri-strapiDB-prod pg_dump -U strapi strapi > "$BACKUP_FILE"
    log_info "Database backed up to: $BACKUP_FILE"
}

restore_db() {
    if [ -z "$1" ]; then
        log_error "Please provide backup file: ./docker-deploy.sh restore <backup.sql>"
        exit 1
    fi

    log_warn "This will restore the database from: $1"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" == "yes" ]; then
        log_info "Restoring database..."
        docker exec -i zri-strapiDB-prod psql -U strapi -d strapi < "$1"
        log_info "Database restored successfully!"
    else
        log_info "Restore cancelled."
    fi
}

cleanup() {
    log_warn "This will remove all containers, volumes, and data. This cannot be undone!"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" == "yes" ]; then
        log_info "Cleaning up..."
        docker-compose -f "$COMPOSE_FILE" down -v
        docker-compose -f "$DEV_COMPOSE_FILE" down -v
        log_info "Cleanup complete."
    else
        log_info "Cleanup cancelled."
    fi
}

update() {
    log_info "Updating production environment..."

    # Pull latest code
    git pull

    # Build new image
    prod_build

    # Backup database
    backup_db

    # Restart with new image
    docker-compose -f "$COMPOSE_FILE" up -d --no-deps strapi

    log_info "Update complete!"
}

show_help() {
    cat << EOF
ZRI Adventures Strapi - Docker Deployment Script

Usage: ./docker-deploy.sh [command]

Commands:
  Development:
    dev:start       Start development environment
    dev:stop        Stop development environment
    dev:logs        Show development logs

  Production:
    build           Build production Docker image
    start           Start production environment
    stop            Stop production environment
    restart         Restart production environment
    logs            Show production logs
    status          Show container status and resource usage

  Database:
    backup          Backup PostgreSQL database
    restore <file>  Restore database from backup file

  Utilities:
    secrets         Generate secret keys
    update          Pull latest code and update production
    cleanup         Remove all containers and volumes (WARNING: deletes data!)
    check           Check Docker installation
    help            Show this help message

Examples:
  ./docker-deploy.sh dev:start
  ./docker-deploy.sh build
  ./docker-deploy.sh start
  ./docker-deploy.sh backup
  ./docker-deploy.sh restore backup_20241103.sql

EOF
}

# Main
case "$1" in
    dev:start)
        dev_start
        ;;
    dev:stop)
        dev_stop
        ;;
    dev:logs)
        dev_logs
        ;;
    build)
        prod_build
        ;;
    start)
        prod_start
        ;;
    stop)
        prod_stop
        ;;
    restart)
        prod_restart
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db "$2"
        ;;
    secrets)
        generate_secrets
        ;;
    update)
        update
        ;;
    cleanup)
        cleanup
        ;;
    check)
        check_docker
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
