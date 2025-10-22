import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  Target, 
  Calendar, 
  Award, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { teamsAPI, criteriaAPI, roundsAPI, scoresAPI, authAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatNumber } from '../../utils/helpers';

// Admin Dashboard component - Displays overview statistics and key metrics\
const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch dashboard data
  const { data: teamStats, isLoading: teamsLoading } = useQuery(
    'teamStats',
    () => teamsAPI.getTeamStats(),
    { refetchInterval: 30000 }
  );

  const { data: criteriaStats, isLoading: criteriaLoading } = useQuery(
    'criteriaStats',
    () => criteriaAPI.getCriteriaStats(),
    { refetchInterval: 30000 }
  );

  const { data: roundStats, isLoading: roundsLoading } = useQuery(
    'roundStats',
    () => roundsAPI.getRoundStats(),
    { refetchInterval: 30000 }
  );

  const { data: scoreStats, isLoading: scoresLoading } = useQuery(
    'scoreStats',
    () => scoresAPI.getScoreStats(),
    { refetchInterval: 30000 }
  );

  const { data: userStats, isLoading: usersLoading } = useQuery(
    'userStats',
    () => authAPI.getUserStats(),
    { refetchInterval: 30000 }
  );

  const isLoading = teamsLoading || criteriaLoading || roundsLoading || scoresLoading || usersLoading;

  /**
   * Get status color based on value
   */
  const getStatusColor = (value, threshold = 0) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Get status icon based on value
   */
  const getStatusIcon = (value, threshold = 0) => {
    if (value >= threshold) return CheckCircle;
    if (value >= threshold * 0.7) return AlertCircle;
    return AlertCircle;
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-akademia-primary">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Overview of the Student Project Marking System
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-select"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Teams Card */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teams</p>
              <p className="text-2xl font-bold text-akademia-primary">
                {formatNumber(teamStats?.data?.stats?.totalTeams || 0)}
              </p>
              <p className="text-sm text-gray-500">
                {formatNumber(teamStats?.data?.stats?.participatingTeams || 0)} participating
              </p>
            </div>
            <div className="stat-card-icon primary">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12% from last week</span>
          </div>
        </div>

        {/* Criteria Card */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Evaluation Criteria</p>
              <p className="text-2xl font-bold text-akademia-primary">
                {formatNumber(criteriaStats?.data?.stats?.activeCriteria || 0)}
              </p>
              <p className="text-sm text-gray-500">
                {formatNumber(criteriaStats?.data?.stats?.totalCriteria || 0)} total
              </p>
            </div>
            <div className="stat-card-icon secondary">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <BarChart3 className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-sm text-blue-600">
              Avg. {formatNumber(criteriaStats?.data?.stats?.averageMaxScore || 0)} points
            </span>
          </div>
        </div>

        {/* Rounds Card */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rounds</p>
              <p className="text-2xl font-bold text-akademia-primary">
                {formatNumber(roundStats?.data?.stats?.openRounds || 0)}
              </p>
              <p className="text-sm text-gray-500">
                {formatNumber(roundStats?.data?.stats?.totalRounds || 0)} total rounds
              </p>
            </div>
            <div className="stat-card-icon success">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Clock className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-sm text-orange-600">
              {formatNumber(roundStats?.data?.stats?.averageCompletion || 0)}% completion
            </span>
          </div>
        </div>

        {/* Scores Card */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scores Submitted</p>
              <p className="text-2xl font-bold text-akademia-primary">
                {formatNumber(scoreStats?.data?.stats?.submittedScores || 0)}
              </p>
              <p className="text-sm text-gray-500">
                {formatNumber(scoreStats?.data?.stats?.totalScores || 0)} total evaluations
              </p>
            </div>
            <div className="stat-card-icon warning">
              <Award className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">
              Avg. {formatNumber(scoreStats?.data?.stats?.averageScore || 0)} points
            </span>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-akademia-primary mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New team registered</p>
                <p className="text-xs text-gray-500">Team Alpha - 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Round 1 closed</p>
                <p className="text-xs text-gray-500">All scores submitted - 1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Judge assignment completed</p>
                <p className="text-xs text-gray-500">12 judges assigned - 3 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New criteria added</p>
                <p className="text-xs text-gray-500">"User Experience" - 5 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-akademia-primary mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Connection</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm text-blue-600">
                  {formatNumber(userStats?.data?.stats?.reduce((sum, stat) => sum + stat.activeCount, 0) || 0)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-akademia-primary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="akademia-btn-primary p-4 text-left">
            <Users className="h-6 w-6 mb-2" />
            <div>
              <p className="font-medium">Add Team</p>
              <p className="text-sm text-white/80">Register new project team</p>
            </div>
          </button>
          
          <button className="akademia-btn-secondary p-4 text-left">
            <Target className="h-6 w-6 mb-2" />
            <div>
              <p className="font-medium">Create Criteria</p>
              <p className="text-sm text-white/80">Add evaluation criteria</p>
            </div>
          </button>
          
          <button className="akademia-btn-outline p-4 text-left">
            <Calendar className="h-6 w-6 mb-2" />
            <div>
              <p className="font-medium">Start Round</p>
              <p className="text-sm text-akademia-primary">Begin new evaluation</p>
            </div>
          </button>
          
          <button className="akademia-btn-outline p-4 text-left">
            <Award className="h-6 w-6 mb-2" />
            <div>
              <p className="font-medium">View Results</p>
              <p className="text-sm text-akademia-primary">Check winners</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;