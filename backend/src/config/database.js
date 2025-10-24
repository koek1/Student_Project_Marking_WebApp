const mongoose = require('mongoose');

// Database connection config:

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,    // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000,     // Timeout after 5 seconds
            socketTimeoutMS: 45000,    //Close the connection after 45 seconds of inactivity
            bufferCommands: false,
        });

        console.log(`MongoDB connected: ${conn.connection.host}`);

        // Handle connection events:
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error: ', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB has reconnected');
        });
    }catch (err) {
        console.error('MongoDB connection error: ', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;