# Student Project Marking WebApp - Technical Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [REST API Implementation](#rest-api-implementation)
4. [Database Design](#database-design)
5. [Authentication & Authorization](#authentication--authorization)
6. [Frontend Architecture](#frontend-architecture)
7. [Key Algorithms](#key-algorithms)
8. [Security Implementation](#security-implementation)
9. [Error Handling](#error-handling)
10. [Performance Optimizations](#performance-optimizations)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Architecture](#deployment-architecture)
13. [API Documentation](#api-documentation)
14. [Code Quality & Standards](#code-quality--standards)

---

## 🎯 Project Overview

The **Student Project Marking WebApp** is a full-stack web application designed for Akademia's Computer Science Capstone project evaluation system. It facilitates the industry project day where external judges evaluate student teams' projects based on predefined criteria.

### Core Purpose
- **Streamline Evaluation Process**: Digitalize the marking system for industry project day
- **Ensure Fair Assessment**: Implement structured criteria-based evaluation
- **Optimize Judge Assignment**: Automatically distribute teams among judges
- **Provide Analytics**: Generate insights and performance metrics
- **Maintain Transparency**: Track scoring history and modifications

### Key Stakeholders
- **Administrators**: Manage teams, criteria, rounds, and judge assignments
- **Industry Judges**: Evaluate assigned teams based on criteria
- **Students**: Present projects to assigned judges
- **Academic Staff**: Monitor evaluation progress and results

---

## 🏗️ Architecture & Design Patterns

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React.js)    │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Components    │    │ • REST API      │    │ • Collections   │
│ • State Mgmt    │    │ • Middleware    │    │ • Indexes       │
│ • Routing       │    │ • Validation    │    │ • Relationships │
│ • UI/UX         │    │ • Authentication│    │ • Aggregations  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Design Patterns Implemented

#### 1. **MVC (Model-View-Controller)**
- **Models**: Mongoose schemas for data structure
- **Views**: React components for UI presentation
- **Controllers**: Express route handlers for business logic

#### 2. **Repository Pattern**
```javascript
// Example: User Repository
class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }
  
  async create(userData) {
    return await User.create(userData);
  }
}
```

#### 3. **Service Layer Pattern**
```javascript
// Example: Authentication Service
class AuthService {
  async login(credentials) {
    const user = await this.userRepository.findByEmail(credentials.email);
    const isValid = await user.matchPassword(credentials.password);
    return this.generateToken(user);
  }
}
```

#### 4. **Middleware Pattern**
```javascript
// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
```

#### 5. **Observer Pattern**
```javascript
// React Query for state management
const { data, isLoading, error } = useQuery(
  'teams',
  () => teamsAPI.getTeams(),
  { refetchInterval: 30000 }
);
```

---

## 🌐 REST API Implementation

### REST Principles Adherence

#### 1. **Stateless Communication**
- Each request contains all necessary information
- No server-side session storage
- JWT tokens carry authentication state

#### 2. **Resource-Based URLs**
```javascript
// Resource identification through URLs
GET    /api/teams           // Collection of teams
GET    /api/teams/:id       // Specific team
POST   /api/teams           // Create new team
PUT    /api/teams/:id       // Update specific team
DELETE /api/teams/:id       // Delete specific team
```

#### 3. **HTTP Methods Usage**
```javascript
// Proper HTTP method usage
app.get('/api/teams', getTeams);           // Retrieve
app.post('/api/teams', createTeam);        // Create
app.put('/api/teams/:id', updateTeam);     // Update
app.delete('/api/teams/:id', deleteTeam);  // Delete
```

#### 4. **HTTP Status Codes**
```javascript
// Appropriate status code usage
res.status(200).json({ data: teams });           // Success
res.status(201).json({ data: newTeam });         // Created
res.status(400).json({ error: 'Invalid data' }); // Bad Request
res.status(401).json({ error: 'Unauthorized' }); // Unauthorized
res.status(404).json({ error: 'Not found' });    // Not Found
res.status(500).json({ error: 'Server error' }); // Internal Error
```

#### 5. **Content Negotiation**
```javascript
// JSON content type
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Response format
res.json({
  success: true,
  data: result,
  message: 'Operation successful'
});
```

### API Endpoint Structure

#### Authentication Endpoints
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
GET    /api/auth/me          # Get current user
PUT    /api/auth/profile     # Update profile
GET    /api/auth/users       # Get all users (admin)
PUT    /api/auth/users/:id/status # Toggle user status
```

#### Team Management Endpoints
```
GET    /api/teams                    # Get all teams
POST   /api/teams                    # Create team
GET    /api/teams/:id                # Get specific team
PUT    /api/teams/:id                # Update team
DELETE /api/teams/:id                # Delete team
PUT    /api/teams/:id/assign-judge   # Assign judge
PUT    /api/teams/:id/participation  # Toggle participation
```

#### Criteria Management Endpoints
```
GET    /api/criteria           # Get all criteria
POST   /api/criteria           # Create criteria
GET    /api/criteria/:id       # Get specific criteria
PUT    /api/criteria/:id       # Update criteria
DELETE /api/criteria/:id       # Delete criteria
PUT    /api/criteria/:id/status # Toggle status
```

#### Round Management Endpoints
```
GET    /api/rounds           # Get all rounds
POST   /api/rounds           # Create round
GET    /api/rounds/:id       # Get specific round
PUT    /api/rounds/:id       # Update round
DELETE /api/rounds/:id       # Delete round
PUT    /api/rounds/:id/close # Close round
PUT    /api/rounds/:id/reopen # Reopen round
```

#### Scoring Endpoints
```
POST   /api/scores                    # Submit score
PUT    /api/scores/:id                # Update score
PUT    /api/scores/:id/submit         # Submit as final
GET    /api/scores/my-scores          # Get judge's scores
GET    /api/scores/team/:teamId       # Get team scores
GET    /api/scores/round/:roundId     # Get round scores
```

---

## 🗄️ Database Design

### MongoDB Collections

#### 1. **Users Collection**
```javascript
{
  _id: ObjectId,
  username: String,           // Unique username
  email: String,             // Unique email
  password: String,          // Hashed password
  role: String,              // 'admin' or 'judge'
  judgeInfo: {               // Only for judges
    company: String,
    position: String,
    experience: Number
  },
  isActive: Boolean,         // Account status
  lastLogin: Date,           // Last login timestamp
  createdAt: Date,           // Account creation
  createdBy: ObjectId        // Admin who created user
}
```

#### 2. **Teams Collection**
```javascript
{
  _id: ObjectId,
  teamName: String,          // Unique team name
  teamNumber: Number,        // Unique team number (1-15)
  members: [{                // Array of team members
    name: String,
    studentNumber: String,   // 8-digit student number
    email: String,
    role: String             // 'leader' or 'member'
  }],
  projectTitle: String,      // Project name
  projectDescription: String, // Project description
  isParticipating: Boolean,  // Participation status
  assignedJudges: [ObjectId], // Array of judge IDs
  totalScore: Number,        // Calculated total score
  averageScore: Number,      // Calculated average score
  createdAt: Date,
  createdBy: ObjectId
}
```

#### 3. **Criteria Collection**
```javascript
{
  _id: ObjectId,
  name: String,              // Criteria name
  description: String,       // Detailed description
  maxScore: Number,          // Maximum possible score
  weight: Number,            // Weight percentage (0-1)
  markingGuide: String,      // Detailed marking guide
  isActive: Boolean,         // Active status
  usageCount: Number,        // Times used in rounds
  createdAt: Date,
  createdBy: ObjectId
}
```

#### 4. **Rounds Collection**
```javascript
{
  _id: ObjectId,
  name: String,              // Round name
  description: String,       // Round description
  criteria: [ObjectId],      // Array of criteria IDs
  isActive: Boolean,         // Active status
  isOpen: Boolean,           // Open for scoring
  startDate: Date,           // Round start time
  endDate: Date,             // Round end time
  totalTeams: Number,        // Total participating teams
  completedEvaluations: Number, // Completed evaluations
  createdAt: Date,
  createdBy: ObjectId
}
```

#### 5. **Scores Collection**
```javascript
{
  _id: ObjectId,
  judge: ObjectId,           // Judge who scored
  team: ObjectId,            // Team being scored
  round: ObjectId,           // Round context
  criteria: ObjectId,        // Criteria being scored
  score: Number,             // Actual score given
  comments: String,          // Judge comments
  isSubmitted: Boolean,      // Final submission status
  submittedAt: Date,         // Submission timestamp
  version: Number,           // Version for tracking changes
  previousScore: Number,     // Previous score (for modifications)
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

```javascript
// Performance optimization indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.teams.createIndex({ teamNumber: 1 }, { unique: true });
db.teams.createIndex({ teamName: 1 }, { unique: true });
db.scores.createIndex({ judge: 1, team: 1, round: 1, criteria: 1 }, { unique: true });
db.scores.createIndex({ team: 1, round: 1 });
db.scores.createIndex({ judge: 1, round: 1 });
db.rounds.createIndex({ isActive: 1, isOpen: 1 });
```

### Data Relationships

```
Users (1) ──→ (Many) Teams (assignedJudges)
Users (1) ──→ (Many) Scores (judge)
Teams (1) ──→ (Many) Scores (team)
Rounds (1) ──→ (Many) Scores (round)
Criteria (1) ──→ (Many) Scores (criteria)
Rounds (1) ──→ (Many) Criteria (criteria array)
```

---

## 🔐 Authentication & Authorization

### JWT Token Implementation

#### Token Structure
```javascript
// JWT Payload
{
  id: "user_id",
  username: "username",
  email: "user@email.com",
  role: "admin" | "judge",
  iat: 1234567890,    // Issued at
  exp: 1234567890     // Expiration
}
```

#### Token Generation
```javascript
// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};
```

#### Password Hashing
```javascript
// Bcrypt implementation
const bcrypt = require('bcryptjs');

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password for login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### Role-Based Access Control (RBAC)

#### Middleware Implementation
```javascript
// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
```

#### Route Protection
```javascript
// Protected routes with role-based access
router.get('/teams', authenticate, authorize('admin', 'judge'), getTeams);
router.post('/teams', authenticate, authorize('admin'), createTeam);
router.get('/scores/my-scores', authenticate, authorize('judge'), getMyScores);
```

---

## ⚛️ Frontend Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Login (Public)
│   └── Protected Routes
│       ├── Admin Routes
│       │   ├── Dashboard
│       │   ├── TeamManagement
│       │   ├── CriteriaManagement
│       │   ├── UserManagement
│       │   ├── RoundManagement
│       │   ├── JudgeAssignment
│       │   ├── Results
│       │   └── Analytics
│       └── Judge Routes
│           ├── Dashboard
│           ├── TeamScoring
│           └── ScoreHistory
```

### State Management

#### React Query Implementation
```javascript
// Data fetching with caching
const { data: teams, isLoading, error } = useQuery(
  'teams',
  () => teamsAPI.getTeams(),
  {
    refetchInterval: 30000,  // Refetch every 30 seconds
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    cacheTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  }
);

// Mutations for data updates
const createTeamMutation = useMutation(
  (teamData) => teamsAPI.createTeam(teamData),
  {
    onSuccess: () => {
      queryClient.invalidateQueries('teams');
      toast.success('Team created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message);
    }
  }
);
```

#### Context for Global State
```javascript
// Authentication context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    setToken(response.data.token);
    setUser(response.data.user);
    localStorage.setItem('token', response.data.token);
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Form Management

#### React Hook Form Implementation
```javascript
const TeamForm = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      teamName: '',
      teamNumber: '',
      members: [
        { name: '', studentNumber: '', email: '', role: 'leader' },
        { name: '', studentNumber: '', email: '', role: 'member' },
        { name: '', studentNumber: '', email: '', role: 'member' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members'
  });

  const onSubmit = (data) => {
    // Validate and submit form data
    createTeamMutation.mutate(data);
  };
};
```

---

## 🧮 Key Algorithms

### 1. Judge Assignment Algorithm

#### Problem Statement
Distribute teams among judges ensuring:
- Each team gets minimum required judges
- Workload is balanced across judges
- No judge is overloaded
- Optimal time utilization

#### Algorithm Implementation
```javascript
const generateAssignments = (teams, judges, config) => {
  const assignments = [];
  const judgeWorkload = new Map();
  
  // Initialize judge workload
  judges.forEach(judge => {
    judgeWorkload.set(judge._id, 0);
  });
  
  // Sort teams by priority (if any)
  const sortedTeams = teams.sort((a, b) => a.priority - b.priority);
  
  // Assign teams to judges
  sortedTeams.forEach(team => {
    const teamAssignments = [];
    
    // Find available judges
    const availableJudges = judges.filter(judge => {
      const workload = judgeWorkload.get(judge._id);
      return workload < config.maxTeamsPerJudge;
    });
    
    // Assign required number of judges
    const requiredJudges = Math.min(
      config.judgesPerTeam,
      availableJudges.length
    );
    
    // Select judges with least workload
    const selectedJudges = availableJudges
      .sort((a, b) => judgeWorkload.get(a._id) - judgeWorkload.get(b._id))
      .slice(0, requiredJudges);
    
    // Create assignments
    selectedJudges.forEach(judge => {
      assignments.push({
        team: team._id,
        judge: judge._id,
        round: config.roundId
      });
      
      // Update workload
      judgeWorkload.set(judge._id, judgeWorkload.get(judge._id) + 1);
    });
  });
  
  return assignments;
};
```

### 2. Winner Calculation Algorithm

#### Scoring Logic
```javascript
const calculateWinner = (roundId) => {
  // Get all scores for the round
  const scores = await Score.find({ round: roundId, isSubmitted: true });
  
  // Group scores by team
  const teamScores = {};
  scores.forEach(score => {
    if (!teamScores[score.team]) {
      teamScores[score.team] = [];
    }
    teamScores[score.team].push(score);
  });
  
  // Calculate weighted averages
  const teamAverages = {};
  Object.keys(teamScores).forEach(teamId => {
    const teamScoreList = teamScores[teamId];
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    teamScoreList.forEach(score => {
      const weight = score.criteria.weight;
      const normalizedScore = (score.score / score.criteria.maxScore) * 100;
      totalWeightedScore += normalizedScore * weight;
      totalWeight += weight;
    });
    
    teamAverages[teamId] = totalWeightedScore / totalWeight;
  });
  
  // Find winner
  const winner = Object.keys(teamAverages).reduce((a, b) => 
    teamAverages[a] > teamAverages[b] ? a : b
  );
  
  return { winner, teamAverages };
};
```

### 3. Data Validation Algorithm

#### Input Validation
```javascript
const validateTeamData = (data) => {
  const errors = [];
  
  // Team name validation
  if (!data.teamName || data.teamName.length < 3) {
    errors.push('Team name must be at least 3 characters');
  }
  
  // Team number validation
  if (!data.teamNumber || data.teamNumber < 1 || data.teamNumber > 15) {
    errors.push('Team number must be between 1 and 15');
  }
  
  // Members validation
  if (!data.members || data.members.length < 3 || data.members.length > 4) {
    errors.push('Team must have 3-4 members');
  }
  
  // Leader validation
  const leaders = data.members.filter(member => member.role === 'leader');
  if (leaders.length !== 1) {
    errors.push('Team must have exactly one leader');
  }
  
  // Member details validation
  data.members.forEach((member, index) => {
    if (!member.name || member.name.length < 2) {
      errors.push(`Member ${index + 1}: Name must be at least 2 characters`);
    }
    
    if (!member.studentNumber || !/^\d{8}$/.test(member.studentNumber)) {
      errors.push(`Member ${index + 1}: Student number must be 8 digits`);
    }
    
    if (!member.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.push(`Member ${index + 1}: Invalid email format`);
    }
  });
  
  return errors;
};
```

---

## 🔒 Security Implementation

### 1. Input Sanitization
```javascript
const mongoSanitize = require('express-mongo-sanitize');

// Sanitize user input to prevent NoSQL injection
app.use(mongoSanitize());

// Example of sanitized input
const sanitizeInput = (input) => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim();
};
```

### 2. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use(limiter);

// Specific route rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit login attempts
  message: 'Too many login attempts'
});

app.use('/api/auth/login', authLimiter);
```

### 3. CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4. Security Headers
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));
```

---

## ⚠️ Error Handling

### Backend Error Handling

#### Global Error Handler
```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

#### Custom Error Classes
```javascript
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends ErrorResponse {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}
```

### Frontend Error Handling

#### Error Boundary
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

#### API Error Interceptor
```javascript
// Axios response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      authService.logout();
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Handle forbidden access
      toast.error('Access denied');
    }
    
    return Promise.reject(error);
  }
);
```

---

## 🚀 Performance Optimizations

### 1. Database Optimizations

#### Indexing Strategy
```javascript
// Compound indexes for common queries
db.scores.createIndex({ 
  judge: 1, 
  team: 1, 
  round: 1 
}, { unique: true });

// Partial indexes for active records
db.teams.createIndex(
  { isParticipating: 1 },
  { partialFilterExpression: { isParticipating: true } }
);
```

#### Query Optimization
```javascript
// Use projection to limit returned fields
const teams = await Team.find({ isParticipating: true })
  .select('teamName teamNumber members.name projectTitle')
  .lean(); // Return plain objects instead of Mongoose documents

// Use aggregation for complex queries
const teamStats = await Team.aggregate([
  { $match: { isParticipating: true } },
  { $group: {
    _id: null,
    totalTeams: { $sum: 1 },
    averageMembers: { $avg: { $size: '$members' } }
  }}
]);
```

### 2. Frontend Optimizations

#### Code Splitting
```javascript
// Lazy load components
const TeamManagement = lazy(() => import('./components/admin/TeamManagement'));
const JudgeDashboard = lazy(() => import('./components/judge/JudgeDashboard'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <TeamManagement />
</Suspense>
```

#### Memoization
```javascript
// Memoize expensive calculations
const TeamCard = memo(({ team, onEdit, onDelete }) => {
  const memberCount = useMemo(() => team.members.length, [team.members]);
  const leaderName = useMemo(() => 
    team.members.find(m => m.role === 'leader')?.name, 
    [team.members]
  );
  
  return (
    <div className="team-card">
      <h3>{team.teamName}</h3>
      <p>Members: {memberCount}</p>
      <p>Leader: {leaderName}</p>
    </div>
  );
});
```

#### Virtual Scrolling
```javascript
// For large lists
import { FixedSizeList as List } from 'react-window';

const TeamList = ({ teams }) => (
  <List
    height={600}
    itemCount={teams.length}
    itemSize={100}
    itemData={teams}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <TeamCard team={data[index]} />
      </div>
    )}
  </List>
);
```

### 3. Caching Strategy

#### React Query Caching
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
```

#### API Response Caching
```javascript
// Cache API responses
const cache = new Map();

const cachedRequest = async (url, options) => {
  const key = `${url}-${JSON.stringify(options)}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const response = await fetch(url, options);
  cache.set(key, response);
  
  return response;
};
```

---

## 🧪 Testing Strategy

### 1. Backend Testing

#### Unit Tests
```javascript
// Example test for user model
describe('User Model', () => {
  test('should hash password before saving', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'plainpassword'
    });
    
    await user.save();
    
    expect(user.password).not.toBe('plainpassword');
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/);
  });
  
  test('should match password correctly', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'plainpassword'
    });
    
    await user.save();
    
    const isMatch = await user.matchPassword('plainpassword');
    expect(isMatch).toBe(true);
  });
});
```

#### Integration Tests
```javascript
// Example test for team API
describe('Team API', () => {
  test('should create team with valid data', async () => {
    const teamData = {
      teamName: 'Test Team',
      teamNumber: 1,
      projectTitle: 'Test Project',
      members: [
        { name: 'John Doe', studentNumber: '12345678', email: 'john@example.com', role: 'leader' },
        { name: 'Jane Smith', studentNumber: '87654321', email: 'jane@example.com', role: 'member' }
      ]
    };
    
    const response = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(teamData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.teamName).toBe('Test Team');
  });
});
```

### 2. Frontend Testing

#### Component Tests
```javascript
// Example test for TeamCard component
import { render, screen, fireEvent } from '@testing-library/react';
import TeamCard from './TeamCard';

test('renders team information correctly', () => {
  const mockTeam = {
    teamName: 'Test Team',
    teamNumber: 1,
    members: [
      { name: 'John Doe', role: 'leader' },
      { name: 'Jane Smith', role: 'member' }
    ]
  };
  
  render(<TeamCard team={mockTeam} />);
  
  expect(screen.getByText('Test Team')).toBeInTheDocument();
  expect(screen.getByText('Team #1')).toBeInTheDocument();
  expect(screen.getByText('John Doe (Leader)')).toBeInTheDocument();
});
```

#### Integration Tests
```javascript
// Example test for team creation flow
test('should create team successfully', async () => {
  render(<TeamManagement />);
  
  fireEvent.click(screen.getByText('Create Team'));
  
  fireEvent.change(screen.getByLabelText('Team Name'), {
    target: { value: 'New Team' }
  });
  
  fireEvent.change(screen.getByLabelText('Team Number'), {
    target: { value: '5' }
  });
  
  fireEvent.click(screen.getByText('Create Team'));
  
  await waitFor(() => {
    expect(screen.getByText('Team created successfully')).toBeInTheDocument();
  });
});
```

---

## 🐳 Deployment Architecture

### Docker Configuration

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: student-marking-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: student-marking-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/student-marking-app?authSource=admin
      JWT_SECRET: your-jwt-secret
      NODE_ENV: production
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: student-marking-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

---

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
**Description**: Register a new user (admin only)

**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "admin" | "judge",
  "judgeInfo": {
    "company": "string",
    "position": "string",
    "experience": "number"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
}
```

#### POST /api/auth/login
**Description**: Authenticate user and return token

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  }
}
```

### Team Management Endpoints

#### GET /api/teams
**Description**: Get all teams (filtered by role)

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `isParticipating`: Filter by participation status

**Response**:
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": "string",
        "teamName": "string",
        "teamNumber": "number",
        "members": [
          {
            "name": "string",
            "studentNumber": "string",
            "email": "string",
            "role": "leader" | "member"
          }
        ],
        "projectTitle": "string",
        "isParticipating": "boolean"
      }
    ],
    "pagination": {
      "current": "number",
      "pages": "number",
      "total": "number"
    }
  }
}
```

#### POST /api/teams
**Description**: Create a new team (admin only)

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "teamName": "string",
  "teamNumber": "number",
  "projectTitle": "string",
  "projectDescription": "string",
  "members": [
    {
      "name": "string",
      "studentNumber": "string",
      "email": "string",
      "role": "leader" | "member"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "team": {
      "id": "string",
      "teamName": "string",
      "teamNumber": "number",
      "members": "array",
      "projectTitle": "string",
      "createdAt": "string"
    }
  }
}
```

### Scoring Endpoints

#### POST /api/scores
**Description**: Submit a score for a team (judge only)

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "teamId": "string",
  "roundId": "string",
  "criteriaId": "string",
  "score": "number",
  "comments": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "score": {
      "id": "string",
      "team": "string",
      "criteria": "string",
      "score": "number",
      "comments": "string",
      "isSubmitted": "boolean"
    }
  }
}
```

---

## 📊 Code Quality & Standards

### 1. Code Organization

#### File Structure Standards
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── admin/          # Admin-specific components
│   ├── judge/          # Judge-specific components
│   └── auth/           # Authentication components
├── services/           # API service layer
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
└── styles/             # CSS and styling
```

