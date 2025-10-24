# Student Project Marking WebApp - Technical Documentation

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB 7.0
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom Akademia theme with responsive design

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for cloning the repository)

## 🗂️ Project Structure

```
Student_Project_Marking_WebApp/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Custom middleware
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── styles/        # CSS styles
│   │   └── App.jsx        # Main application
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml     # Docker services configuration
└── README.md             # Usage instructions
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (configured in `docker-compose.yml`):

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration time
- `NODE_ENV`: Environment (production/development)
- `PORT`: Backend server port (5000)
- `FRONTEND_URL`: Frontend URL for CORS

### Database Configuration

- **Database Name**: `student_project_marking`
- **MongoDB Username**: `admin`
- **MongoDB Password**: `password123`
- **Authentication Database**: `admin`

## 🐳 Docker Services

### MongoDB Service
- **Image**: mongo:7.0
- **Port**: 27017
- **Volume**: Persistent data storage
- **Authentication**: Enabled with admin user

### Backend Service
- **Port**: 5000
- **Health Check**: Built-in health monitoring
- **Dependencies**: MongoDB service

### Frontend Service
- **Port**: 3000 (mapped to 80 internally)
- **Web Server**: Nginx
- **Dependencies**: Backend service

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Stop conflicting services
   docker-compose down
   # Or change ports in docker-compose.yml
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB container status
   docker-compose ps
   # View MongoDB logs
   docker-compose logs mongodb
   ```

3. **Frontend Not Loading**
   ```bash
   # Rebuild frontend container
   docker-compose build frontend
   docker-compose up -d frontend
   ```

4. **Admin User Not Created**
   ```bash
   # Manually create admin user
   cd backend
   node init-docker-admin.js
   ```

### Useful Commands

```bash
# View all container logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build

# Stop all services
docker-compose down

# Remove all data (reset)
docker-compose down -v
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Judges
- `GET /api/judges` - Get all judges
- `POST /api/judges` - Create new judge
- `PUT /api/judges/:id` - Update judge

### Criteria
- `GET /api/criteria` - Get all criteria
- `POST /api/criteria` - Create new criteria
- `PUT /api/criteria/:id` - Update criteria
- `DELETE /api/criteria/:id` - Delete criteria

### Scoring
- `POST /api/scores` - Submit team score
- `GET /api/scores` - Get scores
- `GET /api/leaderboard` - Get team rankings

## 🎨 Customization

### Styling
The application uses a custom "Akademia" theme with:
- Primary colors: Blue gradient
- Secondary colors: Complementary tones
- Responsive design for all screen sizes
- Modern UI components

### Adding New Features
1. **Backend**: Add routes in `backend/src/routes/`
2. **Frontend**: Add components in `frontend/src/`
3. **Database**: Create models in `backend/src/models/`

## 📝 Development

### Local Development Setup
```bash
# Backend development
cd backend
npm install
npm run dev

# Frontend development
cd frontend
npm install
npm run dev
```

### Database Management
```bash
# Connect to MongoDB
docker exec -it student_marking_db mongosh

# Backup database
docker exec student_marking_db mongodump --out /backup

# Restore database
docker exec student_marking_db mongorestore /backup
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is developed for educational purposes as part of a student project marking system.

## 👨‍🏫 For Lecturers

This application demonstrates:
- **Full-stack development** with modern technologies
- **Docker containerization** for easy deployment
- **Database design** with MongoDB
- **Authentication and authorization**
- **Responsive web design**
- **API development** with Express.js
- **Frontend development** with React

The application is ready for immediate use and can be easily deployed in any environment with Docker support.

## 📞 Support

For technical support or questions about this application, please contact the development team or refer to the troubleshooting section above.

---

**Built with ❤️ for Student Project Management**
