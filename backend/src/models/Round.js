const mongoose = require('mongoose');

// Rounds Schema:
const roundSchema = new mongoose.Schema({
  // Round identification
  name: {
    type: String,
    required: [true, 'Round name is required'],
    trim: true,
    minlength: [3, 'Round name must be at least 3 characters'],
    maxlength: [100, 'Round name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Round configuration
  criteria: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Criteria',
    required: true
  }],
  
  // Round status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isOpen: {
    type: Boolean,
    default: true
  },
  
  // Time constraints
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(endDate) {
        return endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  
  // Round statistics
  totalTeams: {
    type: Number,
    default: 0,
    min: [0, 'Total teams cannot be negative']
  },
  
  completedEvaluations: {
    type: Number,
    default: 0,
    min: [0, 'Completed evaluations cannot be negative']
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Indexes for better query performance
roundSchema.index({ isActive: 1 });
roundSchema.index({ isOpen: 1 });
roundSchema.index({ startDate: 1, endDate: 1 });


// Virtual field to get completion percentage
roundSchema.virtual('completionPercentage').get(function() {
  if (this.totalTeams === 0) return 0;
  return Math.round((this.completedEvaluations / this.totalTeams) * 100);
});

// Virtual field to get total possible score
roundSchema.virtual('totalPossibleScore').get(function() {
  return this.criteria.reduce((total, criteria) => {
    return total + (criteria.maxScore || 0);
  }, 0);
});


//Instance method to close the round
roundSchema.methods.closeRound = function() {
  this.isOpen = false;
  return this.save();
};


 // Instance method to reopen the round
roundSchema.methods.reopenRound = function() {
  this.isOpen = true;
  return this.save();
};

 //Instance method to update evaluation count
roundSchema.methods.updateEvaluationCount = function(increment = 1) {
  this.completedEvaluations += increment;
  return this.save();
};


// Static method to get active rounds
roundSchema.statics.getActiveRounds = function() {
  return this.find({ 
    isActive: true,
    isOpen: true 
  }).populate('criteria', 'name maxScore weight');
};

// Static method to get round statistics

roundSchema.statics.getRoundStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalRounds: { $sum: 1 },
        activeRounds: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        openRounds: {
          $sum: { $cond: ['$isOpen', 1, 0] }
        },
        averageCompletion: {
          $avg: {
            $cond: [
              { $gt: ['$totalTeams', 0] },
              { $multiply: [{ $divide: ['$completedEvaluations', '$totalTeams'] }, 100] },
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalRounds: 0,
    activeRounds: 0,
    openRounds: 0,
    averageCompletion: 0
  };
};

module.exports = mongoose.model('Round', roundSchema);