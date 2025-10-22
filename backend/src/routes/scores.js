const express = require('express');
const Score = require('../models/Score');
const Team = require('../models/Team');
const Rounf = require('../models/Round');
const Criteria = require('../models/Criteria');
const { authenticate, requireAdmin, requireJudge } = require('../middleware/auth');
const { validateScoreSubmission } = require('../middleware/validation');

const router = express.Router();

// POST /api/scores - Submit a score (judge only):
router.post('/', authenticate, requireJudge, validateScoreSubmission, async (req, res) => {
    try {
      const { teamId, roundId, criteriaId, score, comments } = req.body;
      
      // Validate team is assigned to this judge
      const team = await Team.findOne({ 
        _id: teamId, 
        assignedJudges: req.user._id 
      });
      
      if (!team) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this team'
        });
      }
      
      // Validate round is open
      const round = await Round.findById(roundId);
      if (!round || !round.isOpen) {
        return res.status(400).json({
          success: false,
          message: 'Round is not open for scoring'
        });
      }
      
      // Validate criteria is part of this round
      if (!round.criteria.includes(criteriaId)) {
        return res.status(400).json({
          success: false,
          message: 'Criteria is not part of this round'
        });
      }
      
      // Get criteria details for validation
      const criteria = await Criteria.findById(criteriaId);
      if (!criteria || !criteria.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive criteria'
        });
      }
      
      // Validate score is within criteria limits
      if (score > criteria.maxScore) {
        return res.status(400).json({
          success: false,
          message: `Score cannot exceed ${criteria.maxScore} for this criteria`
        });
      }
      
      // Check if score already exists
      let existingScore = await Score.findOne({
        judge: req.user._id,
        team: teamId,
        round: roundId,
        criteria: criteriaId
      });
      
      if (existingScore) {
        // Update existing score
        await existingScore.modifyScore(score, comments);
        existingScore = await Score.findById(existingScore._id)
          .populate('team', 'teamName teamNumber members')
          .populate('criteria', 'name maxScore weight markingGuide');
        
        return res.json({
          success: true,
          message: 'Score updated successfully',
          data: { score: existingScore }
        });
      } else {
        // Create new score
        const newScore = await Score.create({
          judge: req.user._id,
          team: teamId,
          round: roundId,
          criteria: criteriaId,
          score,
          comments
        });
        
        const populatedScore = await Score.findById(newScore._id)
          .populate('team', 'teamName teamNumber members')
          .populate('criteria', 'name maxScore weight markingGuide');
        
        res.status(201).json({
          success: true,
          message: 'Score submitted successfully',
          data: { score: populatedScore }
        });
      }
      
    } catch (error) {
      console.error('Submit score error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while submitting score'
      });
    }
  });


  // PUT /api/scores/:id - Update existing scores (judges only):
  router.put(':/id', authenticate, requireJudge, validateScoreSubmission, async (req, res) => {
    try {
        const { id } = req.params;
        const { score, comments } = req.body;

        const existingScore = await Score.findById(id);

        if (!existingScore) {
            return res.status(404).json({
                success: false,
                message: 'Score not found'
            });
        }

        // Verify judge owns this score
        if (!existingScore.judge.equals(req.user._id)) {
            return res.status(403).json({
              success: false,
              message: 'You can only modify your own scores'
            });
          }

        // Check if round is still open:
        const round = await Round.findById(existingScore.round);
        if (!round || !round.isOpen) {
            return res.status(404).json({
                success: false,
                message: 'Round is not open for scoring'
            });
        }

        // get criteria for validation:
        const criteria = await Criteria.findById(existingScore.criteria);
        if (score > criteria.maxScore) {
            return res.status(400).json({
                success: false,
                message: `Score cannot exceed ${criteria.maxScore} for this criteria`
            })
        }

        // Update score
        await existingScore.modifyScore(score, comments);
    
    const updatedScore = await Score.findById(id)
      .populate('team', 'teamName teamNumber members')
      .populate('criteria', 'name maxScore weight markingGuide');
    
    res.json({
      success: true,
      message: 'Score updated successfully',
      data: { score: updatedScore }
    });
    
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating score'
    });
  }
});


