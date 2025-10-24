# Student Project Marking WebApp

A comprehensive full-stack web application designed for Akademia's Computer Science Capstone project evaluation system. This application facilitates the industry project day where external judges evaluate student teams' projects based on predefined criteria.

## Quick Start

### Option 1: Docker (Recommended)

**Prerequisites**: Docker and Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd Student_Project_Marking_WebApp

# Start all services with Docker
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Option 2: Local Development

**Prerequisites**: Node.js (v16+), MongoDB (v4.4+)

```bash
# Clone the repository
git clone <repository-url>
cd Student_Project_Marking_WebApp

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp .env.example .env
# Update .env with your MongoDB connection string

# Start the application
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Docker Commands

### Start Services
```bash
# Start all services in background
docker-compose up -d

# Start with logs
docker-compose up

# Rebuild and start
docker-compose up --build
```

### Manage Services
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Test Setup
```bash
# Test if everything is running
node test-docker.js
```

## Environment Configuration

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/student-marking-app
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker Development
```bash
# Start with Docker
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild specific service
docker-compose build backend
docker-compose up backend
```

## Testing

### Test Credentials
- **Username**: admin
- **Password**: admin123

### Health Checks
- **Backend**: http://localhost:5000/health
- **Frontend**: http://localhost:3000
- **MongoDB**: Check with `docker-compose logs mongodb`

## Troubleshooting

### Common Issues
1. **Port already in use**: Kill processes using ports 3000, 5000, 27017
2. **Docker containers won't start**: Check `docker-compose logs`
3. **Database connection issues**: Verify MongoDB is running
4. **Frontend build errors**: Clear node_modules and reinstall

### Debug Commands
```bash
# Check Docker status
docker-compose ps

# View container logs
docker-compose logs -f

# Enter container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Check network connectivity
docker-compose exec backend ping mongodb
```

## Project Structure

```
Student_Project_Marking_WebApp/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── models/         # Database models (User, Team, Criteria, Round, Score)
│   │   ├── routes/         # API routes (auth, teams, criteria, rounds, scores)
│   │   ├── middleware/     # Custom middleware (auth, errorHandler, validation)
│   │   ├── config/         # Database configuration
│   │   ├── app.js          # Main application
│   │   └── server.js       # Server entry point
│   ├── Dockerfile          # Backend container configuration
│   └── package.json
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── App.jsx         # Main React application
│   │   ├── index.jsx       # React entry point
│   │   ├── styles/         # CSS styles
│   │   └── images/         # Static assets
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── index.html          # Vite development template
│   ├── Dockerfile          # Frontend container configuration
│   ├── nginx.conf          # Nginx configuration
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Root package.json
├── test-docker.js         # Docker setup test script
├── DOCUMENTATION.md        # Technical documentation
└── README.md              # This file
```

## Features

### Core Functionality
- **User Authentication**: Role-based access (Admin/Judge)
- **Team Management**: CRUD operations for student teams
- **Criteria Management**: Create and manage evaluation criteria
- **Round Management**: Set up evaluation rounds and scheduling
- **Judge Assignment**: Automated algorithm for fair team distribution
- **Scoring System**: Comprehensive scoring with validation
- **Results & Analytics**: Real-time results and performance metrics

### Technical Features
- **RESTful API**: Well-structured backend with Express.js
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Integration**: NoSQL database with Mongoose ODM
- **React Frontend**: Modern UI with React Router and React Query
- **Responsive Design**: Mobile-friendly interface
- **Input Validation**: Comprehensive client and server-side validation
- **Error Handling**: Robust error boundaries and validation

### UI/UX Features
- **Akademia Theme**: Custom color scheme and branding
- **Modern Interface**: Clean, professional design
- **Role-based Navigation**: Different interfaces for admins and judges
- **Real-time Updates**: Live data synchronization
- **Loading States**: User-friendly feedback and loading indicators

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Vite** - Build tool

### Development Tools
- **Nodemon** - Development server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Documentation

- **[Technical Documentation](DOCUMENTATION.md)** - Comprehensive technical details

## Recent Optimizations (2025)

The codebase has been optimized by removing unused files while preserving all core functionality:

### Files Removed (8 total):
- **Admin Creation Scripts (5 files)**: One-time setup utilities
- **Test/Utility Scripts (3 files)**: Development utilities

### Benefits:
- **Reduced Complexity**: Cleaner project structure
- **Improved Maintainability**: Fewer files to manage
- **Better Performance**: Smaller codebase for faster builds
- **Enhanced Security**: Removed potential security risks
- **Professional Appearance**: Production-ready codebase

## 🚀 Deployment

### Quick Deploy
1. **Backend**: Deploy to Railway/Heroku
2. **Frontend**: Deploy to Netlify/Vercel
3. **Database**: Use MongoDB Atlas

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is developed for Akademia's Computer Science Program.

## 🆘 Support

For technical support or questions:
- Check the documentation files
- Review the code comments for implementation details
- Contact the development team

---

**Built with dedication for Akademia's Computer Science Program**

*Last updated: 2025 - Codebase optimized and cleaned*
