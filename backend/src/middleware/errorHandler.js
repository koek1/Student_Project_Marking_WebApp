// Global error handling middleware:

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    //Log error:
    console.error('Error:', err);

    // Mongoose bad ObjectID:
    if (err.name === 'CastError') {
        const message = 'Resource not found . . .';
        error = {message, statusCode: 404};
    }

    // Mongoose duplicate key:
    if (err.code === 11000) {
        const message = 'Duplicate value entered';
        error = {message, statusCode: 400};
    }

    // Mongoose validation error:
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = {message, statusCode: 400};
    }

    //JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid Token';
        error = {message, statusCode: 401};
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = {message, statusCode: 401};
    }

    // Return JSON response:
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
    });
}

module.exports = { errorHandler };