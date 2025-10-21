const app = require('./app');

// Shutdown handling:
process.on('SIGTERM', () => {
    console.log('SIGTERM signal recieved, shutting down gracefully . . .');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal recieved, shutting down gracefully . . .');
    process.exit(0);
});


// Handle uncaught exceotions:
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections:
process.on('inhandledRejection', (err) => {
    console.error('Unhandled Rejection: ', err);
    process.exit(1);
});