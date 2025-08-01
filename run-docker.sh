#!/bin/bash

echo "🐳 Building Docker image..."
docker build -t pong-multiplayer .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo "🚀 Starting the container..."
    echo "📡 Client will be available at: http://localhost:1234"
    echo "🔌 WebSocket server will be available at: ws://localhost:8080"
    echo ""
    echo "Press Ctrl+C to stop the container"
    
    docker run -p 1234:1234 -p 8080:8080 --rm pong-multiplayer
else
    echo "❌ Docker build failed!"
    exit 1
fi
