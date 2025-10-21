const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema - defines roles and structure for users:
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minLength: [3, 'Username must contain at least 3 characters'],
        maxLength: [30, 'Username cannot be longer than 30 characters'],
        match: [/^a-zA-Z0-9_]+/, 'Username may only contain letters, numbers, and underscores']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, 'Password must contain at least 6 characters'],
        select: false    // Exclude password queries
    },

    // Role based access:
    role: {
        type: String,
        enum: ['admin', 'judge'],
        required: [true, 'Role is required'],
        default: 'judge'
    },

    // Judge specific info:
    judgeInfo: {
        company: {
            type: String,
            trim: true,
            maxlength: [100, 'Company name cannot be longer than 100 characters']
        },
        position: {
            type: String,
            trim: true,
            maxLength: [100, "Position cannot be longer than 100 characters"]
        },
        experience: {
            type: Number,
            min: [0, 'Experience years cannot be nagative'],
            max: [50, 'Experience cannot be longer than 50 years']
        }
    },

    // Account status and metadata:
    isActive: {
        type: Boolean,
        default: true
    },

    lastLogin: {
        type: Date,
        default: null
    },


    // Password reset functionality:
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Account creation and modification tracking:
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,    // Automatically adds creatyedAt and updatedAt fields
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// Index for better query performance:
userSchema.index({ email: 1 });
userSchema.indes({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual field to get the user's full name:
userSchema.virtual('fullname').get(function() {
    return this.username;
});

// Pre-save middleware to hash the password before saving:
userSchema.pre('save', async function(next) {
    // Only hash the password if its new or newly updated:
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt with cost factor of 12:
        const salt = await bcrypt.genSalt(12);
        //Hash the password with the salt:
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check if provided password matches the stored hash:
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to return JWT token:
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        {
            id: this.id,
            role: this.role,
            username: this.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '7d' 
        }
    )
};

// Static method to find user by email and include password:
userSchema.statics.findByEmailForAuth = function(email) {
    return this.findOne({email, isActive: true}).select('+password');
};

// Instance method to update last login timestamp:
userSchema.statics.getUserStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 },
                activeCount: {
                    $sum: { $cond: ['$isActive', 1, 0] }
                }
            }
        }
    ]);

    return stats;
};

module.exports = mongoose.model('User', userSchema);