#### Naming Conventions
```javascript
// Components: PascalCase
const TeamManagement = () => {};

// Functions: camelCase
const calculateTeamScore = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_TEAM_MEMBERS = 4;

// Files: kebab-case
// team-management.js
// user-service.js
```

### 2. Code Documentation

#### JSDoc Comments
```javascript
/**
 * Calculate the weighted average score for a team
 * @param {Array} scores - Array of score objects
 * @param {Array} criteria - Array of criteria objects
 * @returns {number} Weighted average score (0-100)
 * @throws {Error} If scores or criteria are invalid
 */
const calculateWeightedAverage = (scores, criteria) => {
  // Implementation
};
```

#### Inline Comments
```javascript
// Hash password using bcrypt with salt rounds of 12
const hashedPassword = await bcrypt.hash(password, 12);

// Validate that team has exactly one leader
const leaders = members.filter(member => member.role === 'leader');
if (leaders.length !== 1) {
  throw new ValidationError('Team must have exactly one leader');
}
```

### 3. Error Handling Standards

#### Consistent Error Format
```javascript
// Backend error response
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}

// Frontend error handling
try {
  await api.createTeam(teamData);
} catch (error) {
  if (error.response?.status === 400) {
    toast.error('Invalid team data');
  } else if (error.response?.status === 409) {
    toast.error('Team name already exists');
  } else {
    toast.error('Failed to create team');
  }
}
```

