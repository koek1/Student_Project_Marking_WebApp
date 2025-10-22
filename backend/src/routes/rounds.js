const express = require('express');
const Round = require('../models/Round');
const Criteria = require('../models/Criteria');
const Team = require('../models/Team');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();


// POST /api/rounds - Create new round (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, criteria, startDate, endDate } = req.body;
    
    // Validate criteria exist and are active
    const criteriaDocs = await Criteria.find({ 
      _id: { $in: criteria }, 
      isActive: true 
    });
    
    if (criteriaDocs.length !== criteria.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more criteria are invalid or inactive'
      });
    }
    
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }
    
    // Create round
    const round = await Round.create({
      name,
      description,
      criteria,
      startDate: start,
      endDate: end,
      createdBy: req.user._id
    });
    
    // Increment usage count for criteria
    await Promise.all(
      criteriaDocs.map(criteriaDoc => criteriaDoc.incrementUsage())
    );
    
    // Populate criteria details
    const populatedRound = await Round.findById(round._id)
      .populate('criteria', 'name description maxScore weight markingGuide');
    
    res.status(201).json({
      success: true,
      message: 'Round created successfully',
      data: { round: populatedRound }
    });
    
  } catch (error) {
    console.error('Create round error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating round'
    });
  }
});


// GET /api/rounds - Get all rounds
router.get('/', authenticate, async (req, res) => {
  try {
    const { isActive, isOpen, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isOpen !== undefined) filter.isOpen = isOpen === 'true';
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get rounds with pagination
    const rounds = await Round.find(filter)
      .populate('criteria', 'name description maxScore weight markingGuide')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Round.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        rounds,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get rounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rounds'
    });
  }
});


// GET /api/rounds/:id - Get single round
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const round = await Round.findById(id)
      .populate('criteria', 'name description maxScore weight markingGuide')
      .populate('createdBy', 'username email');
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }
    
    res.json({
      success: true,
      data: { round }
    });
    
  } catch (error) {
    console.error('Get round error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching round'
    });
  }
});


// PUT /api/rounds/:id - Update round (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // If criteria are being updated, validate them
    if (updateData.criteria) {
      const criteriaDocs = await Criteria.find({ 
        _id: { $in: updateData.criteria }, 
        isActive: true 
      });
      
      if (criteriaDocs.length !== updateData.criteria.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more criteria are invalid or inactive'
        });
      }
    }
    
    const round = await Round.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('criteria', 'name description maxScore weight markingGuide')
    .populate('createdBy', 'username email');
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Round updated successfully',
      data: { round }
    });
    
  } catch (error) {
    console.error('Update round error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating round'
    });
  }
});


// PUT /api/rounds/:id/close - Close round (admin only)
router.put('/:id/close', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const round = await Round.findById(id);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }
    
    if (!round.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'Round is already closed'
      });
    }
    
    await round.closeRound();
    
    const updatedRound = await Round.findById(id)
      .populate('criteria', 'name description maxScore weight markingGuide');
    
    res.json({
      success: true,
      message: 'Round closed successfully',
      data: { round: updatedRound }
    });
    
  } catch (error) {
    console.error('Close round error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while closing round'
    });
  }
});


// PUT /api/rounds/:id/reopen - Reopen round (admin only)
router.put('/:id/reopen', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const round = await Round.findById(id);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }
    
    if (round.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'Round is already open'
      });
    }
    
    await round.reopenRound();
    
    const updatedRound = await Round.findById(id)
      .populate('criteria', 'name description maxScore weight markingGuide');
    
    res.json({
      success: true,
      message: 'Round reopened successfully',
      data: { round: updatedRound }
    });
    
  } catch (error) {
    console.error('Reopen round error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reopening round'
    });
  }
});


// DELETE /api/rounds/:id - Delete round (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const round = await Round.findByIdAndDelete(id);
    
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found'
      });
    }
    
    // Decrement usage count for criteria
    const criteriaDocs = await Criteria.find({ _id: { $in: round.criteria } });
    await Promise.all(
      criteriaDocs.map(criteriaDoc => criteriaDoc.decrementUsage())
    );
    
    res.json({
      success: true,
      message: 'Round deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete round error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting round'
    });
  }
});


// GET /api/rounds/active - Get active rounds
router.get('/active', authenticate, async (req, res) => {
  try {
    const activeRounds = await Round.getActiveRounds();
    
    res.json({
      success: true,
      data: { rounds: activeRounds }
    });
    
  } catch (error) {
    console.error('Get active rounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active rounds'
    });
  }
});


// GET /api/rounds/stats - Get round statistics (admin only)
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await Round.getRoundStats();
    
    res.json({
      success: true,
      data: { stats }
    });
    
  } catch (error) {
    console.error('Get round stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching round statistics'
    });
  }
});

module.exports = router;