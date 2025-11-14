# Docker Deployment Guide for ZRI Adventures Strapi

This guide covers deploying ZRI Adventures Strapi CMS using Docker and Docker Compose for both development and production environments.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- 10GB+ disk space

## 🏗️ Project Structure

```
.
├── Dockerfile              # Development Dockerfile
├── Dockerfile.prod         # Production Dockerfile
├── docker-compose.yml      # Production compose file
├── docker-compose.dev.yml  # Development compose file
├── .dockerignore           # Docker ignore patterns
├── .env.docker.example     # Environment variables template
├── nginx/                  # Nginx reverse proxy config
│   ├── nginx.conf
│   └── conf.d/
│       └── strapi.conf
└── data/                   # Database data (created on first run)
```

## 🚀 Quick Start

### Development Environment

1. **Copy the example environment file:**
   ```bash
   cp .env.docker.example .env
   ```

2. **Generate secret keys:**
   ```bash
   # On Linux/Mac
   openssl rand -base64 32

   # On Windows (PowerShell)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

   Update `.env` with generated secrets for:
   - APP_KEYS (4 different keys, comma-separated)
   - API_TOKEN_SALT
   - ADMIN_JWT_SECRET
   - TRANSFER_TOKEN_SALT
   - JWT_SECRET
   - DATABASE_PASSWORD

3. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **View logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f strapi
   ```

5. **Access Strapi:**
   - Admin: http://localhost:1337/admin
   - API: http://localhost:1337/api

6. **Stop development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

### Production Environment

1. **Setup environment variables:**
   ```bash
   cp .env.docker.example .env
   ```

   Update all values in `.env`, especially:
   - `NODE_ENV=production`
   - `PUBLIC_URL=https://api.yourdomain.com`
   - All secret keys (generate unique values)
   - Database credentials
   - Cloudinary credentials (if using)

2. **Build production image:**
   ```bash
   docker-compose build --no-cache
   ```

3. **Start production services:**
   ```bash
   # Without Nginx
   docker-compose up -d

   # With Nginx reverse proxy
   docker-compose --profile with-proxy up -d
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Check health:**
   ```bash
   curl http://localhost:1337/_health
   ```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```env
# Server
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
PUBLIC_URL=https://api.zriadventures.com

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=strapiDB
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-secure-password

# Secrets (generate unique values)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
JWT_SECRET=your-jwt-secret

# Cloudinary (for media storage)
CLOUDINARY_NAME=your-name
CLOUDINARY_KEY=your-key
CLOUDINARY_SECRET=your-secret
```

### Database Backup

**Backup database:**
```bash
docker exec zri-strapiDB-prod pg_dump -U strapi strapi > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restore database:**
```bash
docker exec -i zri-strapiDB-prod psql -U strapi -d strapi < backup.sql
```

### Volume Management

**Production data is stored in:**
- Database: `./data/postgres`
- Uploads: `./public/uploads`

**Backup volumes:**
```bash
# Stop services
docker-compose down

# Backup
tar -czf backup_$(date +%Y%m%d).tar.gz data/ public/uploads/

# Restore
tar -xzf backup_20241103.tar.gz
```

## 🔒 Security Best Practices

### 1. Secret Management

Never commit `.env` files. Use environment variables or secrets management:

```bash
# Using Docker secrets (Docker Swarm)
echo "my-secret-password" | docker secret create db_password -
```

### 2. SSL/TLS Configuration

For production, configure SSL with Let's Encrypt:

```bash
# Install certbot
apt-get install certbot

# Generate certificates
certbot certonly --standalone -d api.zriadventures.com

# Copy certificates to nginx/ssl/
cp /etc/letsencrypt/live/api.zriadventures.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/api.zriadventures.com/privkey.pem nginx/ssl/

# Uncomment SSL config in nginx/conf.d/strapi.conf
```

### 3. Firewall Rules

```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 4. Regular Updates

```bash
# Update images
docker-compose pull

# Rebuild with latest base images
docker-compose build --pull --no-cache

# Restart services
docker-compose up -d
```

## 📊 Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f strapi
docker-compose logs -f strapiDB

# Last 100 lines
docker-compose logs --tail=100 strapi
```

### Health Checks

```bash
# Strapi health
curl http://localhost:1337/_health

# Database health
docker exec zri-strapiDB-prod pg_isready -U strapi

# Container stats
docker stats
```

### Log Rotation

Configure log rotation in `/etc/logrotate.d/docker-strapi`:

```
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
```

## 🚀 Deployment Strategies

### 1. Blue-Green Deployment

```bash
# Build new version
docker-compose build

# Tag current as old
docker tag zri-adventures-strapi:latest zri-adventures-strapi:old

# Start new version on different port
PORT=1338 docker-compose up -d

# Test new version
curl http://localhost:1338/_health

# Switch traffic (update load balancer)
# ...

# Stop old version
docker-compose down
```

### 2. Rolling Update

```bash
# Pull latest changes
git pull

# Build new image
docker-compose build --no-cache

# Restart with zero downtime
docker-compose up -d --no-deps --build strapi
```

### 3. CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t zri-strapi:${{ github.sha }} -f Dockerfile.prod .

      - name: Push to registry
        run: |
          docker tag zri-strapi:${{ github.sha }} registry.example.com/zri-strapi:latest
          docker push registry.example.com/zri-strapi:latest

      - name: Deploy to server
        run: |
          ssh user@server "cd /app && docker-compose pull && docker-compose up -d"
```

## 🐛 Troubleshooting

### Common Issues

**1. Database connection failed:**
```bash
# Check database is running
docker-compose ps

# Check logs
docker-compose logs strapiDB

# Verify credentials in .env
```

**2. Permission errors:**
```bash
# Fix upload directory permissions
sudo chown -R 1000:1000 public/uploads
```

**3. Out of memory:**
```bash
# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory

# Or limit Strapi memory
NODE_OPTIONS="--max-old-space-size=4096" docker-compose up
```

**4. Port already in use:**
```bash
# Change port in .env
PORT=1338

# Or stop conflicting service
sudo lsof -ti:1337 | xargs kill -9
```

### Debug Mode

Run Strapi in debug mode:

```bash
# Development
docker-compose -f docker-compose.dev.yml exec strapi yarn develop --debug

# Check environment
docker-compose exec strapi env
```

## 📈 Performance Optimization

### 1. Database Tuning

Edit `postgres.conf` and mount as volume:

```conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
max_connections = 100
```

### 2. Strapi Optimization

Add to `config/server.js`:

```javascript
module.exports = {
  proxy: true,
  cron: { enabled: true },
  admin: {
    serveAdminPanel: false // If using separate frontend
  }
}
```

### 3. Nginx Caching

Add to nginx config:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=strapi_cache:10m inactive=60m;

location /api/ {
    proxy_cache strapi_cache;
    proxy_cache_valid 200 10m;
}
```

## 🔄 Maintenance

### Regular Tasks

**Weekly:**
- Check logs for errors
- Monitor disk usage
- Review security updates

**Monthly:**
- Update Docker images
- Backup database
- Review and rotate logs

**Quarterly:**
- Security audit
- Performance review
- Dependency updates

### Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart strapi

# View running containers
docker-compose ps

# Execute command in container
docker-compose exec strapi yarn strapi version

# Remove all (including volumes)
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache --pull
```

## 📞 Support

For issues or questions:
- GitHub Issues: [Repository Link]
- Strapi Discord: https://discord.strapi.io
- Documentation: https://docs.strapi.io

---

**Built with ❤️ by ZRI Adventures Team**