### 4. Performance Standards

#### Bundle Size Optimization
```javascript
// Use dynamic imports for code splitting
const TeamManagement = lazy(() => import('./TeamManagement'));

// Tree shaking for unused code
import { debounce } from 'lodash/debounce'; // Instead of entire lodash

// Optimize images
<img 
  src={teamImage} 
  alt="Team" 
  loading="lazy"
  width={300}
  height={200}
/>
```

#### Database Query Optimization
```javascript
// Use lean() for read-only operations
const teams = await Team.find({ isParticipating: true }).lean();

// Use select() to limit returned fields
const teamNames = await Team.find({}, 'teamName teamNumber').lean();

// Use aggregation for complex queries
const stats = await Team.aggregate([
  { $match: { isParticipating: true } },
  { $group: { _id: null, count: { $sum: 1 } } }
]);
```

---

## 🎯 Conclusion

The **Student Project Marking WebApp** represents a comprehensive full-stack solution that demonstrates:

### Technical Excellence
- **Modern Architecture**: RESTful API with React frontend
- **Security Best Practices**: JWT authentication, input validation, rate limiting
- **Performance Optimization**: Database indexing, caching, code splitting
- **Error Handling**: Comprehensive error boundaries and validation
- **Testing Strategy**: Unit and integration testing framework

### Business Value
- **Streamlined Process**: Digital evaluation workflow
- **Fair Assessment**: Structured criteria-based scoring
- **Efficient Management**: Automated judge assignment
- **Data Insights**: Analytics and reporting capabilities
- **Scalability**: Designed for future growth

### Code Quality
- **Clean Architecture**: Separation of concerns
- **Documentation**: Comprehensive inline and external documentation
- **Standards**: Consistent coding conventions
- **Maintainability**: Modular, reusable components
- **Deployment Ready**: Docker containerization and deployment guides

This project showcases the skills and knowledge expected of a third-year Computer Science student, with production-ready code that could be deployed and used in a real academic environment.

---

**Built with ❤️ for Akademia's Computer Science Program**
