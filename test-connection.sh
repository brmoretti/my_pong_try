#!/bin/bash

echo "🔍 Testing Docker networking for Pong multiplayer..."
echo ""

# Test if ports are accessible
echo "📡 Testing HTTP client access..."
timeout 5 curl -f http://localhost:1234 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ HTTP client (port 1234) is accessible"
else
    echo "❌ HTTP client (port 1234) is not accessible"
fi

echo ""
echo "🔌 Testing WebSocket server access..."

# Test WebSocket server (expect "Upgrade Required" response which means it's working)
RESPONSE=$(timeout 5 curl -s http://localhost:8080 2>/dev/null)
HTTP_CODE=$(timeout 5 curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>/dev/null)

if [[ "$RESPONSE" == *"Upgrade Required"* ]] || [[ "$HTTP_CODE" == "426" ]]; then
    echo "✅ WebSocket server (port 8080) is running correctly"
    echo "   └─ Server correctly responds with 'Upgrade Required' (HTTP 426)"
elif [[ "$HTTP_CODE" == "000" ]]; then
    echo "❌ WebSocket server (port 8080) is not accessible"
    echo "   └─ Connection failed or server not running"
else
    echo "⚠️  WebSocket server (port 8080) responded with HTTP $HTTP_CODE"
    echo "   └─ Response: $RESPONSE"
fi

echo ""
echo "🐳 Docker container status:"
docker ps | grep pong || echo "No Pong containers running"

echo ""
echo "🌐 Network troubleshooting tips:"
echo "1. Make sure Docker is running: docker --version"
echo "2. Check if ports are free: netstat -tuln | grep -E ':(1234|8080)'"
echo "3. Try accessing from browser: http://localhost:1234"
echo "4. Check Docker logs: docker logs <container-name>"
echo "5. Rebuild if needed: docker-compose up --build"
echo ""
echo "📝 Expected behaviors:"
echo "• HTTP client (1234): Should serve the game webpage"
echo "• WebSocket server (8080): Should show 'Upgrade Required' - this is CORRECT!"
echo "• In-game: WebSocket connection happens automatically when selecting online multiplayer"
