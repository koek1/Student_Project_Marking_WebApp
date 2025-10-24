#!/bin/bash

# Student Project Marking WebApp Setup Script
# This script sets up the entire application for easy deployment

echo "🚀 Setting up Student Project Marking WebApp..."
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Initialize admin user
echo "👤 Creating admin user..."
cd backend
node init-docker-admin.js
cd ..

# Final status check
echo "✅ Setup complete!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo ""
echo "🎉 Your Student Project Marking WebApp is ready!"