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
        ref: 'User'
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

// Schema-level validation for assignedJudges array length
teamSchema.pre('save', function(next) {
    if (this.assignedJudges && this.assignedJudges.length > 3) {
        const error = new Error('Team cannot be assigned to more than 3 judges');
        error.name = 'ValidationError';
        return next(error);
    }
    next();
});

// Virtual field to get the team leader:
teamSchema.virtual('teamLeader').get(function() {
    return this.members.find(member => member.role === 'leader') || this.members[0];
});

// Virtual field to get the member count:
teamSchema.virtual('memberCount').get(function() {
    return this.members.length;
});


// Instance method to add a judge to the team:
teamSchema.methods.assignJudge = function(judgeId) {
    console.log('=== TEAM MODEL assignJudge START ===');
    console.log('Current assignedJudges:', this.assignedJudges);
    console.log('JudgeId to assign:', judgeId);
    console.log('JudgeId type:', typeof judgeId);
    
    // Check if judge is already assigned using ObjectId comparison
    const isAlreadyAssigned = this.assignedJudges.some(id => id.toString() === judgeId.toString());
    console.log('Is already assigned:', isAlreadyAssigned);
    
    if (!isAlreadyAssigned) {
        // Check if we're at the maximum limit
        if (this.assignedJudges.length >= 3) {
            console.log('Team already has maximum judges (3)');
            throw new Error('Team cannot have more than 3 judges assigned');
        }
        
        console.log('Adding judge to assignedJudges array');
        this.assignedJudges.push(judgeId);
        console.log('New assignedJudges:', this.assignedJudges);
    } else {
        console.log('Judge already assigned, skipping');
    }
    
    console.log('Saving team...');
    return this.save().then(savedTeam => {
        console.log('Team saved successfully');
        console.log('Final assignedJudges:', savedTeam.assignedJudges);
        console.log('=== TEAM MODEL assignJudge END ===');
        return savedTeam;
    }).catch(saveError => {
        console.error('Error saving team:', saveError);
        console.log('=== TEAM MODEL assignJudge ERROR ===');
        throw saveError;
    });
};

// Instance method to remove a judge from the team:
teamSchema.methods.unassignJudge = function(judgeId) {
    this.assignedJudges = this.assignedJudges.filter(id => id.toString() !== judgeId.toString());
    return this.save();
};

// Instance method to update team scores:
teamSchema.methods.updateScore = async function(newScore) {
    this.totalScore += newScore;
    this.averageScore = this.totalScore / this.assignedJudges.length;
    return this.save();
};


// Static method to get the teams assigned to specific judge:
teamSchema.statics.getTeamsForJudge = async function(judgeId) {
    console.log('=== TEAM MODEL getTeamsForJudge ===');
    console.log('Looking for teams assigned to judge:', judgeId);
    
    try {
        const teams = await this.find({
            assignedJudges: judgeId,
            isParticipating: true
        }).populate('assignedJudges', 'username email');
        
        console.log('Found teams in model:', teams.length);
        console.log('Teams details:', teams.map(t => ({ 
            id: t._id, 
            name: t.teamName, 
            assignedJudges: t.assignedJudges.map(j => j._id || j) 
        })));
        
        return teams;
    } catch (error) {
        console.error('Error in getTeamsForJudge static method:', error);
        throw error;
    }
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
