#!/bin/bash

# Deploy script for Instagram Agent

echo "🚀 Deploying Instagram Agent..."

# Stop existing containers
echo "⏹️  Stopping existing containers..."
docker-compose down

# Build new image
echo "🔨 Building new image..."
docker build -t instagram-agent:latest .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Start containers
echo "▶️  Starting containers..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs:     docker-compose logs -f instagram-agent"
    echo "  Stop:          docker-compose down"
    echo "  Restart:       docker-compose restart instagram-agent"
    echo "  Shell access:  docker-compose exec instagram-agent /bin/bash"
    echo ""
    echo "🌐 API available at: http://localhost:3000"
    echo "🏥 Health check:     http://localhost:3000/api/health"
else
    echo "❌ Deployment failed!"
    exit 1
fi