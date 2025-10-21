const mongoose = require('mongoose');

// Team member schema:
const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Member name is required'],
        trim: true,
        maxLength: [100, 'Name cannot be longer than 100 characters']
    },

    studentNumber: {
        type: String,
        required: [true, 'Student number is required'],
        trim: true,
        match: [/^\d{8}$/, 'Student number must be 8 digits']
    },

    email: {
        type: String,
        required: [true, 'Student email is required'],
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },

    role: {
        type: String,
        enum: ['leader', 'member'],
        default: 'member'
    }
}, { _id: true });


// Team Schema - Define the structure for project teams:
const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: [true, 'Team name is required'],
        unique: true,
        trim: true,
        minLength: [3, 'Team name cannot be shorter than 3 characters'],
        maxLength: [100, 'Team name cannot be longer than 100 characters long']
    },

    teamNumber: {
        type: Number,
        required: [true, 'Team number is required'],
        unique: true,
        min: [1, 'Team number must be positive'],
        max: [15, 'Maximum of 15 teams are allowed'],
    },

    members: {
        type: [teamMemberSchema],
        required: [true, 'Team members are required'],
        validate: {
            validator: function(members) {
                return members.length >= 3 && members.length <= 4;
            },
            message: 'Teams must contain 3 to 4 members'
        }
    },

    // Project Information:
    projectTitle: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxLength: [ 200, 'Project title cannot exceed 200 characters']
    },

    projectDescription: {
        type: String,
        trim: true,
        maxLength: [1000, 'Project description must be less than 1000 characters']
    },

    // Team status and participation:
    isParticipating: {
        type: Boolean,
        default: true,
    },

    // Assignment to judges:
    assignedJudges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        validate: {
            validator: function(judges) {
                return judges.length <= 3;    // Max 3 judges per team
            },
            message: 'Team cannot be assigned to more than 3 judges'
        }
    }],

    // Team performance tracking:
    totalScore: {
        type: Number,
        default: 0,
        min: [0, 'Average score cannot be negative']
    },

    averageScore: {
        type: Number,
        default: 0,
        min: [0, 'Average score cannot be negative']
    },

    // Metadata:
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtual: true },
    toObject: {virtuals: true}
});


// Indexes for better query handling:
teamSchema.index({ teamNumber: 1 });
teamSchema.index({isParticipating: 1 });
teamSchema.index({ assignedJudges: 1 });
teamSchema.index({ totalScore: 1 });

// Virtual field to get the team leader:
teamSchema.virtual('teamLeader').get(function() {
    return this.members.find(member => member.role === 'leader') || this.members[0];
});

// Virtual field to get the member count:
teamSchema.virtual('memberCount').get(function() {
    return this.members.length;
});


// Instance method to add judges to the team:
teamSchema.methods.assignJudges = function(judgeId) {
    if (!this.assignedJudges.includes(judgeId)) {
        this.assignedJudges.push(judgeId);
    }
    return this.save();
};

// Instance method to remove a judge from the team scores:
teamSchema.methods.updateScore = function(judgeId) {
    this.assignedJudges = this.assignedJudges.filtyer(id => !id.equals(judgeId));
    return this.save();
};


// Instance method to update team scores:
teamSchema.methods.updateScore = async function(newScore) {
    this.totalScore += newScore;
    this.averageScore = this.totalScore / this.assignedJudges.length;
    return this.save();
};


// Static method to get the teams assigned to specific judge:
teamSchema.statics.getTeamsForJudge = function(judgeId) {
    return this.find({
        assignedJudges: judgeId,
        isParticipating: true
    }).populate('assignedJudges', 'username email');
};


// Static method to retrieve team stats:
teamSchema.statics.getTeamStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalTeams: { $sum: 1},
                participatingTeams: {
                    $sum: {$cond: ['$isParticipating', 1, 0] }
                },
                averageMembers: {$avg: { $size: '$members' } },
                totalMembers: {$sum: { $size: '$members' } }
            }
        }
    ]);

    return stats[0] || {
        totalTeams: 0,
        participatingTeams: 0,
        averageMembers: 0,
        totalMembers: 0,
    };
};

module.exports = mongoose.model('Team', teamSchema);
