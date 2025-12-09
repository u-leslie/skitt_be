# 🐳 Skitt Backend - Docker Guide

Complete guide for running the Skitt Backend using Docker.

## 📋 Prerequisites

- **Docker Engine** 20.10 or higher
- **Docker Compose** 2.0 or higher

Verify installation:
```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start

### Option 1: Using the Start Script (Recommended)

```bash
cd backend
./docker-start.sh
```

This script will:
- Check if Docker is running
- Create `.env` file if needed
- Build Docker images
- Start all services (PostgreSQL + Backend)
- Show service status

### Option 2: Manual Docker Compose

```bash
cd backend

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

## 📁 Docker Files

- `docker-compose.yml` - Production setup (Backend + PostgreSQL)
- `docker-compose.dev.yml` - Development setup (PostgreSQL only)
- `docker-start.sh` - Quick start script
- `Dockerfile` - Multi-stage build configuration

## 🏗️ Architecture

```
┌─────────────┐
│  Backend    │ (Express API - Port 3001)
│  Container  │
└──────┬──────┘
       │
       │ PostgreSQL
       │
┌──────▼──────┐
│ PostgreSQL  │ (Port 5432)
│  Container  │
└─────────────┘
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=skitt_db
DB_USER=skitt_user
DB_PASSWORD=skitt_password
```

**Note**: When running in Docker, `DB_HOST` should be `postgres` (the service name), not `localhost`.

### Default Values

If `.env` is not provided, Docker Compose uses these defaults:
- `DB_NAME`: `skitt_db`
- `DB_USER`: `skitt_user`
- `DB_PASSWORD`: `skitt_password`
- `DB_PORT`: `5432`

## 🎯 Running Modes

### Production Mode (Docker)

Runs both PostgreSQL and Backend in containers:

```bash
docker-compose up -d
```

**Services:**
- Backend API: `http://localhost:3001`
- API Docs: `http://localhost:3001/api-docs`
- PostgreSQL: `localhost:5432`

### Development Mode

Run PostgreSQL in Docker, Backend locally:

```bash
# Start PostgreSQL only
docker-compose -f docker-compose.dev.yml up -d

# Run backend locally (in another terminal)
npm install
npm run dev
```

**Benefits:**
- Hot reload for code changes
- Faster development cycle
- Direct access to logs

## 📊 Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# PostgreSQL only
docker-compose logs -f postgres
```

### Check Service Status
```bash
docker-compose ps
```

### Rebuild After Code Changes
```bash
# Rebuild backend
docker-compose build backend
docker-compose up -d backend

# Rebuild all (no cache)
docker-compose build --no-cache
docker-compose up -d
```

### Access Container Shell
```bash
# Backend container
docker exec -it skitt-backend sh

# PostgreSQL container
docker exec -it skitt-postgres sh
```

### Database Access
```bash
# PostgreSQL shell
docker exec -it skitt-postgres psql -U skitt_user -d skitt_db

# Or using docker-compose
docker-compose exec postgres psql -U skitt_user -d skitt_db
```

### Stop and Remove Volumes (⚠️ Deletes Data)
```bash
docker-compose down -v
```

## 🔍 Health Checks

Both services include health checks:

- **PostgreSQL**: Checks if database is ready
- **Backend**: Checks if API is responding

View health status:
```bash
docker-compose ps
```

## 🗄️ Database Management

### Initialize Database

The database schema is automatically initialized when the backend starts.

### Backup Database

```bash
docker exec skitt-postgres pg_dump -U skitt_user skitt_db > backup.sql
```

### Restore Database

```bash
docker exec -i skitt-postgres psql -U skitt_user skitt_db < backup.sql
```

### Reset Database (⚠️ Deletes All Data)

```bash
docker-compose down -v
docker-compose up -d
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3001
lsof -i :5432

# Kill process or change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Backend Not Starting

```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Build Failures

```bash
# Clean build (no cache)
docker-compose build --no-cache

# Remove old images
docker system prune -a
```

### Permission Issues

```bash
# Fix volume permissions (Linux/Mac)
sudo chown -R $USER:$USER postgres_data
```

### Container Won't Start

```bash
# Check container status
docker ps -a

# View container logs
docker logs skitt-backend
docker logs skitt-postgres

# Remove and recreate
docker-compose down
docker-compose up -d
```

## 📈 Resource Usage

### Check Container Stats
```bash
docker stats
```

### Check Disk Usage
```bash
docker system df
```

### Clean Up Unused Resources
```bash
# Remove stopped containers, unused networks, images
docker system prune

# Remove everything (⚠️ aggressive)
docker system prune -a
```

## 🔒 Security Best Practices

✅ **Implemented:**
- Non-root user in containers
- Multi-stage builds (minimal attack surface)
- Health checks for all services
- Environment variables for secrets

⚠️ **Production Recommendations:**
- Use Docker secrets or external secret management
- Enable SSL/TLS for database connections
- Regular security updates
- Network isolation
- Resource limits

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

## 🆘 Getting Help

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify Docker is running: `docker info`
3. Check service health: `docker-compose ps`
4. Review environment variables in `.env`

