# Quick Installation Guide

## Prerequisites
- Docker (Download from: https://docs.docker.com/get-docker/)
- Docker Compose (Usually included with Docker Desktop)

## One-Command Setup

```bash
# Make the setup script executable and run it
chmod +x setup.sh
./setup.sh
```

## Manual Setup

If you prefer to set up manually:

### 1. Start the Application
```bash
docker-compose up -d
```

### 2. Create Admin User
```bash
cd backend
node init-docker-admin.js
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Login**: admin / admin123

## Troubleshooting

### If ports are busy:
```bash
# Stop all containers
docker-compose down

# Check what's using the ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000
```

### If MongoDB connection fails:
```bash
# Check MongoDB container
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Reset everything:
```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d

# Recreate admin user
cd backend && node init-docker-admin.js
```

## That's it!
Your Student Project Marking WebApp should now be running at http://localhost:3000