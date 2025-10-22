const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const { authenticate, requireAdmin, requireJudge } = require('../middleware/auth');
const { validateTeamCreation } = require('../middleware/validation');

const router = express.Router();


// POST /api/teams - Create a new team (admin only):
router.post('/', authenticate, requireAdmin, validateTeamCreation, async (req, res) => {
    try {
      const { teamName, teamNumber, members, projectTitle, projectDescription } = req.body;
      
      // Check if team name or number already exists
      const existingTeam = await Team.findOne({
        $or: [{ teamName }, { teamNumber }]
      });
      
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team with this name or number already exists'
        });
      }
      
      // Validate that there's only one team leader
      const leaders = members.filter(member => member.role === 'leader');
      if (leaders.length !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Team must have exactly one leader'
        });
      }
      
      // Create team
      const team = await Team.create({
        teamName,
        teamNumber,
        members,
        projectTitle,
        projectDescription,
        createdBy: req.user._id
      });
      
      res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: { team }
      });
      
    } catch (error) {
      console.error('Create team error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while creating team'
      });
    }
  });


// Get /api/teams - get all teams:
router.get('/', authenticate, async (req, res) => {
    try {
      const { isParticipating, page = 1, limit = 10, sortBy = 'teamNumber' } = req.query;
      
      // Build filter object
      const filter = {};
      if (isParticipating !== undefined) {
        filter.isParticipating = isParticipating === 'true';
      }
      
      // If user is judge, only show assigned teams
      if (req.user.role === 'judge') {
        filter.assignedJudges = req.user._id;
      }
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get teams with pagination
      const teams = await Team.find(filter)
        .populate('assignedJudges', 'username email judgeInfo')
        .populate('createdBy', 'username email')
        .sort({ [sortBy]: 1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Get total count for pagination
      const total = await Team.countDocuments(filter);
      
      res.json({
        success: true,
        data: {
          teams,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            limit: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching teams'
      });
    }
  });


  // GET /api/teams/:id - Get a team by ID:
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      
      const team = await Team.findById(id)
        .populate('assignedJudges', 'username email judgeInfo')
        .populate('createdBy', 'username email');
      
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      
      // If user is judge, check if they're assigned to this team
      if (req.user.role === 'judge' && !team.assignedJudges.some(judge => judge._id.equals(req.user._id))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not assigned to this team.'
        });
      }
      
      res.json({
        success: true,
        data: { team }
      });
      
    } catch (error) {
      console.error('Get team error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching team'
      });
    }
  });


  // PUT /api/teams/:id - Update a team (admin only):
  router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Remove fields that shouldn't be updated directly
      delete updateData.assignedJudges;
      delete updateData.totalScore;
      delete updateData.averageScore;
      
      const team = await Team.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('assignedJudges', 'username email judgeInfo')
      .populate('createdBy', 'username email');
      
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Team updated successfully',
        data: { team }
      });
      
    } catch (error) {
      console.error('Update team error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating team'
      });
    }
  });


  // DELETE /api/teams/:id - Delete a team (admin only):
  router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const team = await Team.findByIdAndDelete(id);
      
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Team deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete team error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting team'
      });
    }
  });


  // PUT /api/teams/:id/assign-judges - Assign judges to a team (admin only):
  router.put('/:id/assign-judge', authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { judgeId } = req.body;
      
      // Validate judge exists and is a judge
      const judge = await User.findOne({ _id: judgeId, role: 'judge', isActive: true });
      if (!judge) {
        return res.status(400).json({
          success: false,
          message: 'Invalid judge ID or judge is not active'
        });
      }
      
      const team = await Team.findById(id);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      
      // Check if judge is already assigned
      if (team.assignedJudges.includes(judgeId)) {
        return res.status(400).json({
          success: false,
          message: 'Judge is already assigned to this team'
        });
      }
      
      // Check maximum judges per team
      if (team.assignedJudges.length >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Team cannot have more than 3 judges'
        });
      }
      
      // Assign judge
      await team.assignJudge(judgeId);
      
      // Populate and return updated team
      const updatedTeam = await Team.findById(id)
        .populate('assignedJudges', 'username email judgeInfo');
      
      res.json({
        success: true,
        message: 'Judge assigned successfully',
        data: { team: updatedTeam }
      });
      
    } catch (error) {
      console.error('Assign judge error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while assigning judge'
      });
    }
  });


  //PUT /api/teams/:id/unassign-judge - Unassign a judge from a team (admin only):
  router.put('/:id/unassign-judge', authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { judgeId } = req.body;
      
      const team = await Team.findById(id);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      
      // Unassign judge
      await team.unassignJudge(judgeId);
      
      // Populate and return updated team
      const updatedTeam = await Team.findById(id)
        .populate('assignedJudges', 'username email judgeInfo');
      
      res.json({
        success: true,
        message: 'Judge unassigned successfully',
        data: { team: updatedTeam }
      });
      
    } catch (error) {
      console.error('Unassign judge error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while unassigning judge'
      });
    }
  });


  // put /API/TEAMS/:ID/PARTICIPATE - Toggle team participation (admin only):
  router.put('/:id/participation', authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isParticipating } = req.body;
      
      const team = await Team.findByIdAndUpdate(
        id,
        { isParticipating },
        { new: true, runValidators: true }
      )
      .populate('assignedJudges', 'username email judgeInfo');
      
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      
      res.json({
        success: true,
        message: `Team ${isParticipating ? 'enabled' : 'disabled'} for participation`,
        data: { team }
      });
      
    } catch (error) {
      console.error('Toggle participation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating participation status'
      });
    }
  });


  // GET /api/teams/stats - Get team stats (admin only):
  router.get('/stats', authenticate, requireAdmin, async (req, res) => {
    try {
      const stats = await Team.getTeamStats();
      
      res.json({
        success: true,
        data: { stats }
      });
      
    } catch (error) {
      console.error('Get team stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching team statistics'
      });
    }
  });
  
  module.exports = router;
