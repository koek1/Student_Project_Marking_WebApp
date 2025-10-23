# Student Project Marking WebApp - Setup Guide

## Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **Docker** (optional, for containerized deployment)
- **Git** (for version control)

### 1. MongoDB Setup

#### Option A: Local MongoDB Installation
1. **Download MongoDB Community Server** from [mongodb.com](https://www.mongodb.com/try/download/community)
2. **Install MongoDB** following the installation wizard
3. **Start MongoDB Service**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
4. **Verify Installation**:
   ```bash
   mongosh --version
   ```

#### Option B: MongoDB Atlas (Cloud)
1. **Create Account** at [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Create New Cluster** (free tier available)
3. **Get Connection String** and update `.env` file

### 2. Environment Configuration

1. **Copy Environment File**:
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your settings**:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/student-marking-app
   # OR for Atlas: mongodb+srv://username:password@cluster.mongodb.net/student-marking-app
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### 3. Backend Setup

1. **Navigate to Backend Directory**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Backend Server**:
   ```bash
   npm run dev
   ```
   - Server will run on `http://localhost:5000`
   - API documentation available at `http://localhost:5000/api/health`

### 4. Frontend Setup

1. **Navigate to Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Frontend Development Server**:
   ```bash
   npm run dev
   ```
   - Application will run on `http://localhost:3000`

### 5. Docker Setup (Optional)

1. **Start All Services**:
   ```bash
   docker-compose up -d
   ```

2. **View Logs**:
   ```bash
   docker-compose logs -f
   ```

3. **Stop Services**:
   ```bash
   docker-compose down
   ```

## 🔧 Initial Configuration

### 1. Create Admin User

1. **Access the Application** at `http://localhost:3000`
2. **Register First Admin**:
   - Username: `admin`
   - Email: `admin@akademia.ac.za`
   - Password: `admin123`
   - Role: `Administrator`

### 2. Create Judge Users

1. **Login as Admin**
2. **Navigate to Users Management**
3. **Create Judge Accounts**:
   - Username: `judge1`, `judge2`, etc.
   - Email: `judge1@company.com`
   - Password: `judge123`
   - Role: `Judge`
   - Company: `Your Company Name`
   - Position: `Senior Developer`

### 3. Set Up Teams

1. **Navigate to Teams Management**
2. **Create Teams** (3-4 members each):
   - Team Name: `Team Alpha`
   - Team Number: `1`
   - Project Title: `E-commerce Platform`
   - Members: Add 3-4 team members with details

### 4. Create Evaluation Criteria

1. **Navigate to Criteria Management**
2. **Create Criteria**:
   - Technical Implementation (Max: 100 points)
   - User Experience (Max: 100 points)
   - Innovation (Max: 100 points)
   - Presentation (Max: 100 points)

### 5. Create Evaluation Rounds

1. **Navigate to Round Management**
2. **Create Round**:
   - Name: `Final Round`
   - Description: `Industry Project Day Evaluation`
   - Select Criteria: Choose all active criteria
   - Start Date: `2024-10-23 09:00`
   - End Date: `2024-10-23 17:00`

### 6. Assign Judges to Teams

1. **Navigate to Judge Assignment**
2. **Select Round**
3. **Click "Assign Judges"** to automatically distribute teams
4. **Review Assignments** and optimize if needed

## Usage Guide

### For Administrators

1. **Dashboard**: Overview of system statistics
2. **Teams**: Manage student teams and members
3. **Criteria**: Create and manage evaluation criteria
4. **Rounds**: Set up evaluation rounds
5. **Assignment**: Assign judges to teams
6. **Users**: Manage admin and judge accounts
7. **Results**: View competition results and winners
8. **Analytics**: Detailed performance analytics

### For Judges

1. **Dashboard**: View assigned teams and progress
2. **Teams**: See assigned teams for current round
3. **Scoring**: Score teams based on criteria
4. **History**: View scoring history and statistics

## Deployment

### Netlify Deployment (Frontend)

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**:
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables: Add `VITE_API_URL`

### Backend Deployment

1. **Deploy to Railway/Heroku**:
   - Connect GitHub repository
   - Add environment variables
   - Deploy automatically

2. **Update Frontend API URL**:
   - Change `VITE_API_URL` to production backend URL

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check firewall settings

2. **CORS Errors**:
   - Verify `FRONTEND_URL` in backend `.env`
   - Check if frontend is running on correct port

3. **JWT Token Errors**:
   - Check `JWT_SECRET` is set
   - Verify token expiration settings

4. **Build Errors**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Logs and Debugging

1. **Backend Logs**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend Logs**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Docker Logs**:
   ```bash
   docker-compose logs -f
   ```

## 📁 Project Structure

```
Student_Project_Marking_WebApp/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration
│   ├── package.json
│   └── Dockerfile
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS styles
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Docker configuration
├── .env.example           # Environment variables template
└── README.md              # Project documentation
```

## Features Implemented

### Core Functionality
- [x] User authentication (Admin/Judge roles)
- [x] Team management (CRUD operations)
- [x] Criteria management with marking guides
- [x] Round management and scheduling
- [x] Judge assignment algorithm
- [x] Scoring system with validation
- [x] Results display and winner calculation
- [x] Analytics dashboard

### Technical Features
- [x] RESTful API architecture
- [x] JWT authentication
- [x] Password encryption
- [x] Input validation
- [x] Error handling
- [x] Responsive design
- [x] Docker containerization
- [x] MongoDB integration

### UI/UX Features
- [x] Akademia color scheme
- [x] Modern, polished interface
- [x] User-friendly navigation
- [x] Role-based access control
- [x] Loading states and feedback
- [x] Mobile responsive design

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review the code comments for implementation details
- Contact the development team

---

**Happy Coding!**
