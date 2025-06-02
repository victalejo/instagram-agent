#!/bin/bash

# Build script for Instagram Agent Docker

echo "🚀 Building Instagram Agent Docker Image..."

# Create necessary directories
mkdir -p cookies logs

# Build the Docker image
docker build -t instagram-agent:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "📦 Image: instagram-agent:latest"
    echo ""
    echo "To run the container:"
    echo "  docker-compose up -d"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f instagram-agent"
    echo ""
    echo "To stop:"
    echo "  docker-compose down"
else
    echo "❌ Docker build failed!"
    exit 1
fi