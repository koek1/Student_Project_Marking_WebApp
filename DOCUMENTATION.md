# Student Project Marking WebApp - Technical Documentation

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB 7.0
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom Akademia theme with responsive design

## Prerequisites

Before running this application, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for cloning the repository)

## Project Structure

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

## Configuration

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

## Docker Services

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

## Troubleshooting

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

## RESTful API Architecture

This application follows **REST (Representational State Transfer)** architecture principles completely, as required by the project specifications. The Express.js backend implements a fully RESTful API with proper HTTP methods, status codes, and resource-based URLs.

### RESTful Design Principles Implemented

1. **Resource-Based URLs**: All endpoints use nouns to represent resources
   - `/api/teams` - Team resources
   - `/api/criteria` - Criteria resources  
   - `/api/rounds` - Round resources
   - `/api/scores` - Score resources
   - `/api/auth` - Authentication resources

2. **HTTP Methods**: Proper use of GET, POST, PUT, DELETE for different operations
   - **GET**: Retrieve resources (teams, criteria, scores)
   - **POST**: Create new resources (teams, criteria, rounds, scores)
   - **PUT**: Update existing resources (teams, criteria, rounds, scores)
   - **DELETE**: Remove resources (teams, criteria, rounds)

3. **Stateless Communication**: Each request contains all necessary information
   - JWT tokens in headers for authentication
   - No server-side session storage
   - All user context passed in requests

4. **Uniform Interface**: Consistent response format across all endpoints
   ```json
   {
     "success": true/false,
     "message": "Operation description",
     "data": { /* resource data */ }
   }
   ```

5. **Layered System**: Clear separation between client, server, and database layers
   - **Client Layer**: React.js frontend with Akademia styling
   - **Server Layer**: Express.js REST API with middleware
   - **Database Layer**: MongoDB with Mongoose ODM

6. **HTTP Status Codes**: Proper use of standard HTTP status codes
   - **200**: Successful GET, PUT operations
   - **201**: Successful POST operations (resource created)
   - **400**: Bad request (validation errors)
   - **401**: Unauthorized (authentication required)
   - **403**: Forbidden (insufficient permissions)
   - **404**: Resource not found
   - **500**: Internal server error

7. **Content Negotiation**: JSON format for all API responses
8. **HATEOAS**: Links and metadata in responses where appropriate

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/login` - User login (creates session)
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/users` - Get all users (admin only)
- `PUT /api/auth/users/:id` - Update user (admin only)
- `PUT /api/auth/users/:id/status` - Toggle user status (admin only)
- `DELETE /api/auth/users/:id` - Delete user (admin only)
- `GET /api/auth/stats` - Get user statistics (admin only)

#### Teams (`/api/teams`)
- `GET /api/teams` - Get all teams (with filtering and pagination)
- `GET /api/teams/assigned` - Get teams assigned to current judge
- `GET /api/teams/:id` - Get specific team
- `POST /api/teams` - Create new team (admin only)
- `PUT /api/teams/:id` - Update team (admin only)
- `DELETE /api/teams/:id` - Delete team (admin only)
- `PUT /api/teams/:id/assign-judge` - Assign judge to team (admin only)
- `PUT /api/teams/:id/unassign-judge` - Unassign judge from team (admin only)
- `PUT /api/teams/:id/participation` - Toggle team participation (admin only)
- `GET /api/teams/stats` - Get team statistics (admin only)
- `POST /api/teams/clear-assignments` - Clear all judge assignments (admin only)
- `POST /api/teams/auto-assign` - Auto-assign judges to teams (admin only)

#### Criteria (`/api/criteria`)
- `GET /api/criteria` - Get all criteria (with filtering and pagination)
- `GET /api/criteria/:id` - Get specific criteria
- `POST /api/criteria` - Create new criteria (admin only)
- `PUT /api/criteria/:id` - Update criteria (admin only)
- `DELETE /api/criteria/:id` - Delete criteria (admin only)
- `PUT /api/criteria/:id/status` - Toggle criteria status (admin only)
- `GET /api/criteria/stats/most-used` - Get most used criteria
- `GET /api/criteria/stats` - Get criteria statistics (admin only)

