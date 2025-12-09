#!/bin/bash

# Skitt Backend - Docker Quick Start Script

set -e

echo "🚀 Starting Skitt Backend Containerization..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example (if exists)..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created. Please review and update if needed."
    else
        echo "⚠️  No .env.example found. You may need to create .env manually."
    fi
    echo ""
fi

# Build images
echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check service health
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Skitt Backend is starting up!"
echo ""
echo "📍 Access your services:"
echo "   Backend:   http://localhost:3001"
echo "   API Docs:  http://localhost:3001/api-docs"
echo "   Database:  localhost:5432"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""

