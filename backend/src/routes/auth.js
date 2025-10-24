const express = require('express');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/register - register new user by admin only:
router.post('/register', authenticate, requireAdmin, validateUserRegistration, async (req, res) => {
    try {
        const { username, email, password, role, judgeInfo } = req.body;

        //check if user already exists:
        const existingUser = await User.findOne({
            $or: [
                ...(email ? [{ email }] : []),
                { username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create new User:
        const userData = {
            username,
            password,
            role,
            createdBy: req.user._id
        };

        // Add email only if provided:
        if (email) {
            userData.email = email;
        }

        // Add judge-specific information if role is judge:
        if (role === 'judge' && judgeInfo) {
            userData.judgeInfo = judgeInfo;
        }

        const user = await User.create(userData);

        // Generate JWT token:
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    judgeInfo: user.judgeInfo,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                },
                token
            }
        });
} catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});


// POST /api/auth/login:
router.post('/login', validateUserLogin, async (req, res) => {
    try {
      const { email, username, password } = req.body;
      
      // Find user by email or username and include password for verification
      let user;
      if (email) {
        user = await User.findByEmailForAuth(email);
      } else if (username) {
        user = await User.findByUsernameForAuth(username);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Email or username is required'
        });
      }
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }
      
      // Verify password
      const isMatch = await user.matchPassword(password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Update last login
      await user.updateLastLogin();
      
      // Generate JWT token
      const token = user.getSignedJwtToken();
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            judgeInfo: user.judgeInfo,
            lastLogin: user.lastLogin
          },
          token
        }
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  });


  // GET /api/auth/me:
  router.get('/me', authenticate, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      
      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            judgeInfo: user.judgeInfo,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          }
        }
      });
      
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching profile'
      });
    }
  });


  // PUT /api/auth/profile - Update user profile:
  router.put('/profile', authenticate, async (req, res) => {
    try {
      const { username, judgeInfo } = req.body;
      const userId = req.user._id;
      
      // Prepare update data
      const updateData = {};
      
      if (username) {
        updateData.username = username;
      }
      
      if (req.user.role === 'judge' && judgeInfo) {
        updateData.judgeInfo = judgeInfo;
      }
      
      // Update user
      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
      
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating profile'
      });
    }
  });


  // GET /api/auth/users - get all users (admin only):
  router.get('/users', authenticate, requireAdmin, async (req, res) => {
    try {
      const { role, isActive, page = 1, limit = 10 } = req.query;
      
      // Build filter object
      const filter = {};
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get users with pagination
      const users = await User.find(filter)
        .select('-password')
        .populate('createdBy', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Get total count for pagination
      const total = await User.countDocuments(filter);
      
      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            limit: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching users'
      });
    }
  });


  // PUT /api/auth/users/:id - Update user (admin only):
  router.put('/users/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, role, judgeInfo } = req.body;
      
      // Check if user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if username or email already exists (excluding current user)
      if (username || email) {
        const conflictUser = await User.findOne({
          _id: { $ne: id },
          $or: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : [])
          ]
        });
        
        if (conflictUser) {
          return res.status(400).json({
            success: false,
            message: 'Username or email already exists'
          });
        }
      }
      
      // Prepare update data
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (judgeInfo) updateData.judgeInfo = judgeInfo;
      
      // Update user
      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user }
      });
      
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating user'
      });
    }
  });

  // PUT /api/auth/users/:id/status - Toggle active status (admin only):
  router.put('/users/:id/status', authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      // Prevent admin from deactivating themselves
      if (id === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
      }
      
      const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user }
      });
      
    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating user status'
      });
    }
  });


  // DELETE /api/auth/users/:id - Delete user (admin only):
  router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent deleting admin users
      if (user.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete admin users'
        });
      }

      // Delete user
      await User.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting user'
      });
    }
  });

  // GET /api/auth/stats - Get user stats (admin only):
  router.get('/stats', authenticate, requireAdmin, async (req, res) => {
    try {
      const stats = await User.getUserStats();
      
      res.json({
        success: true,
        data: { stats }
      });
      
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching statistics'
      });
    }
  });
  
  module.exports = router;