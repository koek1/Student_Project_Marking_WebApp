import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
      return Promise.reject(error);
    }

    // Handle validation errors
    if (error.response.status === 400) {
      const message = error.response.data.message || 'Validation error';
      toast.error(message);
      return Promise.reject(error);
    }

    // Handle server errors
    if (error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // Handle other errors
    const message = error.response.data.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user (admin only)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Get all users (admin only)
  getUsers: async (params = {}) => {
    const response = await api.get('/auth/users', { params });
    return response.data;
  },

  // Toggle user status (admin only)
  toggleUserStatus: async (userId, isActive) => {
    const response = await api.put(`/auth/users/${userId}/status`, { isActive });
    return response.data;
  },

  // Get user statistics (admin only)
  getUserStats: async () => {
    const response = await api.get('/auth/stats');
    return response.data;
  }
};

export const teamsAPI = {
  // Get all teams
  getTeams: async (params = {}) => {
    const response = await api.get('/teams', { params });
    return response.data;
  },

  // Get single team
  getTeam: async (teamId) => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  // Create team (admin only)
  createTeam: async (teamData) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  // Update team (admin only)
  updateTeam: async (teamId, teamData) => {
    const response = await api.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  // Delete team (admin only)
  deleteTeam: async (teamId) => {
    const response = await api.delete(`/teams/${teamId}`);
    return response.data;
  },

  // Assign judge to team (admin only)
  assignJudge: async (teamId, judgeId) => {
    const response = await api.put(`/teams/${teamId}/assign-judge`, { judgeId });
    return response.data;
  },

  // Unassign judge from team (admin only)
  unassignJudge: async (teamId, judgeId) => {
    const response = await api.put(`/teams/${teamId}/unassign-judge`, { judgeId });
    return response.data;
  },

  // Toggle team participation (admin only)
  toggleParticipation: async (teamId, isParticipating) => {
    const response = await api.put(`/teams/${teamId}/participation`, { isParticipating });
    return response.data;
  },

  // Get team statistics (admin only)
  getTeamStats: async () => {
    const response = await api.get('/teams/stats');
    return response.data;
  }
};

export const criteriaAPI = {
  // Get all criteria
  getCriteria: async (params = {}) => {
    const response = await api.get('/criteria', { params });
    return response.data;
  },

  // Get single criteria
  getCriteriaById: async (criteriaId) => {
    const response = await api.get(`/criteria/${criteriaId}`);
    return response.data;
  },

  // Create criteria (admin only)
  createCriteria: async (criteriaData) => {
    const response = await api.post('/criteria', criteriaData);
    return response.data;
  },

  // Update criteria (admin only)
  updateCriteria: async (criteriaId, criteriaData) => {
    const response = await api.put(`/criteria/${criteriaId}`, criteriaData);
    return response.data;
  },

  // Delete criteria (admin only)
  deleteCriteria: async (criteriaId) => {
    const response = await api.delete(`/criteria/${criteriaId}`);
    return response.data;
  },

  // Toggle criteria status (admin only)
  toggleCriteriaStatus: async (criteriaId, isActive) => {
    const response = await api.put(`/criteria/${criteriaId}/status`, { isActive });
    return response.data;
  },

  // Get most used criteria
  getMostUsed: async (limit = 10) => {
    const response = await api.get('/criteria/stats/most-used', { params: { limit } });
    return response.data;
  },

  // Get criteria statistics (admin only)
  getCriteriaStats: async () => {
    const response = await api.get('/criteria/stats');
    return response.data;
  }
};

export const roundsAPI = {
  // Get all rounds
  getRounds: async (params = {}) => {
    const response = await api.get('/rounds', { params });
    return response.data;
  },

  // Get single round
  getRound: async (roundId) => {
    const response = await api.get(`/rounds/${roundId}`);
    return response.data;
  },

  // Create round (admin only)
  createRound: async (roundData) => {
    const response = await api.post('/rounds', roundData);
    return response.data;
  },

  // Update round (admin only)
  updateRound: async (roundId, roundData) => {
    const response = await api.put(`/rounds/${roundId}`, roundData);
    return response.data;
  },

  // Delete round (admin only)
  deleteRound: async (roundId) => {
    const response = await api.delete(`/rounds/${roundId}`);
    return response.data;
  },

  // Close round (admin only)
  closeRound: async (roundId) => {
    const response = await api.put(`/rounds/${roundId}/close`);
    return response.data;
  },

  // Reopen round (admin only)
  reopenRound: async (roundId) => {
    const response = await api.put(`/rounds/${roundId}/reopen`);
    return response.data;
  },

  // Get active rounds
  getActiveRounds: async () => {
    const response = await api.get('/rounds/active');
    return response.data;
  },

  // Get round statistics (admin only)
  getRoundStats: async () => {
    const response = await api.get('/rounds/stats');
    return response.data;
  }
};

export const scoresAPI = {
  // Submit score (judge only)
  submitScore: async (scoreData) => {
    const response = await api.post('/scores', scoreData);
    return response.data;
  },

  // Update score (judge only)
  updateScore: async (scoreId, scoreData) => {
    const response = await api.put(`/scores/${scoreId}`, scoreData);
    return response.data;
  },

  // Submit score as final (judge only)
  submitScoreFinal: async (scoreId) => {
    const response = await api.put(`/scores/${scoreId}/submit`);
    return response.data;
  },

  // Get judge's scores
  getMyScores: async (params = {}) => {
    const response = await api.get('/scores/my-scores', { params });
    return response.data;
  },

  // Get team scores
  getTeamScores: async (teamId, roundId) => {
    const response = await api.get(`/scores/team/${teamId}`, { params: { roundId } });
    return response.data;
  },

  // Get team score summary
  getTeamScoreSummary: async (teamId, roundId) => {
    const response = await api.get(`/scores/summary/${teamId}`, { params: { roundId } });
    return response.data;
  },

  // Get round scores (admin only)
  getRoundScores: async (roundId, params = {}) => {
    const response = await api.get(`/scores/round/${roundId}`, { params });
    return response.data;
  },

  // Get score statistics (admin only)
  getScoreStats: async () => {
    const response = await api.get('/scores/stats');
    return response.data;
  }
};

export const assignmentAPI = {
  // Assign judges to teams (admin only)
  assignJudges: async (roundId) => {
    const response = await api.post('/assignment/assign', { roundId });
    return response.data;
  },

  // Get assignment statistics (admin only)
  getAssignmentStats: async (roundId) => {
    const response = await api.get('/assignment/stats', { params: { roundId } });
    return response.data;
  },

  // Optimize assignments (admin only)
  optimizeAssignments: async (roundId) => {
    const response = await api.post('/assignment/optimize', { roundId });
    return response.data;
  }
};

export default api;