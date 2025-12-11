#!/bin/bash
set -e

echo "🚀 Deploying Skitt Backend to EC2"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file in the backend directory with:"
    echo "  PORT=3001"
    echo "  NODE_ENV=production"
    echo "  DB_HOST=your-rds-endpoint.region.rds.amazonaws.com"
    echo "  DB_PORT=5432"
    echo "  DB_NAME=skitt_db"
    echo "  DB_USER=skitt_admin"
    echo "  DB_PASSWORD=your-password"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker: sudo systemctl start docker"
    exit 1
fi

# Build and start container
echo "📦 Building backend container..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting backend service..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for backend to be healthy..."
sleep 10

# Check backend health
echo "🏥 Checking backend health..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
    echo ""
    echo "📋 Backend is running at:"
    echo "  API: http://$(curl -s ifconfig.me):3001/api/flags"
    echo "  Health: http://$(curl -s ifconfig.me):3001/health"
    echo "  API Docs: http://$(curl -s ifconfig.me):3001/api-docs"
else
    echo "⚠️  Backend health check failed"
    echo "Check logs: docker-compose logs -f"
    exit 1
fi

echo ""
echo "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 Stop service: docker-compose -f docker-compose.prod.yml down"