#### Rounds (`/api/rounds`)
- `GET /api/rounds` - Get all rounds (with filtering and pagination)
- `GET /api/rounds/active` - Get active rounds
- `GET /api/rounds/:id` - Get specific round
- `POST /api/rounds` - Create new round (admin only)
- `PUT /api/rounds/:id` - Update round (admin only)
- `DELETE /api/rounds/:id` - Delete round (admin only)
- `PUT /api/rounds/:id/close` - Close round (admin only)
- `PUT /api/rounds/:id/reopen` - Reopen round (admin only)
- `GET /api/rounds/stats` - Get round statistics (admin only)

#### Scores (`/api/scores`)
- `GET /api/scores/my-scores` - Get judge's scores
- `GET /api/scores/team/:teamId` - Get team scores for specific round
- `GET /api/scores/summary/:teamId` - Get team score summary
- `GET /api/scores/round/:roundId` - Get all scores for round (admin only)
- `GET /api/scores/leaderboard` - Get team leaderboard
- `GET /api/scores/stats` - Get score statistics (admin only)
- `POST /api/scores` - Submit score (judge only)
- `PUT /api/scores/:id` - Update score (judge only)
- `PUT /api/scores/:id/submit` - Submit score (judge only)

## Functional Requirements Compliance

This application fully complies with all specified functional requirements:

### ✅ Authentication System
- **Admin Login**: Admins can log in and access full system management
- **Judge Login**: Judges can log in and access assigned teams only
- **Role-based Access**: Clear separation between admin and judge functionalities

### ✅ Team Management (CRUD)
- **Create**: Admins can create teams with members and project details
- **Read**: View all teams with filtering and pagination
- **Update**: Modify team information, members, and project details
- **Delete**: Remove teams from the system
- **Judge Assignment**: Assign up to 3 judges per team with auto-assignment capability

### ✅ Criteria Management (CRUD)
- **Create**: Define marking criteria with descriptions and maximum scores
- **Read**: View all criteria with usage statistics
- **Update**: Modify criteria details and marking guides
- **Delete**: Remove unused criteria (with validation)
- **Marking Guides**: Each criteria includes detailed marking guidelines for judges

### ✅ Round Management
- **Create Rounds**: Set up evaluation rounds with specific criteria
- **Close/Reopen**: Control round status for scoring
- **Criteria Selection**: Choose which criteria apply to each round
- **Future Scalability**: System supports up to 15 teams as required

### ✅ Scoring System
- **Judge Scoring**: Judges can score only assigned teams
- **Score Modification**: Judges can update scores before round closure
- **Round-based Scoring**: Each round has specific criteria
- **Leaderboard**: Automatic calculation and ranking of teams
- **Score Validation**: Ensures scores don't exceed criteria maximums

### ✅ Winner Display
- **Automatic Calculation**: System calculates winners based on scores
- **Round Closure**: Winners displayed after at least one round is closed
- **Ranking System**: Clear team rankings with scores and percentages

## Non-Functional Requirements Compliance

### ✅ RESTful Architecture
The Express.js backend **fully follows REST architecture** as required:
- **Resource-based URLs**: All endpoints use proper REST conventions
- **HTTP Methods**: Correct use of GET, POST, PUT, DELETE
- **Status Codes**: Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- **Stateless**: Each request is independent and self-contained
- **Uniform Interface**: Consistent JSON response format across all endpoints

### ✅ Akademia Color Scheme
The React.js frontend **implements the complete Akademia color scheme**:
- **Primary Color**: `rgb(15, 30, 59)` - Deep blue
- **Secondary Color**: `rgb(147, 95, 40)` - Warm brown/gold
- **Custom CSS Variables**: Defined in `globals.css` and `akademia-theme.css`
- **Component Styling**: All UI components use Akademia colors
- **Gradient Effects**: Beautiful gradients using Akademia color palette

