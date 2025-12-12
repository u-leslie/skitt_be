#!/bin/bash
set -e

# Get the directory where this script is located (k8s folder)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Parent directory is the backend root
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔨 Building backend Docker image..."
cd "$BACKEND_DIR"
docker build -t skitt-backend:latest --target runner -f Dockerfile .

echo "🚀 Deploying to Kubernetes..."
cd "$SCRIPT_DIR"
./deploy.sh

echo ""
echo "✅ Backend built and deployed!"
echo "📊 Check status: kubectl get pods -n skitt-prod"
