const mongoose = require('mongoose');

// Criteria Schema - Define evaluation criteria for projects:
const criteriaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Criteria name is required'],
        unique: true,
        trim: true,
        minLength: [3, 'Criteria name cannot be less than 3 characters'],
        maxLength: [100, 'Criteria name cannot exceed 100 characters']
    },

    description: {
        type: String,
        required: [true, 'Criteria description is required'],
        trim: true,
        maxLength: [500, 'Description cannot exceed 500 characters']
    },

    // Scoring config:
    maxScore: {
        type: Number,
        required: [true, 'Max score is required'],
        min: [1, 'Max score must be at least 1'],
        max: [100, 'Max score cannot exceed 100']
    },

    weight: {
        type: Number,
        required: [true, 'Criteria weight is required'],
        min: [0, 'Weight cannot be negative'],
        max: [1, 'Weight cannot exceed one'],
        default: 1.0
    },

    // Marking guide for judges:
    markingGuide: {
        type: String,
        required: [true, 'Marking guide is required'],
        trim: true,
        maxLength: [2000, 'Marking guide cannot be longer than 200 characters]']
    },

    // Criteria status:
    isActive: {
        type: Boolean,
        default: true
    },

    // Usage tracking:
    usageCount: {
        type: Number,
        default: 0,
        min: [0, 'Usage count cannot be negative']
    },

    //Metadata:
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    }
}, {
    timestamps: true,
    toJSON: ({ vitrual: true }),
    toObject: ({ virtual: true })
});


// Indexes for better query performance:
criteriaSchema.index({ name: 1 });
criteriaSchema.index({ isActive: 1 });
criteriaSchema.index({ usageCount: -1 });


// Instance method to increment usage count:
criteriaSchema.methods.incrementUsage = function() {
    this.usageCount += 1;
    return this.save();
};

// Instance method to decrement usage count
criteriaSchema.methods.decrementUsage = function() {
    this.usageCount -= Math.max(0, this.usageCount - 1);
    return this.save();
};


// Static method to get the most used criteria:
criteriaSchema.statics.getMostUsed = function(limit = 10) {
    return this.find({ isActive: true })
    .sort({ usageCount: -1 })
    .limit(limit);
};

// Static method to get criteria stats:
criteriaSchema.statics.getCriteriaStats = async function() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalCriteria: { $sum: 1 },
          activeCriteria: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          averageMaxScore: { $avg: '$maxScore' },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);
    
    return stats[0] || {
      totalCriteria: 0,
      activeCriteria: 0,
      averageMaxScore: 0,
      totalUsage: 0
    };
  };

module.exports = mongoose.model('Criteria', criteriaSchema);