### ✅ Text Readability
- **High Contrast**: Dark text on light backgrounds
- **Proper Typography**: Inter font family with appropriate weights
- **Responsive Text**: Scalable text sizes for different screen sizes
- **Clear Hierarchy**: Proper heading structure and text organization

### ✅ User-Friendly Interface
- **Intuitive Navigation**: Clear menu structure and user flows
- **Role-based UI**: Different interfaces for admins and judges
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Loading States**: Visual feedback during operations
- **Error Handling**: Clear error messages and validation

### ✅ Access Control
- **Authentication Required**: All backend functions require user authentication
- **Role-based Authorization**: 
  - Admins: Full system access
  - Judges: Only assigned teams and scoring
- **Route Protection**: Middleware ensures proper access control
- **Session Management**: JWT-based authentication with expiration

### ✅ Docker Implementation
- **Docker Compose**: Complete `docker-compose.yml` configuration
- **Multi-container Setup**: Separate containers for frontend, backend, and database
- **Health Checks**: Built-in health monitoring for all services
- **Environment Variables**: Proper configuration management
- **Volume Persistence**: Data persistence across container restarts

## Specific Guidelines Compliance

### ✅ Admin Functionality
- **Team Management**: Full CRUD operations for teams and team members
- **Criteria Management**: Create, update, and manage marking criteria with guides
- **Round Management**: Create rounds, assign criteria, close/reopen rounds
- **Judge Assignment**: Assign judges to teams (up to 3 per team)
- **User Management**: Create, update, and manage user accounts
- **Statistics**: View comprehensive system statistics and reports

### ✅ Judge Functionality  
- **Assigned Teams Only**: Judges can only see and score teams assigned to them
- **Scoring Interface**: Easy-to-use scoring interface with criteria details
- **Score Modification**: Judges can update scores before round closure
- **Marking Guides**: Access to detailed marking guidelines for each criteria
- **Score History**: View previous scores and modifications

### ✅ System Scalability
- **15 Team Support**: System designed to handle up to 15 teams as required
- **Flexible Judge Assignment**: Automatic and manual judge assignment options
- **Round-based Evaluation**: Multiple evaluation rounds with different criteria
- **Future-proof Design**: Architecture supports expansion and modifications

### ✅ Data Integrity
- **Score Validation**: Scores cannot exceed criteria maximums
- **Round Status Control**: Scores can only be submitted when rounds are open
- **Judge Authorization**: Judges can only score assigned teams
- **Admin Controls**: Admins can close/reopen rounds to control scoring periods

### ✅ User Experience
- **Role-based Interface**: Different interfaces for admins and judges
- **Responsive Design**: Works on all device sizes
- **Clear Navigation**: Intuitive menu structure and user flows
- **Visual Feedback**: Loading states, success/error messages
- **Accessibility**: High contrast, readable fonts, proper spacing

## Customization

### Styling
The application uses a custom "Akademia" theme with:
- **Primary colors**: Deep blue (`rgb(15, 30, 59)`)
- **Secondary colors**: Warm brown/gold (`rgb(147, 95, 40)`)
- **Responsive design**: Works on all screen sizes
- **Modern UI components**: Cards, buttons, forms, and tables
- **Custom CSS classes**: Comprehensive styling system

### Adding New Features
1. **Backend**: Add routes in `backend/src/routes/`
2. **Frontend**: Add components in `frontend/src/`
3. **Database**: Create models in `backend/src/models/`

## Development

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is developed for educational purposes as part of a student project marking system.

## For Lecturers

This application demonstrates:
- **Full-stack development** with modern technologies
- **Docker containerization** for easy deployment
- **Database design** with MongoDB
- **Authentication and authorization**
- **Responsive web design**
- **API development** with Express.js
- **Frontend development** with React

The application is ready for immediate use and can be easily deployed in any environment with Docker support.

---