// PUT /api/scores/:id/submit:
router.put(':/id/submit', authenticate, requireJudge, async (req, res) => {
    try {
        const { id } = req.params;

        const score = await Score.findById(id);

        if (!score) {
            return res.status(404).json({
                success: false,
                message: 'Score not found'
            });
        }

        // Verify that the judge owns the score:
        if (!score.judge.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only submit your own scores'
            });
        }

        // Check if round is still open
        const round = await Round.findById(score.round);

        if (!round || !round.isOpen) {
            return res.status(400).json({
                success: false,
                message: 'Round is not open for scoring'
            });
        }


        // Submit scores:
        await score.submitScore();

        const submittedScore = await Score.findById(id)
        .populate('team', 'teamName teamNumber members')
        .populate( 'criteria', 'name maxScore weight markingGuide');

        res.json({
            success: true,
            message: 'Score submitted successfully',
            data: { score: submittedScore }
        });
    }catch (error) {
        console.error('Submit score error:', error);
        res.status(500).json({
          success: false,
          message: 'Server error while submitting score'
        });
      }
    });


// GET /api/scores/my-scores:
router.get('/my-scores', authenticate, requireJudge, async (req, res) => {
    try {
      const { roundId, page = 1, limit = 10 } = req.query;
      
      if (!roundId) {
        return res.status(400).json({
          success: false,
          message: 'Round ID is required'
        });
      }
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get judge's scores for the round
      const scores = await Score.find({ 
        judge: req.user._id, 
        round: roundId 
      })
      .populate('team', 'teamName teamNumber members')
      .populate('criteria', 'name maxScore weight markingGuide')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
      // Get total count for pagination
      const total = await Score.countDocuments({ 
        judge: req.user._id, 
        round: roundId 
      });
      
      res.json({
        success: true,
        data: {
          scores,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            limit: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      console.error('Get my scores error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching scores'
      });
    }
  });


  //GET /api/scores/team/:teamId:
  router.get('/team/:teamId', authenticate, async (req, res) => {
    try {
      const { teamId } = req.params;
      const { roundId } = req.query;
      
      if (!roundId) {
        return res.status(400).json({
          success: false,
          message: 'Round ID is required'
        });
      }
      
      // If user is judge, verify they're assigned to this team
      if (req.user.role === 'judge') {
        const team = await Team.findOne({ 
          _id: teamId, 
          assignedJudges: req.user._id 
        });
        
        if (!team) {
          return res.status(403).json({
            success: false,
            message: 'You are not assigned to this team'
          });
        }
      }
      
      const scores = await Score.getTeamScores(teamId, roundId);
      
      res.json({
        success: true,
        data: { scores }
      });
      
    } catch (error) {
      console.error('Get team scores error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching team scores'
      });
    }
  });


  // GET /api/scores/summary/:teamId:
  router.get('/summary/:teamId', authenticate, async (req, res) => {
    try {
      const { teamId } = req.params;
      const { roundId } = req.query;
      
      if (!roundId) {
        return res.status(400).json({
          success: false,
          message: 'Round ID is required'
        });
      }
      
      // If user is judge, verify they're assigned to this team
      if (req.user.role === 'judge') {
        const team = await Team.findOne({ 
          _id: teamId, 
          assignedJudges: req.user._id 
        });
        
        if (!team) {
          return res.status(403).json({
            success: false,
            message: 'You are not assigned to this team'
          });
        }
      }
      
      const summary = await Score.getTeamScoreSummary(teamId, roundId);
      
      res.json({
        success: true,
        data: { summary }
      });
      
    } catch (error) {
      console.error('Get score summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching score summary'
      });
    }
  });


  // GET /api/scores/:roundId:
  router.get('/round/:roundId', authenticate, requireAdmin, async (req, res) => {
    try {
      const { roundId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get all scores for the round
      const scores = await Score.find({ round: roundId })
        .populate('judge', 'username email judgeInfo')
        .populate('team', 'teamName teamNumber members')
        .populate('criteria', 'name maxScore weight markingGuide')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Get total count for pagination
      const total = await Score.countDocuments({ round: roundId });
      
      res.json({
        success: true,
        data: {
          scores,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            limit: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      console.error('Get round scores error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching round scores'
      });
    }
  });

  // GET /api/scores/stats:
  router.get('/stats', authenticate, requireAdmin, async (req, res) => {
    try {
      const stats = await Score.getScoreStats();
      
      res.json({
        success: true,
        data: { stats }
      });
      
    } catch (error) {
      console.error('Get score stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching score statistics'
      });
    }
  });
  
  module.exports = router;