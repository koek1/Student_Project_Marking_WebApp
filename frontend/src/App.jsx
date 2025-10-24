import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import './styles/globals.css';
import './styles/akademia-theme.css';
import backgroundImage from './images/background.jpg';

// API Service Functions
const api = {
  // Teams API
  getTeams: async () => {
    const token = localStorage.getItem('token');
    console.log('Getting teams with token:', token ? 'Token present' : 'No token');
    const response = await axios.get('http://localhost:5000/api/teams', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Teams response:', response.data);
    return response.data.data.teams;
  },
  
  createTeam: async (teamData) => {
    const token = localStorage.getItem('token');
      console.log('Creating team with data:', JSON.stringify(teamData, null, 2));
      console.log('Using token:', token ? 'Token present' : 'No token');
      console.log('Token value:', token);
    
    try {
      const response = await axios.post('http://localhost:5000/api/teams', teamData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Team creation response:', response.data);
      return response.data.data.team;
    } catch (error) {
      console.error('Team creation error:', error.response?.data || error.message);
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Validation errors array:', error.response?.data?.errors);
      console.error('First validation error:', error.response?.data?.errors?.[0]);
      throw error;
    }
  },
  
  deleteTeam: async (teamId) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/teams/${teamId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  updateTeam: async (teamId, teamData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`http://localhost:5000/api/teams/${teamId}`, teamData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.team;
  },
  
  // Users/Judges API
  getUsers: async (role = null) => {
    const token = localStorage.getItem('token');
    console.log('Getting users with token:', token ? 'Token present' : 'No token');
    const params = role ? { role } : {};
    const response = await axios.get('http://localhost:5000/api/auth/users', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    console.log('Users response:', response.data);
    return response.data.data.users;
  },
  
  createUser: async (userData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.user;
  },
  
  updateUser: async (userId, userData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`http://localhost:5000/api/auth/users/${userId}`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.user;
  },
  
  deleteUser: async (userId) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  // Rounds API
  getRounds: async () => {
    const token = localStorage.getItem('token');
    console.log('Getting rounds with token:', token ? 'Token present' : 'No token');
    const response = await axios.get('http://localhost:5000/api/rounds', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Rounds response:', response.data);
    return response.data.data.rounds;
  },
  
  createRound: async (roundData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/rounds', roundData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.round;
  },
  
    deleteRound: async (roundId) => {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/rounds/${roundId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    
  // Scores API
  getScores: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/scores', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.scores;
  },
  
  submitScore: async (scoreData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/scores', scoreData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.score;
  },
  
  updateScore: async (scoreId, scoreData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`http://localhost:5000/api/scores/${scoreId}`, scoreData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.score;
  },
  
  deleteScore: async (scoreId) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/scores/${scoreId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Judge-specific API functions
  getTeamsForJudge: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/teams/assigned', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.teams;
  },
  
  getJudgeScores: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/scores/my-scores', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.scores;
  },

  // Leaderboard API
  getLeaderboard: async (roundId = null) => {
    const token = localStorage.getItem('token');
    const url = roundId 
      ? `http://localhost:5000/api/scores/leaderboard?roundId=${roundId}`
      : 'http://localhost:5000/api/scores/leaderboard';
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  // Team Assignment API functions
  assignJudgeToTeam: async (teamId, judgeId) => {
    const token = localStorage.getItem('token');
    console.log('API call - assignJudgeToTeam:', { teamId, judgeId, token: token ? 'present' : 'missing' });
    
    try {
      const response = await axios.put(`http://localhost:5000/api/teams/${teamId}/assign-judge`, 
        { judgeId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('API response:', response.data);
      return response.data.data.team;
    } catch (error) {
      console.error('API error in assignJudgeToTeam:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message);
      console.error('Full error:', error.response?.data);
      throw error;
    }
  },

  unassignJudgeFromTeam: async (teamId, judgeId) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`http://localhost:5000/api/teams/${teamId}/unassign-judge`, 
      { judgeId }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data.team;
  },

  autoAssignJudges: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/teams/auto-assign', 
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  clearAllAssignments: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/teams/clear-assignments', 
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Criteria API functions
  getCriteria: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/criteria', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.criteria;
  },

  createCriteria: async (criteriaData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/criteria', criteriaData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateCriteria: async (criteriaId, criteriaData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`http://localhost:5000/api/criteria/${criteriaId}`, criteriaData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteCriteria: async (criteriaId) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`http://localhost:5000/api/criteria/${criteriaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
    
};

// Login Component with Akademia Design
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', { username, password });
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        console.log('Stored token:', response.data.data.token);
        console.log('Stored user:', response.data.data.user);
        
        toast.success('Login successful!');
        
        // Small delay to ensure localStorage is updated
        setTimeout(() => {
          // Redirect based on role
          if (response.data.data.user.role === 'admin') {
            console.log('Redirecting to admin dashboard');
            navigate('/dashboard');
          } else {
            console.log('Redirecting to judge dashboard');
            navigate('/judge-dashboard');
          }
        }, 100);
      } else {
        toast.error('Login failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data?.message || 'Login failed');
      } else {
        toast.error('Network error. Please check if backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          filter: 'blur(2px)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header with Logo */}
                  <div className="bg-gradient-to-r from-akademia-primary to-akademia-secondary px-8 py-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-akademia-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-extrabold text-xl">A</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-2">AKADEMIA</h1>
              <p className="text-akademia-light text-base font-medium">Die Oond</p>
            </div>
            
            {/* Login Form */}
            <div className="px-8 py-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Gebruikersnaam
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300 text-base font-medium"
                    placeholder="Enter your username"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Wagwoord
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-16 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300 text-base font-medium"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none text-xs font-medium bg-white border border-gray-300 rounded px-1 py-0.5 shadow-sm"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-akademia-primary text-white py-3 px-6 rounded-xl text-lg font-bold hover:bg-akademia-secondary focus:ring-4 focus:ring-akademia-primary focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Teken in...' : 'Teken in'}
                </button>
              </form>
              
              {/* Test Account Info */}
              <div className="mt-6 p-4 bg-akademia-light border-2 border-akademia-secondary rounded-xl">
                <h3 className="text-base font-bold text-akademia-primary mb-2">Toets Admin:</h3>
                <div className="text-sm text-akademia-secondary font-medium">
                  <strong>Toets Rekening:</strong><br/>
                  Gebruikersnaam: admin<br/>
                  Wagwoord: admin123
                </div>
              </div>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="mt-6 text-center">
            <span className="text-white text-lg font-bold">Afrikaans</span>
          </div>
          
          {/* Help Button */}
          <div className="fixed bottom-4 right-4">
                  <button className="w-12 h-12 bg-akademia-secondary rounded-full flex items-center justify-center text-white hover:bg-akademia-primary transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl">
              <span className="text-lg font-bold">?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Component with Akademia Design
const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Data arrays for actual items
  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJudge, setEditingJudge] = useState(null);
  const [showEditJudgeModal, setShowEditJudgeModal] = useState(false);
  const [showCreateCriteriaModal, setShowCreateCriteriaModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    maxScore: 100,
    weight: 0,
    markingGuide: ''
  });
  
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showJudgePassword, setShowJudgePassword] = useState(false);
  const [showEditJudgePassword, setShowEditJudgePassword] = useState(false);
  
  // Dynamic counts derived from data arrays
  const teamsCount = teams.length;
  const judgesCount = judges.length;
  const roundsCount = rounds.length;
  const criteriaCount = criteria.length;
  const [loading, setLoading] = useState(false);

  // Load data from backend on component mount
  useEffect(() => {
    loadData();
  }, []);



  const loadData = async () => {
    setLoading(true);
    console.log('Loading dashboard data...');
    console.log('Token from localStorage:', localStorage.getItem('token'));
    console.log('User from localStorage:', localStorage.getItem('user'));
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.error('No authentication token or user found');
      toast.error('Please log in again');
      window.location.href = '/';
      return;
    }
    
    try {
      // Set default empty arrays first to prevent white screen
      setTeams([]);
      setJudges([]);
      setRounds([]);
      setCriteria([]);
      
      console.log('Making API calls...');
      
      // Test backend connectivity first
      try {
        const healthCheck = await axios.get('http://localhost:5000/health', { timeout: 5000 });
        console.log('Backend health check:', healthCheck.data);
      } catch (healthErr) {
        console.error('Backend health check failed:', healthErr);
        toast.error('Backend server is not responding. Please check if the server is running.');
      }
      
      const [teamsData, judgesData, roundsData, criteriaData] = await Promise.all([
        api.getTeams().catch(err => {
          console.error('Teams API error:', err);
          console.error('Teams API error status:', err.response?.status);
          console.error('Teams API error message:', err.response?.data?.message);
          toast.error(`Failed to load teams: ${err.response?.data?.message || err.message}`);
          return [];
        }),
        api.getUsers('judge').catch(err => {
          console.error('Judges API error:', err);
          console.error('Judges API error status:', err.response?.status);
          console.error('Judges API error message:', err.response?.data?.message);
          toast.error(`Failed to load judges: ${err.response?.data?.message || err.message}`);
          return [];
        }),
        api.getRounds().catch(err => {
          console.error('Rounds API error:', err);
          console.error('Rounds API error status:', err.response?.status);
          console.error('Rounds API error message:', err.response?.data?.message);
          toast.error(`Failed to load rounds: ${err.response?.data?.message || err.message}`);
          return [];
        }),
        api.getCriteria().catch(err => {
          console.error('Criteria API error:', err);
          console.error('Criteria API error status:', err.response?.status);
          console.error('Criteria API error message:', err.response?.data?.message);
          console.error('Criteria API error details:', err.response?.data);
          toast.error(`Failed to load criteria: ${err.response?.data?.message || err.message}`);
          return [];
        })
      ]);
      
      console.log('Loaded data:', { teamsData, judgesData, roundsData, criteriaData });
      console.log('Teams data details:', teamsData);
      if (teamsData && teamsData.length > 0) {
        console.log('First team members:', teamsData[0].members);
      }
      
      // Check if all data is empty (backend might be down)
      const allEmpty = (!teamsData || teamsData.length === 0) && 
                      (!judgesData || judgesData.length === 0) && 
                      (!roundsData || roundsData.length === 0) && 
                      (!criteriaData || criteriaData.length === 0);
      
      if (allEmpty) {
        console.warn('All data arrays are empty - this might indicate a backend issue');
        toast.warning('No data found. This might be because the backend is not responding or there is no data in the database.');
      }
      
      setTeams(teamsData || []);
      setJudges(judgesData || []);
      setRounds(roundsData || []);
      setCriteria(criteriaData || []);
      
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays as fallback to prevent white screen
      setTeams([]);
      setJudges([]);
      setRounds([]);
      setCriteria([]);
      toast.error('Failed to load data from server. Using offline mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleManageTeams = () => {
    setCurrentView('teams');
  };

  const handleManageJudges = () => {
    setCurrentView('judges');
  };

  const handleManageRounds = () => {
    setCurrentView('rounds');
  };

  const handleManageAssignments = () => {
    setCurrentView('assignments');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      // Parse team members from textarea (one per line)
      const teamMembersText = formData.get('teamMembers') || '';
      const teamMembers = teamMembersText
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .map((name, index) => ({
          name: name,
          studentNumber: `${Math.floor(Math.random() * 90000000) + 10000000}`,
          email: `${name.toLowerCase().replace(/\s+/g, '_')}@student.akademia.edu`,
          role: 'member'
        }));

      // Ensure unique student numbers
      const usedNumbers = new Set();
      teamMembers.forEach(member => {
        while (usedNumbers.has(member.studentNumber)) {
          member.studentNumber = `${Math.floor(Math.random() * 90000000) + 10000000}`;
        }
        usedNumbers.add(member.studentNumber);
      });

      // Ensure we have at least 3 members but not more than 4
      if (teamMembers.length < 3) {
        // Add placeholder members if needed
        const needed = 3 - teamMembers.length;
        for (let i = 0; i < needed; i++) {
          let placeholderStudentNumber = `${Math.floor(Math.random() * 90000000) + 10000000}`;
          while (usedNumbers.has(placeholderStudentNumber)) {
            placeholderStudentNumber = `${Math.floor(Math.random() * 90000000) + 10000000}`;
          }
          usedNumbers.add(placeholderStudentNumber);
          
          teamMembers.push({
            name: `Member ${i + 1}`,
            studentNumber: placeholderStudentNumber,
            email: `member_${i + 1}@student.akademia.edu`,
            role: 'member'
          });
        }
      }
      
      // Ensure we don't exceed 4 members total
      if (teamMembers.length > 4) {
        teamMembers.splice(4); // Keep only first 4 members
      }

      const teamData = {
        teamName: formData.get('teamName'),
        teamNumber: Math.floor(Math.random() * 15) + 1, // Generate random team number between 1-15
        projectTitle: formData.get('projectTitle'),
        projectDescription: formData.get('projectDescription') || '',
        members: teamMembers
      };
      
      console.log('Team data being sent:', JSON.stringify(teamData, null, 2));
      console.log('Members array:', teamMembers);
      console.log('Members count:', teamMembers.length);
      console.log('First member details:', teamMembers[0]);
      
      const newTeam = await api.createTeam(teamData);
      console.log('Created team response:', newTeam);
      
      // Refresh the teams list from server
      await loadData();
      
      e.target.reset();
      toast.success('Team added successfully!');
    } catch (error) {
      console.error('Error creating team:', error);
      console.error('Error details:', error.response?.data);
      
      // Show detailed validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
        toast.error(`Validation errors: ${validationErrors}`);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create team';
        toast.error(`Failed to create team: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddJudge = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      const userData = {
        username: formData.get('username'),
        password: formData.get('password'),
        role: 'judge',
        judgeInfo: {
          company: 'Akademia University', // Required field
          position: formData.get('specialization') || 'Judge' // Required field - specialization stored here
        }
      };
      
      console.log('Creating judge with data:', JSON.stringify(userData, null, 2));
      console.log('Username:', formData.get('username'));
      console.log('Password:', formData.get('password'));
      console.log('Specialization:', formData.get('specialization'));
      
      const newJudge = await api.createUser(userData);
      setJudges([...judges, newJudge]);
      e.target.reset();
      toast.success('Judge added successfully!');
    } catch (error) {
      console.error('Error creating judge:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show detailed validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
        toast.error(`Validation errors: ${validationErrors}`);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create judge';
        toast.error(`Failed to create judge: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddRound = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      const roundName = formData.get('roundName');
      const roundType = formData.get('roundType');
      const description = formData.get('description');
      const selectedCriteria = formData.getAll('criteria');
      
      console.log('Creating round with data:', { roundName, roundType, description, selectedCriteria });
      
      if (selectedCriteria.length === 0) {
        toast.error('Please select at least one criteria for this round');
        setLoading(false);
        return;
      }
      
      const roundData = {
        name: roundName,
        type: roundType,
        description: description || '',
        criteria: selectedCriteria
      };
      
      console.log('Round data being sent:', roundData);
      
      const newRound = await api.createRound(roundData);
      console.log('Created round response:', newRound);
      
      setRounds([...rounds, newRound]);
      e.target.reset();
      toast.success('Round created successfully!');
    } catch (error) {
      console.error('Error creating round:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.data?.message) {
        toast.error(`Failed to create round: ${error.response.data.message}`);
      } else {
        toast.error('Failed to create round');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await api.deleteTeam(teamId);
      setTeams(teams.filter(team => team._id !== teamId));
      toast.success('Team deleted successfully!');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setShowEditModal(true);
  };

  const handleEditJudge = (judge) => {
    setEditingJudge(judge);
    setShowEditJudgeModal(true);
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      
      // Parse team members from textarea (one per line)
      const teamMembersText = formData.get('teamMembers') || '';
      const teamMembers = teamMembersText
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .map((name, index) => ({
          name: name,
          studentNumber: `${Math.floor(Math.random() * 90000000) + 10000000}`,
          email: `${name.toLowerCase().replace(/\s+/g, '_')}@student.akademia.edu`,
          role: 'member'
        }));

      // Ensure unique student numbers
      const usedNumbers = new Set();
      teamMembers.forEach(member => {
        while (usedNumbers.has(member.studentNumber)) {
          member.studentNumber = `${Math.floor(Math.random() * 90000000) + 10000000}`;
        }
        usedNumbers.add(member.studentNumber);
      });

      // Ensure we have at least 3 members (leader + 2 others) but not more than 4
      if (teamMembers.length < 3) {
        const needed = 3 - teamMembers.length;
        for (let i = 0; i < needed; i++) {
          let placeholderStudentNumber = `${Math.floor(Math.random() * 90000000) + 10000000}`;
          while (usedNumbers.has(placeholderStudentNumber)) {
            placeholderStudentNumber = `${Math.floor(Math.random() * 90000000) + 10000000}`;
          }
          usedNumbers.add(placeholderStudentNumber);
          
          teamMembers.push({
            name: `Member ${i + 1}`,
            studentNumber: placeholderStudentNumber,
            email: `member_${i + 1}@student.akademia.edu`,
            role: 'member'
          });
        }
      }
      
      // Ensure we don't exceed 4 members total
      if (teamMembers.length > 4) {
        teamMembers.splice(4);
      }

      const teamData = {
        teamName: formData.get('teamName'),
        teamNumber: parseInt(formData.get('teamNumber')),
        projectTitle: formData.get('projectTitle'),
        projectDescription: formData.get('projectDescription') || '',
        members: teamMembers
      };
      
      const updatedTeam = await api.updateTeam(editingTeam._id, teamData);
      setTeams(teams.map(team => team._id === editingTeam._id ? updatedTeam : team));
      setShowEditModal(false);
      setEditingTeam(null);
      toast.success('Team updated successfully!');
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJudge = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.target);
      const userData = {
        username: formData.get('username'),
        password: formData.get('password'),
        role: 'judge',
        judgeInfo: {
          company: 'Akademia University',
          position: formData.get('specialization') || 'Judge' // specialization stored here
        }
      };
      
      const updatedJudge = await api.updateUser(editingJudge._id, userData);
      setJudges(judges.map(judge => judge._id === editingJudge._id ? updatedJudge : judge));
      setShowEditJudgeModal(false);
      setEditingJudge(null);
      toast.success('Judge updated successfully!');
    } catch (error) {
      console.error('Error updating judge:', error);
      toast.error('Failed to update judge');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJudge = async (judgeId) => {
    try {
      await api.deleteUser(judgeId);
      setJudges(judges.filter(judge => judge._id !== judgeId));
      toast.success('Judge deleted successfully!');
    } catch (error) {
      console.error('Error deleting judge:', error);
      toast.error('Failed to delete judge');
    }
  };

  const handleDeleteRound = async (roundId) => {
    try {
      await api.deleteRound(roundId);
      setRounds(rounds.filter(round => round._id !== roundId));
      toast.success('Round deleted successfully!');
    } catch (error) {
      console.error('Error deleting round:', error);
      toast.error('Failed to delete round');
    }
  };

  const handleAssignJudgeToTeam = async (teamId, judgeId) => {
    try {
      console.log('Assigning judge:', { teamId, judgeId });
      const result = await api.assignJudgeToTeam(teamId, judgeId);
      console.log('Assignment result:', result);
      toast.success('Judge assigned to team successfully!');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error assigning judge:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to assign judge to team: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUnassignJudgeFromTeam = async (teamId, judgeId) => {
    try {
      await api.unassignJudgeFromTeam(teamId, judgeId);
      toast.success('Judge unassigned from team successfully!');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error unassigning judge:', error);
      toast.error('Failed to unassign judge from team');
    }
  };

  const handleAutoAssignJudges = async () => {
    try {
      await api.autoAssignJudges();
      toast.success('Judges assigned automatically!');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error auto-assigning judges:', error);
      toast.error('Failed to auto-assign judges');
    }
  };

  const handleClearAllAssignments = async () => {
    try {
      await api.clearAllAssignments();
      toast.success('All assignments cleared!');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error clearing assignments:', error);
      toast.error('Failed to clear assignments');
    }
  };

  // Criteria management functions
  const handleCreateCriteria = async () => {
    try {
      console.log('Creating criteria with data:', newCriteria);
      const result = await api.createCriteria(newCriteria);
      console.log('Criteria creation result:', result);
      toast.success('Criteria created successfully!');
      setShowCreateCriteriaModal(false);
      setNewCriteria({ name: '', description: '', maxScore: 100, weight: 0, markingGuide: '' });
      loadData(); // Refresh data
      
      // Also refresh criteria list specifically for rounds page
      if (currentView === 'rounds') {
        const updatedCriteria = await api.getCriteria();
        setCriteria(updatedCriteria);
      }
    } catch (error) {
      console.error('Error creating criteria:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to create criteria');
    }
  };

  const handleEditCriteria = (criteria) => {
    setEditingCriteria(criteria);
    setNewCriteria({
      name: criteria.name,
      description: criteria.description || '',
      maxScore: criteria.maxScore
    });
    setShowCreateCriteriaModal(true);
  };

  const handleUpdateCriteria = async () => {
    try {
      await api.updateCriteria(editingCriteria._id, newCriteria);
      toast.success('Criteria updated successfully!');
      setShowCreateCriteriaModal(false);
      setEditingCriteria(null);
      setNewCriteria({ name: '', description: '', maxScore: 100, weight: 0, markingGuide: '' });
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating criteria:', error);
      toast.error('Failed to update criteria');
    }
  };

  const handleDeleteCriteria = async (criteriaId) => {
    if (window.confirm('Are you sure you want to delete this criteria?')) {
      try {
        await api.deleteCriteria(criteriaId);
        toast.success('Criteria deleted successfully!');
        loadData(); // Refresh data
      } catch (error) {
        console.error('Error deleting criteria:', error);
        toast.error('Failed to delete criteria');
      }
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          filter: 'blur(1px)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-30" />
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-akademia-primary to-akademia-secondary text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-akademia-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-base font-medium">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Akademia</h1>
                <p className="text-akademia-light text-base font-medium">Die Oond</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-akademia-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <span className="text-base font-medium">Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-akademia-primary hover:bg-akademia-secondary text-white px-4 py-2 rounded-lg text-base font-medium font-medium transition-colors"
              >
                Uitlog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-akademia-primary"></div>
            <p className="mt-2 text-gray-600">Laai data...</p>
          </div>
        )}


        {/* Dashboard Cards - Always show, even with empty data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-akademia-primary to-akademia-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <span className="text-4xl font-extrabold text-akademia-primary">{teamsCount}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Spanne</h3>
            <p className="text-gray-600 text-base font-medium mb-6">Bestuur studentespanne en projekte</p>
            <button 
              onClick={handleManageTeams}
              className="w-full bg-akademia-primary text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-akademia-secondary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Bestuur Spanne
            </button>
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-akademia-primary to-akademia-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">⚖️</span>
              </div>
              <span className="text-4xl font-extrabold text-akademia-primary">{judgesCount}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Beoordelaars</h3>
            <p className="text-gray-600 text-base font-medium mb-6">Bestuur beoordelaars en toewysings</p>
            <button 
              onClick={handleManageJudges}
              className="w-full bg-akademia-primary text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-akademia-secondary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Bestuur Beoordelaars
            </button>
          </div>

          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-akademia-primary to-akademia-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">🏆</span>
              </div>
              <span className="text-4xl font-extrabold text-akademia-primary">{roundsCount}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Rondes</h3>
            <p className="text-gray-600 text-base font-medium mb-6">Bestuur kompetisie rondes</p>
            <button 
              onClick={handleManageRounds}
              className="w-full bg-akademia-primary text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-akademia-secondary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Bestuur Rondes
            </button>
          </div>

            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 mx-4">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-akademia-primary to-akademia-secondary rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">🔗</span>
                </div>
                <span className="text-4xl font-extrabold text-akademia-primary">{teamsCount}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Toewysings</h3>
              <p className="text-gray-600 text-base font-medium mb-6">Wys beoordelaars aan spanne toe</p>
              <button
                onClick={handleManageAssignments}
                className="w-full bg-akademia-primary text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-akademia-secondary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Bestuur Toewysings
              </button>
            </div>

            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 mx-4">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-akademia-primary to-akademia-secondary rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">📋</span>
                </div>
                <span className="text-4xl font-extrabold text-akademia-primary">{criteriaCount}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Kriteria</h3>
              <p className="text-gray-600 text-base font-medium mb-6">Bestuur puntetelling kriteria</p>
              <button
                onClick={() => setCurrentView('criteria')}
                className="w-full bg-akademia-primary text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-akademia-secondary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Bestuur Kriteria
              </button>
            </div>
        </div>


        {/* Management Views */}
        {currentView === 'teams' && (
          <div className="mt-8 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-akademia-primary">Bestuur Spanne</h2>
              <button 
                onClick={handleBackToDashboard}
                className="bg-akademia-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-akademia-primary transition-all duration-300"
              >
                ← Terug na Dashboard
              </button>
            </div>
            
            {/* Add New Team Form */}
            <div className="bg-akademia-light rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-akademia-primary mb-4">Voeg Nuwe Span By</h3>
              <form onSubmit={handleAddTeam} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Span Naam</label>
                  <input 
                    type="text" 
                    name="teamName"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Voer span naam in"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Projek Titel</label>
                  <input 
                    type="text" 
                    name="projectTitle"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Voer projek titel in"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Projek Beskrywing</label>
                  <textarea 
                    name="projectDescription"
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300 resize-vertical"
                    placeholder="Voer projek beskrywing in"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Span Lede</label>
                  <textarea 
                    name="teamMembers"
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Voer span lede in (een per lyn):&#10;Jan Smit&#10;Maria van der Merwe&#10;Pieter Botha&#10;Daniel Barnard"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Voer elke span lid op 'n nuwe lyn in (3-4 lede totaal)</p>
                </div>
                <div className="md:col-span-2">
                  <button 
                    type="submit"
                    className="w-full bg-akademia-primary text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-akademia-secondary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Voeg Span By
                  </button>
                </div>
              </form>
            </div>

            {/* Teams List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-akademia-primary to-akademia-secondary text-white px-6 py-4">
                <h3 className="text-xl font-bold">Huidige Spanne</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {teams.map((team, index) => (
                    <div key={team._id || team.id || `team-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-akademia-primary to-akademia-secondary rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">T{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{team.teamName}</h4>
                          <p className="text-gray-600">{team.projectTitle}</p>
                          <p className="text-sm text-gray-500">
                            {team.members?.length > 0 ? (
                              <>
                                <span className="font-semibold">Lede ({team.members.length}):</span> {team.members.map(m => m.name).join(', ')}
                              </>
                            ) : 'Geen lede'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditTeam(team)}
                          className="bg-akademia-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-akademia-secondary transition-colors"
                        >
                          Wysig
                        </button>
                        <button 
                          onClick={() => handleDeleteTeam(team._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          Skrap
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'judges' && (
          <div className="mt-8 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-akademia-primary">Manage Judges</h2>
              <button 
                onClick={handleBackToDashboard}
                className="bg-akademia-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-akademia-primary transition-all duration-300"
              >
                ← Back to Dashboard
              </button>
            </div>
            
            {/* Add New Judge Form */}
            <div className="bg-akademia-light rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-akademia-primary mb-4">Add New Judge</h3>
              <form onSubmit={handleAddJudge} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Judge Name</label>
                  <input 
                    type="text" 
                    name="judgeName"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Enter judge full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input 
                    type="text" 
                    name="username"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Enter username for login"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showJudgePassword ? "text" : "password"} 
                      name="password"
                      className="w-full px-4 py-3 pr-20 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                      placeholder="Enter password"
                      defaultValue="Judge123!"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowJudgePassword(!showJudgePassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none text-xs font-medium bg-white border border-gray-300 rounded px-2 py-1 shadow-sm"
                    >
                      {showJudgePassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                  <input 
                    type="text" 
                    name="specialization"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="e.g., Web Development, Mobile Apps"
                  />
                </div>
                <div className="md:col-span-2">
                  <button 
                    type="submit"
                    className="w-full bg-akademia-primary text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-akademia-secondary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Add Judge
                  </button>
                </div>
              </form>
            </div>

            {/* Judges List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-akademia-primary to-akademia-secondary text-white px-6 py-4">
                <h3 className="text-xl font-bold">Current Judges</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {judges.map((judge, index) => (
                    <div key={judge._id || judge.id || `judge-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-akademia-primary to-akademia-secondary rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">J{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{judge.username}</h4>
                          <p className="text-sm text-gray-500">Specialization: {judge.judgeInfo?.position || 'No specialization'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditJudge(judge)}
                          className="bg-akademia-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-akademia-secondary transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteJudge(judge._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'rounds' && (
          <div className="mt-8 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-akademia-primary">Manage Rounds</h2>
              <button 
                onClick={handleBackToDashboard}
                className="bg-akademia-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-akademia-primary transition-all duration-300"
              >
                ← Back to Dashboard
              </button>
            </div>
            
            {/* Add New Round Form */}
            <div className="bg-akademia-light rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-akademia-primary mb-4">Create New Round</h3>
              <form onSubmit={handleAddRound} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Round Name</label>
                  <input 
                    type="text" 
                    name="roundName"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="e.g., Preliminary Round, Final Round"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Round Type</label>
                  <select name="roundType" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300">
                    <option>Select Round Type</option>
                    <option>Preliminary</option>
                    <option>Semi-Final</option>
                    <option>Final</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea 
                    name="description"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300 resize-vertical"
                    rows="3"
                    placeholder="Describe the round requirements and criteria"
                  ></textarea>
                </div>
                
                {/* Criteria Selection */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Select Scoring Criteria
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCreateCriteriaModal(true)}
                      className="text-sm text-akademia-primary hover:text-akademia-secondary font-medium"
                    >
                      + Create New Criteria
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto border-2 border-gray-200 rounded-xl p-4">
                    {criteria.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No criteria available</p>
                        <button
                          type="button"
                          onClick={() => setShowCreateCriteriaModal(true)}
                          className="text-akademia-primary hover:text-akademia-secondary text-sm font-medium mt-2"
                        >
                          Create your first criteria
                        </button>
                      </div>
                    ) : (
                      criteria.map((criterion) => (
                        <label key={criterion._id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                          <input
                            type="checkbox"
                            name="criteria"
                            value={criterion._id}
                            className="w-4 h-4 text-akademia-primary border-gray-300 rounded focus:ring-akademia-primary"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{criterion.name}</span>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>Max: {criterion.maxScore}</span>
                              </div>
                            </div>
                            {criterion.description && (
                              <p className="text-xs text-gray-600 mt-1">{criterion.description}</p>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Select the criteria that judges will use to score teams in this round
                  </p>
                </div>
                <div className="md:col-span-2">
                  <button 
                    type="submit"
                    className="w-full bg-akademia-primary text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-akademia-secondary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Create Round
                  </button>
                </div>
              </form>
            </div>

            {/* Rounds List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-akademia-primary to-akademia-secondary text-white px-6 py-4">
                <h3 className="text-xl font-bold">Current Rounds</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {rounds.map((round, index) => (
                    <div key={round._id || round.id || `round-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-akademia-primary to-akademia-secondary rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">R{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{round.name}</h4>
                          <p className="text-gray-600">{round.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          round.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {round.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          onClick={() => handleDeleteRound(round._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Criteria Management View */}
        {currentView === 'criteria' && (
          <div className="mt-8 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-akademia-primary">Manage Criteria</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCreateCriteriaModal(true)}
                  className="bg-akademia-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-akademia-secondary transition-all duration-300"
                >
                  + Add Criteria
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="bg-akademia-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-akademia-primary transition-all duration-300"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>

            {/* Criteria List */}
            <div className="space-y-4">
              {criteria.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <p className="text-gray-600 text-lg">No criteria created yet</p>
                  <p className="text-gray-500">Create your first scoring criteria</p>
                </div>
              ) : (
                criteria.map((criterion) => (
                  <div key={criterion._id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{criterion.name}</h3>
                        <p className="text-gray-600 mb-4">{criterion.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm text-blue-600 font-medium">Max Score</p>
                            <p className="text-2xl font-bold text-blue-900">{criterion.maxScore}</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-sm text-purple-600 font-medium">Used in Rounds</p>
                            <p className="text-2xl font-bold text-purple-900">
                              {rounds.filter(round => round.criteria.includes(criterion._id)).length}
                            </p>
                          </div>
                        </div>

                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditCriteria(criterion)}
                          className="bg-akademia-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-akademia-primary transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCriteria(criterion._id)}
                          className="bg-akademia-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-akademia-primary transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Team Assignments View */}
        {currentView === 'assignments' && (
          <div className="mt-8 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-akademia-primary">Team Assignments</h2>
              <div className="flex space-x-4">
                <button 
                  onClick={handleAutoAssignJudges}
                  className="bg-akademia-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-akademia-secondary transition-all duration-300"
                >
                  Auto Assign
                </button>
                <button 
                  onClick={handleClearAllAssignments}
                  className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all duration-300"
                >
                  Clear All
                </button>
                <button 
                  onClick={handleBackToDashboard}
                  className="bg-akademia-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-akademia-primary transition-all duration-300"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>

            {/* Assignment Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <h3 className="font-bold text-blue-900 mb-2">Assignment Guidelines</h3>
              <ul className="text-blue-800 space-y-1">
                <li>• Each team can have up to 3 judges assigned</li>
                <li>• Each judge can be assigned to multiple teams</li>
                <li>• Use "Auto Assign" to automatically distribute judges evenly</li>
                <li>• Manually assign judges by clicking the "+" button</li>
                <li>• Remove judges by clicking the "×" button in assigned section</li>
              </ul>
            </div>

            {/* Teams with Assignment Interface */}
            <div className="space-y-6">
              {teams.map((team, index) => (
                <div key={team._id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-akademia-primary to-akademia-secondary rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">T{team.teamNumber}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{team.teamName}</h3>
                        <p className="text-gray-600">{team.projectTitle}</p>
                        <p className="text-sm text-gray-500">Members: {team.members.length}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        Assigned: {team.assignedJudges?.length || 0}/3 judges
                      </span>
                    </div>
                  </div>

                  {/* Assigned Judges */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Assigned Judges:</h4>
                    {team.assignedJudges && team.assignedJudges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {team.assignedJudges.map((judge, judgeIndex) => (
                          <div key={judge._id || judgeIndex} className="flex items-center space-x-2 bg-akademia-primary text-white px-3 py-2 rounded-lg">
                            <span className="text-sm font-medium">{judge.username}</span>
                            <button
                              onClick={() => handleUnassignJudgeFromTeam(team._id, judge._id)}
                              className="text-white hover:text-red-200 text-sm font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No judges assigned yet</p>
                    )}
                  </div>

                  {/* Available Judges */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Available Judges:</h4>
                    <div className="flex flex-wrap gap-2">
                      {judges
                        .filter(judge => !team.assignedJudges?.some(assigned => assigned._id === judge._id))
                        .map((judge, judgeIndex) => (
                          <button
                            key={judge._id || judgeIndex}
                            onClick={() => handleAssignJudgeToTeam(team._id, judge._id)}
                            disabled={team.assignedJudges?.length >= 3}
                            className="flex items-center space-x-2 bg-gray-100 hover:bg-akademia-primary hover:text-white text-gray-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-sm font-medium">+ {judge.username}</span>
                          </button>
                        ))}
                    </div>
                    {team.assignedJudges?.length >= 3 && (
                      <p className="text-sm text-gray-500 mt-2">Maximum judges assigned (3/3)</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Judge Assignments View */}
            <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Judge Assignments Overview</h3>
              <div className="space-y-4">
                {judges.map((judge, index) => {
                  const assignedTeams = teams.filter(team => 
                    team.assignedJudges?.some(assigned => assigned._id === judge._id)
                  );
                  
                  return (
                    <div key={judge._id || index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-akademia-primary to-akademia-secondary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">J{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{judge.username}</h4>
                            <p className="text-sm text-gray-600">{judge.judgeInfo?.position || 'Judge'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">
                            {assignedTeams.length} team{assignedTeams.length !== 1 ? 's' : ''} assigned
                          </span>
                        </div>
                      </div>
                      
                      {assignedTeams.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {assignedTeams.map((team, teamIndex) => (
                            <div key={team._id || teamIndex} className="flex items-center space-x-2 bg-akademia-primary text-white px-3 py-2 rounded-lg">
                              <span className="text-sm font-medium">Team {team.teamNumber}: {team.teamName}</span>
                              <button
                                onClick={() => handleUnassignJudgeFromTeam(team._id, judge._id)}
                                className="text-white hover:text-red-200 text-sm font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No teams assigned</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assignment Summary */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Assignment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-akademia-primary">{teams.length}</div>
                  <div className="text-sm text-gray-600">Total Teams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-akademia-primary">{judges.length}</div>
                  <div className="text-sm text-gray-600">Available Judges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-akademia-primary">
                    {teams.reduce((total, team) => total + (team.assignedJudges?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-akademia-primary">
                    {Math.round(teams.reduce((total, team) => total + (team.assignedJudges?.length || 0), 0) / teams.length * 100) || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Coverage</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Criteria Modal */}
        {showCreateCriteriaModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '42rem',
              width: '100%',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(to right, var(--akademia-primary), var(--akademia-secondary))',
                color: 'white',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                        {editingCriteria ? 'Edit Criteria' : 'Create New Criteria'}
                      </h2>
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontSize: '0.875rem', 
                        margin: '0.25rem 0 0 0' 
                      }}>
                        {editingCriteria ? 'Update scoring criteria for teams' : 'Define new scoring criteria for teams'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateCriteriaModal(false);
                      setEditingCriteria(null);
                      setNewCriteria({ name: '', description: '', maxScore: 100, weight: 0, markingGuide: '' });
                    }}
                    style={{
                      width: '2rem',
                      height: '2rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (editingCriteria) {
                    handleUpdateCriteria();
                  } else {
                    handleCreateCriteria();
                  }
                }} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Criteria Name */}
                  <div>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      marginBottom: '0.75rem'
                    }}>
                      <svg width="16" height="16" fill="none" stroke="var(--akademia-primary)" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Criteria Name
                      <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={newCriteria.name}
                        onChange={(e) => setNewCriteria({...newCriteria, name: e.target.value})}
                        placeholder="e.g., User Interface Design, Code Quality"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 3rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          fontSize: '1rem',
                          backgroundColor: '#f9fafb',
                          transition: 'all 0.3s',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--akademia-primary)';
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '0 0 0 4px rgba(15, 30, 59, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.boxShadow = 'none';
                        }}
                        required
                      />
                      <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '1rem', 
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}>
                        <svg width="20" height="20" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      marginBottom: '0.75rem'
                    }}>
                      <svg width="16" height="16" fill="none" stroke="var(--akademia-primary)" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
                      </svg>
                      Description
                    </label>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        value={newCriteria.description}
                        onChange={(e) => setNewCriteria({...newCriteria, description: e.target.value})}
                        placeholder="Describe what this criteria evaluates..."
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 3rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          fontSize: '1rem',
                          backgroundColor: '#f9fafb',
                          transition: 'all 0.3s',
                          outline: 'none',
                          resize: 'none',
                          minHeight: '6rem'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--akademia-primary)';
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '0 0 0 4px rgba(15, 30, 59, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.boxShadow = 'none';
                        }}
                        rows="3"
                      />
                      <div style={{ 
                        position: 'absolute', 
                        top: '0.75rem', 
                        left: '1rem',
                        pointerEvents: 'none'
                      }}>
                        <svg width="20" height="20" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Max Score */}
                  <div>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      marginBottom: '0.75rem'
                    }}>
                      <svg width="16" height="16" fill="none" stroke="var(--akademia-primary)" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                      Maximum Score
                      <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={newCriteria.maxScore}
                        onChange={(e) => setNewCriteria({...newCriteria, maxScore: parseInt(e.target.value) || 0})}
                        min="1"
                        max="1000"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 3rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          fontSize: '1rem',
                          backgroundColor: '#f9fafb',
                          transition: 'all 0.3s',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--akademia-primary)';
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '0 0 0 4px rgba(15, 30, 59, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.boxShadow = 'none';
                        }}
                        required
                      />
                      <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '1rem', 
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}>
                        <svg width="20" height="20" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      Enter a score between 1 and 1000 points
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '1rem', 
                  marginTop: '2rem', 
                  paddingTop: '1.5rem', 
                  borderTop: '1px solid #f3f4f6' 
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCriteriaModal(false);
                      setEditingCriteria(null);
                      setNewCriteria({ name: '', description: '', maxScore: 100, weight: 0, markingGuide: '' });
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#e5e7eb';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'var(--akademia-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'var(--akademia-secondary)';
                      e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'var(--akademia-primary)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {editingCriteria ? (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Update Criteria
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Create Criteria
                      </>
                    )}
                  </button>
                </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Team Modal */}
        {showEditModal && editingTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Wysig Span</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTeam(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleUpdateTeam} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Span Naam</label>
                  <input 
                    type="text" 
                    name="teamName"
                    defaultValue={editingTeam.teamName}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Voer span naam in"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Span Nommer</label>
                  <input 
                    type="number" 
                    name="teamNumber"
                    defaultValue={editingTeam.teamNumber}
                    min="1"
                    max="15"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Voer span nommer in"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title</label>
                  <input 
                    type="text" 
                    name="projectTitle"
                    defaultValue={editingTeam.projectTitle}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Enter project title"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Description</label>
                  <textarea 
                    name="projectDescription"
                    defaultValue={editingTeam.projectDescription}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300 resize-vertical"
                    placeholder="Enter project description"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Team Members</label>
                  <textarea 
                    name="teamMembers"
                    defaultValue={editingTeam.members?.map(m => m.name).join('\n') || ''}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Enter team members (one per line):&#10;John Smith&#10;Jane Doe&#10;Mike Johnson&#10;Daniel Barnard"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Enter each team member on a new line (3-4 members total)</p>
                </div>
                <div className="md:col-span-2 flex space-x-3">
                  <button 
                    type="submit"
                    className="flex-1 bg-akademia-primary text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-akademia-secondary transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Update Team
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTeam(null);
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Judge Modal */}
        {showEditJudgeModal && editingJudge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Judge</h3>
                <button
                  onClick={() => {
                    setShowEditJudgeModal(false);
                    setEditingJudge(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleUpdateJudge} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Judge Name</label>
                  <input 
                    type="text" 
                    name="judgeName"
                    defaultValue={editingJudge.judgeInfo?.name || editingJudge.username}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Enter judge name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input 
                    type="text" 
                    name="username"
                    defaultValue={editingJudge.username}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="Enter username for login"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showEditJudgePassword ? "text" : "password"} 
                      name="password"
                      defaultValue="Judge123!"
                      className="w-full px-4 py-3 pr-20 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditJudgePassword(!showEditJudgePassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none text-xs font-medium bg-white border border-gray-300 rounded px-2 py-1 shadow-sm"
                    >
                      {showEditJudgePassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                  <input 
                    type="text" 
                    name="specialization"
                    defaultValue={editingJudge.judgeInfo?.position || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-akademia-primary focus:border-akademia-primary transition-all duration-300"
                    placeholder="e.g., Web Development, Mobile Apps"
                  />
                </div>
                <div className="md:col-span-2 flex space-x-3">
                  <button 
                    type="submit"
                    className="flex-1 bg-akademia-primary text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-akademia-secondary transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Update Judge
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEditJudgeModal(false);
                      setEditingJudge(null);
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Scoring Modal Component
const ScoringModal = ({ team, round, criteria, onSubmit, onClose }) => {
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(false);


  const handleScoreChange = (criteriaId, score) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: Math.max(0, Math.min(100, parseInt(score) || 0))
    }));
  };

  const handleCommentChange = (criteriaId, comment) => {
    setComments(prev => ({
      ...prev,
      [criteriaId]: comment
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit scores for each criteria
      for (const criterion of criteria) {
        const score = scores[criterion._id];
        const comment = comments[criterion._id] || '';

        if (score !== undefined) {
          await onSubmit({
            teamId: team._id,
            roundId: round._id,
            criteriaId: criterion._id,
            score,
            comments: comment
          });
        }
      }
      
      toast.success('All scores submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting scores:', error);
      toast.error('Failed to submit scores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[75vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Score Team: {team.teamName}</h2>
              <p className="text-blue-100 text-sm">Round: {round.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-all hover:bg-opacity-30"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4">
          {criteria.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Criteria Available</h3>
              <p className="text-gray-500 text-lg">This round doesn't have any scoring criteria set up yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {criteria.map((criterion) => (
              <div key={criterion._id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{criterion.name}</h3>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span>Max: {criterion.maxScore} points</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        <span>Weight: {criterion.weight}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-3 min-w-[100px]">
                    <div className="text-2xl font-bold">
                      {scores[criterion._id] || 0}
                    </div>
                    <div className="text-xs opacity-90">/ {criterion.maxScore}</div>
                  </div>
                </div>

                {criterion.markingGuide && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <h4 className="font-bold text-blue-900 mb-2">Marking Guide:</h4>
                    <p className="text-blue-800">{criterion.markingGuide}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Score (0 - {criterion.maxScore})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={criterion.maxScore}
                        value={scores[criterion._id] || 0}
                        onChange={(e) => handleScoreChange(criterion._id, e.target.value)}
                        className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        placeholder="Enter score"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Comments (Optional)
                    </label>
                    <textarea
                      value={comments[criterion._id] || ''}
                      onChange={(e) => handleCommentChange(criterion._id, e.target.value)}
                      placeholder="Add your feedback and comments..."
                      className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || criteria.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Submit Scores
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Judge Dashboard Component
const JudgeDashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [showCreateCriteriaModal, setShowCreateCriteriaModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    maxScore: 100,
    weight: 0,
    markingGuide: ''
  });

  useEffect(() => {
    loadJudgeData();
  }, []);

  const loadJudgeData = async () => {
    setLoading(true);
    try {
      console.log('=== LOADING JUDGE DATA ===');
      
      // Load teams assigned to this judge
      console.log('Loading teams for judge...');
      const teamsResponse = await api.getTeamsForJudge();
      console.log('Teams response:', teamsResponse);
      setTeams(teamsResponse);
      
      // Load active rounds
      console.log('Loading rounds...');
      const roundsResponse = await api.getRounds();
      console.log('Rounds response:', roundsResponse);
      const openRounds = roundsResponse.filter(round => round.isOpen);
      console.log('Open rounds:', openRounds);
      console.log('Round 1 criteria:', openRounds[0]?.criteria);
      console.log('Round 2 criteria:', openRounds[1]?.criteria);
      setRounds(openRounds);
      
      // Load criteria
      console.log('Loading criteria...');
      const criteriaResponse = await api.getCriteria();
      console.log('Criteria response:', criteriaResponse);
      console.log('Criteria response type:', typeof criteriaResponse);
      console.log('Criteria response length:', criteriaResponse?.length);
      console.log('First criteria:', criteriaResponse?.[0]);
      console.log('All criteria IDs:', criteriaResponse?.map(c => c._id));
      setCriteria(criteriaResponse);
      
      // Load judge's scores
      console.log('Loading scores...');
      try {
        const scoresResponse = await api.getJudgeScores();
        console.log('Scores response:', scoresResponse);
        setScores(scoresResponse);
      } catch (error) {
        console.log('No scores found or server error, continuing with empty scores');
        setScores([]);
      }
      
      // Load leaderboard
      console.log('Loading leaderboard...');
      try {
        const leaderboardResponse = await api.getLeaderboard();
        console.log('Leaderboard response:', leaderboardResponse);
        setLeaderboard(leaderboardResponse.leaderboard || []);
      } catch (error) {
        console.log('No leaderboard found or server error, continuing with empty leaderboard');
        setLeaderboard([]);
      }
      
      console.log('=== JUDGE DATA LOADED ===');
      
    } catch (error) {
      console.error('Error loading judge data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message);
      console.error('Full error response:', error.response?.data);
      // Only show error for critical failures, not for missing scores
      if (error.response?.status !== 500 || !error.response?.data?.message?.includes('scores')) {
        toast.error(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleStartScoring = (team, round) => {
    setSelectedTeam(team);
    setSelectedRound(round);
    setShowScoringModal(true);
  };

  const handleSubmitScore = async (scoreData) => {
    try {
      await api.submitScore(scoreData);
      toast.success('Score submitted successfully!');
      setShowScoringModal(false);
      loadJudgeData(); // Refresh data
    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error('Failed to submit score');
    }
  };

  const handleEditScore = async (scoreId, newScore, comments) => {
    try {
      await api.updateScore(scoreId, { score: newScore, comments });
      toast.success('Score updated successfully!');
      loadJudgeData(); // Refresh data
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Failed to update score');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          filter: 'blur(1px)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-30" />
      
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-akademia-primary to-akademia-secondary text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-akademia-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-base font-medium">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Akademia</h1>
                <p className="text-akademia-light text-base font-medium">Die Oond</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-akademia-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">J</span>
                </div>
                <span className="text-base font-medium">Beoordelaar - {user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-akademia-primary hover:bg-akademia-secondary text-white px-4 py-2 rounded-lg text-base font-medium transition-colors"
              >
                Uitlog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-akademia-primary"></div>
        </div>
        )}

        {/* Dashboard Header */}
        <div className="mb-8">
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white bg-opacity-90 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'teams'
                  ? 'bg-akademia-primary text-white shadow-lg'
                  : 'text-gray-600 hover:text-akademia-primary'
              }`}
            >
              My Spanne
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-akademia-primary text-white shadow-lg'
                  : 'text-gray-600 hover:text-akademia-primary'
              }`}
            >
              Punte Geskiedenis
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-akademia-primary text-white shadow-lg'
                  : 'text-gray-600 hover:text-akademia-primary'
              }`}
            >
              Ranglys
            </button>
          </div>
          </div>

        {/* Tab Content */}
        {activeTab === 'teams' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Toegewysde Spanne</p>
                    <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aktiewe Rondes</p>
                    <p className="text-2xl font-bold text-gray-900">{rounds.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Punte Ingedien</p>
                    <p className="text-2xl font-bold text-gray-900">{scores.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams Grid */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Jou Toegewysde Spanne</h3>
                <p className="text-sm text-gray-600 mt-1">Klik op 'n span om te begin puntetelling</p>
              </div>
              
              {teams.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Geen spanne toegewys nie</h3>
                  <p className="text-gray-500">Kontak die admin om span toewysings te kry</p>
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => (
                      <div key={team._id} className="group bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 hover:border-akademia-primary">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 group-hover:text-akademia-primary transition-colors">
                                {team.teamName}
                              </h4>
                              <p className="text-xs text-gray-500">Span #{team.teamNumber}</p>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Aktief
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-xs mb-3 line-clamp-1">{team.projectTitle}</p>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="w-8 h-8 mr-3 text-akademia-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '36px', height: '36px'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                              </svg>
                              {team.members.length} lede
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="w-8 h-8 mr-3 text-akademia-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '36px', height: '36px'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                              </svg>
                              Leier: {team.members.find(m => m.role === 'leader')?.name || team.members[0]?.name}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {rounds.map((round) => (
                              <button
                                key={round._id}
                                onClick={() => handleStartScoring(team, round)}
                                className="w-full bg-akademia-primary hover:bg-akademia-secondary text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center shadow-md"
                                style={{padding: '4px 16px', fontSize: '12px', minHeight: '48px'}}
                              >
                                <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '36px', height: '36px'}}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Puntetelling {round.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Score History</h3>
              {scores.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg">No scores submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scores.map((score) => (
                    <div key={score._id} className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-akademia-primary">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{score.team?.teamName}</h4>
                          <p className="text-gray-600">{score.criteria?.name}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-akademia-primary">{score.score}</span>
                          <p className="text-sm text-gray-500">/ {score.criteria?.maxScore}</p>
                        </div>
                      </div>
                      {score.comments && (
                        <p className="text-gray-600 mb-4">{score.comments}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Submitted: {new Date(score.submittedAt || score.createdAt).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleEditScore(score._id, score.score, score.comments)}
                          className="bg-akademia-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-akademia-primary transition-colors"
                        >
                          Edit Score
            </button>
          </div>
        </div>
                  ))}
      </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Overall Leaderboard</h3>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg">No scores available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((team, index) => (
                    <div key={team.team._id} className={`bg-white rounded-lg p-6 shadow-lg border-l-4 ${
                      index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100' :
                      index === 1 ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100' :
                      index === 2 ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-orange-100' :
                      'border-akademia-primary'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-br from-gray-500 to-gray-600' :
                            index === 2 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                            'bg-gradient-to-br from-akademia-primary to-akademia-secondary'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{team.team.teamName}</h4>
                            <p className="text-gray-600">Team #{team.team.teamNumber}</p>
                            {team.team.members && team.team.members.length > 0 && (
                              <p className="text-sm text-gray-500">
                                Members: {team.team.members.map(member => member.name).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-akademia-primary">
                            {team.averageScore.toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-500">
                            Average Score
                          </p>
                          <p className="text-xs text-gray-400">
                            {team.roundCount} round{team.roundCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      {/* Round breakdown */}
                      {Object.values(team.rounds).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Round Breakdown:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.values(team.rounds).map((roundData, roundIndex) => (
                              <div key={roundIndex} className="bg-gray-50 rounded p-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {roundData.round.name}
                                  </span>
                                  <span className="text-sm font-bold text-akademia-primary">
                                    {((roundData.roundScore / roundData.roundPossibleScore) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scoring Modal */}
        {showScoringModal && selectedTeam && selectedRound && (
          <ScoringModal
            key={`${selectedTeam._id}-${selectedRound._id}`}
            team={selectedTeam}
            round={selectedRound}
            criteria={criteria.filter(c => {
              // Handle both string IDs and object IDs
              const roundCriteriaIds = selectedRound.criteria.map(rc => 
                typeof rc === 'string' ? rc : rc._id || rc.id
              );
              return roundCriteriaIds.includes(c._id);
            })}
            onSubmit={handleSubmitScore}
            onClose={() => setShowScoringModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('ProtectedRoute check:', { token: !!token, user, hasRole: !!user.role });

  if (!token || !user.role) {
    console.log('Redirecting to login - missing token or role');
    return <Navigate to="/" replace />;
  }

  console.log('Access granted to protected route');
  return children;
};

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Main App Component
const App = () => {
  return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/judge-dashboard" element={
              <ProtectedRoute>
                <JudgeDashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </Router>
      </QueryClientProvider>
  );
};

export default App;
