const express = require('express');
const Criteria = require('../models/Criteria');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateCriteriaCreation } = require('../middleware/validation');

const router = express.Router();


// POST /api/criteria - Create new criteria (admin only) 
router.post('/', authenticate, requireAdmin, validateCriteriaCreation, async (req, res) => {
  try {
    const { name, description, maxScore } = req.body;
    
    // Check if criteria name already exists
    const existingCriteria = await Criteria.findOne({ name });
    if (existingCriteria) {
      return res.status(400).json({
        success: false,
        message: 'Criteria with this name already exists'
      });
    }
    
    // Create criteria
    const criteria = await Criteria.create({
      name,
      description,
      maxScore,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Criteria created successfully',
      data: { criteria }
    });
    
  } catch (error) {
    console.error('Create criteria error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating criteria'
    });
  }
});


//GET /api/criteria - Get all criteria
router.get('/', authenticate, async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10, sortBy = 'name' } = req.query;
    
    // Build filter object
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get criteria with pagination
    const criteria = await Criteria.find(filter)
      .populate('createdBy', 'username email')
      .sort({ [sortBy]: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Criteria.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        criteria,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get criteria error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching criteria'
    });
  }
});


// GET /api/criteria/:id - Get single criteria
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const criteria = await Criteria.findById(id)
      .populate('createdBy', 'username email');
    
    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'Criteria not found'
      });
    }
    
    res.json({
      success: true,
      data: { criteria }
    });
    
  } catch (error) {
    console.error('Get criteria error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching criteria'
    });
  }
});


// PUT /api/criteria/:id - Update criteria (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData.usageCount;
    delete updateData.createdBy;
    
    const criteria = await Criteria.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'username email');
    
    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'Criteria not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Criteria updated successfully',
      data: { criteria }
    });
    
  } catch (error) {
    console.error('Update criteria error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating criteria'
    });
  }
});


// DELETE /api/criteria/:id - Delete criteria (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if criteria is being used in any rounds
    const Round = require('../models/Round');
    const roundsUsingCriteria = await Round.find({ criteria: id });
    
    if (roundsUsingCriteria.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete criteria that is being used in rounds',
        data: { roundsUsingCriteria: roundsUsingCriteria.length }
      });
    }
    
    const criteria = await Criteria.findByIdAndDelete(id);
    
    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'Criteria not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Criteria deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete criteria error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting criteria'
    });
  }
});


// PUT /api/criteria/:id/status - Toggle criteria active status (admin only)
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const criteria = await Criteria.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'username email');
    
    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'Criteria not found'
      });
    }
    
    res.json({
      success: true,
      message: `Criteria ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { criteria }
    });
    
  } catch (error) {
    console.error('Toggle criteria status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating criteria status'
    });
  }
});


// GET /api/criteria/most-used - Get most used criteria
router.get('/stats/most-used', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const mostUsed = await Criteria.getMostUsed(parseInt(limit));
    
    res.json({
      success: true,
      data: { mostUsed }
    });
    
  } catch (error) {
    console.error('Get most used criteria error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching most used criteria'
    });
  }
});


// GET /api/criteria/stats - Get criteria statistics (admin only)
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await Criteria.getCriteriaStats();
    
    res.json({
      success: true,
      data: { stats }
    });
    
  } catch (error) {
    console.error('Get criteria stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching criteria statistics'
    });
  }
});

module.exports = router;