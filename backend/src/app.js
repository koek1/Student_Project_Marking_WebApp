const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

// Import Routes:
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const criteriaRoutes = require('./routes/criteria');
const roundRoutes = require('./routes/rounds');
const scoreRoutes = require('./routes/scores');

// Import middleware:
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security Middleware:
app.use(helmet());    // Set various HTTP headers for security
app.use(mongoSanitize());    // Prevent NoSQL injection attacks

// Rate Limiting - Prevent DDoS attacks (basic attacks):
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 Minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Compression middleware - reduces response size:
app.use(compression());

// CORS configuration - allows frontend to communicate with the backend:
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Body parsing middleware:
app.use(express.json({ limit: '10mb' }));    //Parse JSON bodies up to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));    //Parse URL-encoded bodies up to 10MB 

//Database connection:
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-project-marking', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
});

// Health check endpoint:
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes:
app.use('/api/auth', authRoutes);
app.use('api/teams', teamRoutes);
app.use('api/criteria', criteriaRoutes);
app.use('api/rounds', roundRoutes);
app.use('api/scores', scoreRoutes);

// 404 handler for undefined routes:
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Global error handler:
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
    console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});

module.exports = app;
