const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createDockerAdminUser() {
    try {
        // Connect to Docker MongoDB with authentication
        const mongoUri = 'mongodb://admin:password123@localhost:27017/student_project_marking?authSource=admin';
        await mongoose.connect(mongoUri);
        console.log('Connected to Docker MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists in Docker MongoDB');
            process.exit(0);
        }

        // Create admin user
        const adminUser = await User.create({
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            isActive: true
        });

        console.log('Admin user created successfully in Docker MongoDB:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Role: admin');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createDockerAdminUser();
