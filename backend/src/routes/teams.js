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
      
      console.log('Received team data:', { teamName, teamNumber, members, projectTitle, projectDescription });
      console.log('Members array:', members);
      console.log('Members count:', members ? members.length : 0);
      
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
      
      // No leader validation needed - all members are treated equally
      
      // Create team
      const team = await Team.create({
        teamName,
        teamNumber,
        members,
        projectTitle,
        projectDescription,
        createdBy: req.user._id
      });
      
      console.log('Created team:', team);
      console.log('Team members in database:', team.members);
      
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


// PUT /api/teams/:id - Update a team (admin only):
router.put('/:id', authenticate, requireAdmin, validateTeamCreation, async (req, res) => {
    try {
      const { teamName, teamNumber, members, projectTitle, projectDescription } = req.body;
      const teamId = req.params.id;
      
      console.log('Updating team:', teamId);
      console.log('Received team data:', { teamName, teamNumber, members, projectTitle, projectDescription });
      console.log('Members array:', members);
      console.log('Members count:', members ? members.length : 0);
      
      // Check if team name or number already exists (excluding current team)
      const existingTeam = await Team.findOne({
        _id: { $ne: teamId },
        $or: [{ teamName }, { teamNumber }]
      });
      
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team with this name or number already exists'
        });
      }
      
      // No leader validation needed - all members are treated equally
      
      // Update team
      const team = await Team.findByIdAndUpdate(
        teamId,
        {
          teamName,
          teamNumber,
          members,
          projectTitle,
          projectDescription
        },
        { new: true, runValidators: true }
      );
      
      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      
      console.log('Updated team:', team);
      console.log('Team members in database:', team.members);
      
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


  // GET /api/teams/assigned - Get teams assigned to current judge
  router.get('/assigned', authenticate, async (req, res) => {
    try {
      console.log('=== GET ASSIGNED TEAMS ===');
      console.log('User role:', req.user.role);
      console.log('User ID:', req.user._id);
      
      // Only judges can access this endpoint
      if (req.user.role !== 'judge') {
        console.log('Access denied - not a judge');
        return res.status(403).json({
          success: false,
          message: 'Access denied. Judges only.'
        });
      }

      console.log('Fetching teams for judge:', req.user._id);
      
      try {
        // First, let's test a simple query to see if the database is working
        console.log('Testing database connection...');
        const allTeams = await Team.find({}).limit(1);
        console.log('Database connection test successful, found teams:', allTeams.length);
        
        // Now try the specific query
        console.log('Running getTeamsForJudge query...');
        const teams = await Team.getTeamsForJudge(req.user._id);
        console.log('Found teams:', teams.length);
        console.log('Teams:', teams.map(t => ({ id: t._id, name: t.teamName, assignedJudges: t.assignedJudges })));
        
        res.json({
          success: true,
          data: { teams }
        });
      } catch (queryError) {
        console.error('Error in getTeamsForJudge query:', queryError);
        console.error('Query error details:', {
          name: queryError.name,
          message: queryError.message,
          stack: queryError.stack
        });
        throw queryError;
      }
      
    } catch (error) {
      console.error('=== GET ASSIGNED TEAMS ERROR ===');
      console.error('Get assigned teams error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching assigned teams',
        error: error.message,
        details: error.name
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


  // Test route for debugging
  router.put('/:id/assign-judge-test', authenticate, requireAdmin, async (req, res) => {
    try {
      console.log('Test route hit');
      res.json({ success: true, message: 'Test route working' });
    } catch (error) {
      console.error('Test route error:', error);
      res.status(500).json({ success: false, message: 'Test route error' });
    }
  });

  // PUT /api/teams/:id/assign-judge - Assign judges to a team (admin only):
  router.put('/:id/assign-judge', authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { judgeId } = req.body;
      
      console.log('=== ASSIGN JUDGE START ===');
      console.log('Request params:', req.params);
      console.log('Request body:', req.body);
      console.log('Assigning judge:', { teamId: id, judgeId });
      
      // Validate inputs
      if (!judgeId) {
        console.log('No judgeId provided');
        return res.status(400).json({
          success: false,
          message: 'Judge ID is required'
        });
      }
      
      if (!id) {
        console.log('No team ID provided');
        return res.status(400).json({
          success: false,
          message: 'Team ID is required'
        });
      }
      
      // Validate judge exists and is a judge
      console.log('Looking for judge:', judgeId);
      const judge = await User.findOne({ _id: judgeId, role: 'judge', isActive: true });
      if (!judge) {
        console.log('Judge not found or not active:', judgeId);
        return res.status(400).json({
          success: false,
          message: 'Invalid judge ID or judge is not active'
        });
      }
      console.log('Judge found:', judge.username);
      
      console.log('Looking for team:', id);
      const team = await Team.findById(id);
      if (!team) {
        console.log('Team not found:', id);
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      console.log('Team found:', team.teamName);
      
      // Check if judge is already assigned using ObjectId comparison
      const isAlreadyAssigned = team.assignedJudges.some(assignedId => assignedId.toString() === judgeId.toString());
      if (isAlreadyAssigned) {
        console.log('Judge already assigned to team');
        return res.status(400).json({
          success: false,
          message: 'Judge is already assigned to this team'
        });
      }
      
      // Check maximum judges per team
      if (team.assignedJudges.length >= 3) {
        console.log('Team already has maximum judges');
        return res.status(400).json({
          success: false,
          message: 'Team cannot have more than 3 judges'
        });
      }
      
      // Assign judge
      console.log('Calling assignJudge method with judgeId:', judgeId);
      try {
        await team.assignJudge(judgeId);
        console.log('assignJudge method completed successfully');
      } catch (assignError) {
        console.error('Error in assignJudge method:', assignError);
        throw assignError;
      }
      
      // Populate and return updated team
      console.log('Fetching updated team...');
      const updatedTeam = await Team.findById(id)
        .populate('assignedJudges', 'username email judgeInfo');
      
      console.log('Judge assigned successfully');
      console.log('=== ASSIGN JUDGE END ===');
      res.json({
        success: true,
        message: 'Judge assigned successfully',
        data: { team: updatedTeam }
      });
      
    } catch (error) {
      console.error('=== ASSIGN JUDGE ERROR ===');
      console.error('Assign judge error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while assigning judge',
        error: error.message,
        stack: error.stack
      });
    }
  });


  //PUT /api/teams/:id/unassign-judge - Unassign a judge from a team (admin only):
  router.put('/:id/unassign-judge', authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { judgeId } = req.body;
      
      console.log('Unassigning judge:', { teamId: id, judgeId });
      
      const team = await Team.findById(id);
      if (!team) {
        console.log('Team not found:', id);
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
      
      // Unassign judge
      console.log('Calling unassignJudge method');
      await team.unassignJudge(judgeId);
      
      // Populate and return updated team
      const updatedTeam = await Team.findById(id)
        .populate('assignedJudges', 'username email judgeInfo');
      
      console.log('Judge unassigned successfully');
      res.json({
        success: true,
        message: 'Judge unassigned successfully',
        data: { team: updatedTeam }
      });
      
    } catch (error) {
      console.error('Unassign judge error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while unassigning judge',
        error: error.message
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

  // POST /api/teams/clear-assignments - Clear all judge assignments (admin only)
  router.post('/clear-assignments', authenticate, requireAdmin, async (req, res) => {
    try {
      // Clear all assignments
      await Team.updateMany({}, { $set: { assignedJudges: [] } });

      res.json({
        success: true,
        message: 'All judge assignments cleared successfully'
      });
      
    } catch (error) {
      console.error('Clear assignments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while clearing assignments'
      });
    }
  });

  // POST /api/teams/auto-assign - Auto assign judges to teams (admin only)
  router.post('/auto-assign', authenticate, requireAdmin, async (req, res) => {
    try {
      // Get all teams and judges
      const teams = await Team.find({ isParticipating: true });
      const judges = await User.find({ role: 'judge', isActive: true });
      
      if (teams.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No participating teams found'
        });
      }
      
      if (judges.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No active judges found'
        });
      }

      // Clear existing assignments
      await Team.updateMany({}, { $set: { assignedJudges: [] } });

      // Calculate assignments per team (max 3 judges per team)
      const judgesPerTeam = Math.min(3, Math.ceil(judges.length / teams.length));
      
      // Distribute judges evenly across teams with overlap allowed
      let judgeIndex = 0;
      for (const team of teams) {
        const teamJudges = [];
        for (let i = 0; i < judgesPerTeam && judgeIndex < judges.length; i++) {
          teamJudges.push(judges[judgeIndex]._id);
          judgeIndex++;
          // If we've used all judges, start over from the beginning
          if (judgeIndex >= judges.length) {
            judgeIndex = 0;
          }
        }
        
        if (teamJudges.length > 0) {
          await Team.findByIdAndUpdate(team._id, { 
            assignedJudges: teamJudges 
          });
        }
      }

      // Get updated teams with populated judges
      const updatedTeams = await Team.find({ isParticipating: true })
        .populate('assignedJudges', 'username email judgeInfo');

      res.json({
        success: true,
        message: 'Judges assigned automatically',
        data: { 
          teams: updatedTeams,
          assignments: {
            totalTeams: teams.length,
            totalJudges: judges.length,
            judgesPerTeam: judgesPerTeam
          }
        }
      });
      
    } catch (error) {
      console.error('Auto assign error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while auto-assigning judges'
      });
    }
  });
  
  module.exports = router;
