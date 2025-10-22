const express = require('express');
const { assignJudgesToTeams, getAssignmentStats, optimizeAssignments } = require('../utils/assignment');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();


//POST /api/assignment/assign
router.post('/assign', authenticate, requireAdmin, async (req, res) => {
  try {
    const { roundId } = req.body;
    
    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }
    
    const result = await assignJudgesToTeams(roundId);
    
    res.json({
      success: true,
      message: 'Judges assigned successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Assign judges error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while assigning judges'
    });
  }
});


//GET /api/assignment/stats
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const { roundId } = req.query;
    
    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }
    
    const stats = await getAssignmentStats(roundId);
    
    res.json({
      success: true,
      data: { stats }
    });
    
  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assignment statistics'
    });
  }
});


//POST /api/assignment/optimize
router.post('/optimize', authenticate, requireAdmin, async (req, res) => {
  try {
    const { roundId } = req.body;
    
    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: 'Round ID is required'
      });
    }
    
    const result = await optimizeAssignments(roundId);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
    
  } catch (error) {
    console.error('Optimize assignments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while optimizing assignments'
    });
  }
});

module.exports = router;