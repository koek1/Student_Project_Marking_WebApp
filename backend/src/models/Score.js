const mongoose = require('mongoose');

//Score Schema 

const scoreSchema = new mongoose.Schema({
  // Score identification
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Judge is required']
  },
  
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team is required']
  },
  
  round: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: [true, 'Round is required']
  },
  
  criteria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Criteria',
    required: [true, 'Criteria is required']
  },
  
  // Score value
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  
  // Additional score information
  comments: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comments cannot exceed 1000 characters']
  },
  
  // Score metadata
  isSubmitted: {
    type: Boolean,
    default: false
  },
  
  submittedAt: {
    type: Date,
    default: null
  },
  
  // Version tracking for score modifications
  version: {
    type: Number,
    default: 1
  },
  
  // Previous score for audit trail
  previousScore: {
    type: Number,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Compound indexes for better query performance
scoreSchema.index({ judge: 1, team: 1, round: 1, criteria: 1 }, { unique: true });
scoreSchema.index({ team: 1, round: 1 });
scoreSchema.index({ judge: 1, round: 1 });
scoreSchema.index({ isSubmitted: 1 });

//Pre-save middleware to handle score updates
scoreSchema.pre('save', async function(next) {
  try {
    // If this is an update and score has changed, track the previous score
    if (this.isModified('score') && !this.isNew) {
      const existingDoc = await this.constructor.findById(this._id).select('score');
      this.previousScore = existingDoc?.score || null;
      this.version += 1;
    }
    
    // Set submitted timestamp when score is submitted
    if (this.isModified('isSubmitted') && this.isSubmitted && !this.submittedAt) {
      this.submittedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});


// Instance method to submit the score
scoreSchema.methods.submitScore = function() {
  this.isSubmitted = true;
  this.submittedAt = new Date();
  return this.save();
};

// Instance method to modify the score
scoreSchema.methods.modifyScore = function(newScore, comments = '') {
  this.previousScore = this.score;
  this.score = newScore;
  this.comments = comments;
  this.version += 1;
  this.isSubmitted = false; // Reset submission status
  this.submittedAt = null;
  return this.save();
};


//Static method to get scores for a specific team in a round
scoreSchema.statics.getTeamScores = function(teamId, roundId) {
  return this.find({ team: teamId, round: roundId })
    .populate('judge', 'username email')
    .populate('criteria', 'name maxScore weight')
    .sort({ createdAt: -1 });
};


// Static method to get scores by a specific judge
scoreSchema.statics.getJudgeScores = function(judgeId, roundId) {
  return this.find({ judge: judgeId, round: roundId })
    .populate('team', 'teamName teamNumber members')
    .populate('criteria', 'name maxScore weight')
    .sort({ createdAt: -1 });
};


 // Static method to calculate team's total score for a round
scoreSchema.statics.getTeamScoreSummary = async function(teamId, roundId) {
  const scores = await this.find({ team: teamId, round: roundId, isSubmitted: true });
  
  const summary = {
    totalScore: 0,
    maxPossibleScore: 0,
    averageScore: 0,
    criteriaScores: [],
    judgeCount: new Set(scores.map(s => s.judge.toString())).size
  };
  
  // Group scores by criteria
  const scoresByCriteria = {};
  scores.forEach(score => {
    const criteriaId = score.criteria.toString();
    if (!scoresByCriteria[criteriaId]) {
      scoresByCriteria[criteriaId] = [];
    }
    scoresByCriteria[criteriaId].push(score);
  });
  
  // Calculate scores for each criteria
  for (const [criteriaId, criteriaScores] of Object.entries(scoresByCriteria)) {
    const averageScore = criteriaScores.reduce((sum, s) => sum + s.score, 0) / criteriaScores.length;
    const maxScore = criteriaScores[0].criteria?.maxScore || 100;
    
    summary.criteriaScores.push({
      criteriaId,
      averageScore,
      maxScore,
      judgeCount: criteriaScores.length
    });
    
    summary.totalScore += averageScore;
    summary.maxPossibleScore += maxScore;
  }
  
  summary.averageScore = summary.maxPossibleScore > 0 
    ? (summary.totalScore / summary.maxPossibleScore) * 100 
    : 0;
  
  return summary;
};


// Static method to get score statistics
scoreSchema.statics.getScoreStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalScores: { $sum: 1 },
        submittedScores: {
          $sum: { $cond: ['$isSubmitted', 1, 0] }
        },
        averageScore: { $avg: '$score' },
        maxScore: { $max: '$score' },
        minScore: { $min: '$score' }
      }
    }
  ]);
  
  return stats[0] || {
    totalScores: 0,
    submittedScores: 0,
    averageScore: 0,
    maxScore: 0,
    minScore: 0
  };
};

module.exports = mongoose.model('Score', scoreSchema);