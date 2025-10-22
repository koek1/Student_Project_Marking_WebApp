import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Award,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { scoresAPI, roundsAPI, teamsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatNumber, cn } from '../../utils/helpers';

/**
 * Analytics component - Shows detailed analytics and charts
 */
const Analytics = () => {
  const [selectedRound, setSelectedRound] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch rounds data
  const { data: roundsData, isLoading: roundsLoading } = useQuery(
    'rounds',
    () => roundsAPI.getRounds({ limit: 100 })
  );

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    ['analytics', selectedRound, timeRange],
    () => {
      // This would call a real analytics API endpoint
      // For now, we'll return mock data
      return Promise.resolve({
        data: {
          roundStats: {
            totalRounds: 3,
            activeRounds: 1,
            closedRounds: 2,
            averageCompletion: 85.5
          },
          teamStats: {
            totalTeams: 15,
            participatingTeams: 12,
            averageScore: 87.3,
            topPerformingTeam: 'Team Alpha'
          },
          judgeStats: {
            totalJudges: 8,
            activeJudges: 8,
            averageEvaluations: 4.5,
            mostActiveJudge: 'Dr. Smith'
          },
          scoreDistribution: [
            { range: '90-100', count: 3, percentage: 25 },
            { range: '80-89', count: 5, percentage: 41.7 },
            { range: '70-79', count: 3, percentage: 25 },
            { range: '60-69', count: 1, percentage: 8.3 }
          ],
          criteriaPerformance: [
            { name: 'Technical Implementation', averageScore: 89.2, maxScore: 100 },
            { name: 'User Experience', averageScore: 85.7, maxScore: 100 },
            { name: 'Innovation', averageScore: 82.1, maxScore: 100 },
            { name: 'Presentation', averageScore: 88.9, maxScore: 100 }
          ],
          timeSeriesData: [
            { date: '2024-01-01', scores: 12, teams: 4 },
            { date: '2024-01-02', scores: 18, teams: 6 },
            { date: '2024-01-03', scores: 24, teams: 8 },
            { date: '2024-01-04', scores: 30, teams: 10 },
            { date: '2024-01-05', scores: 36, teams: 12 }
          ]
        }
      });
    },
    { enabled: !!selectedRound }
  );

  const rounds = roundsData?.data?.rounds || [];
  const analytics = analyticsData?.data || {};

  const isLoading = roundsLoading || analyticsLoading;

  /**
   * Handle export analytics
   */
  const handleExportAnalytics = () => {
    if (!analytics) return;
    
    const data = {
      ...analytics,
      exportedAt: new Date().toISOString(),
      timeRange: timeRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-akademia-primary">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Detailed insights and performance metrics
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
          <button
            onClick={handleExportAnalytics}
            className="akademia-btn-outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Round Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-akademia-primary mb-4">
          Select Round for Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Round</label>
            <select
              value={selectedRound || ''}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="form-select"
            >
              <option value="">Select a round...</option>
              {rounds.map((round) => (
                <option key={round._id} value={round._id}>
                  {round.name} - {formatDate(round.endDate)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setSelectedRound(null)}
              className="akademia-btn-outline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      {selectedRound && analytics && (
        <>
          {/* Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Rounds</p>
                  <p className="text-2xl font-bold text-akademia-primary">
                    {analytics.roundStats?.totalRounds || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    {analytics.roundStats?.activeRounds || 0} active
                  </p>
                </div>
                <div className="stat-card-icon primary">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Teams</p>
                  <p className="text-2xl font-bold text-akademia-primary">
                    {analytics.teamStats?.totalTeams || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    {analytics.teamStats?.participatingTeams || 0} participating
                  </p>
                </div>
                <div className="stat-card-icon secondary">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-akademia-primary">
                    {analytics.teamStats?.averageScore?.toFixed(1) || 0}%
                  </p>
                  <p className="text-sm text-gray-500">
                    Top: {analytics.teamStats?.topPerformingTeam || 'N/A'}
                  </p>
                </div>
                <div className="stat-card-icon success">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Judges</p>
                  <p className="text-2xl font-bold text-akademia-primary">
                    {analytics.judgeStats?.activeJudges || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    Avg: {analytics.judgeStats?.averageEvaluations?.toFixed(1) || 0} evals
                  </p>
                </div>
                <div className="stat-card-icon warning">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Score Distribution Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-akademia-primary mb-4">
              Score Distribution
            </h3>
            <div className="space-y-4">
              {analytics.scoreDistribution?.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">{item.range}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-akademia-primary h-4 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 text-right">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Criteria Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-akademia-primary mb-4">
              Criteria Performance
            </h3>
            <div className="space-y-4">
              {analytics.criteriaPerformance?.map((criteria, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{criteria.name}</h4>
                    <span className="text-sm text-gray-500">
                      {criteria.averageScore.toFixed(1)} / {criteria.maxScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-akademia-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(criteria.averageScore / criteria.maxScore) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {((criteria.averageScore / criteria.maxScore) * 100).toFixed(1)}% average
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Series Data */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-akademia-primary mb-4">
              Evaluation Progress Over Time
            </h3>
            <div className="space-y-4">
              {analytics.timeSeriesData?.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{formatDate(data.date)}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Scores</p>
                      <p className="text-lg font-semibold text-akademia-primary">{data.scores}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Teams</p>
                      <p className="text-lg font-semibold text-akademia-secondary">{data.teams}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Judge Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-akademia-primary mb-4">
              Judge Activity Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Most Active Judge</h4>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-akademia-primary mr-2" />
                  <span className="text-sm text-gray-900">
                    {analytics.judgeStats?.mostActiveJudge || 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Average Evaluations</h4>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-akademia-secondary mr-2" />
                  <span className="text-sm text-gray-900">
                    {analytics.judgeStats?.averageEvaluations?.toFixed(1) || 0} per judge
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedRound && !isLoading && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Round
          </h3>
          <p className="text-gray-500">
            Choose a round to view detailed analytics and insights.
          </p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
