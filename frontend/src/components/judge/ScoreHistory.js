import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Clock, 
  Eye, 
  Target, 
  BarChart3,
  Calendar,
  Users,
  Award
} from 'lucide-react';
import { scoresAPI, roundsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatNumber, cn } from '../../utils/helpers';

/**
 * Score History component - Shows judge's scoring history
 */
const ScoreHistory = () => {
  const [selectedRound, setSelectedRound] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch rounds data
  const { data: roundsData, isLoading: roundsLoading } = useQuery(
    'rounds',
    () => roundsAPI.getRounds({ limit: 100 })
  );

  // Fetch judge's scores
  const { data: scoresData, isLoading: scoresLoading } = useQuery(
    ['judgeScores', selectedRound, currentPage, pageSize],
    () => scoresAPI.getMyScores({ 
      roundId: selectedRound,
      page: currentPage,
      limit: pageSize
    }),
    { enabled: !!selectedRound }
  );

  const rounds = roundsData?.data?.rounds || [];
  const scores = scoresData?.data?.scores || [];
  const pagination = scoresData?.data?.pagination || {};

  const isLoading = roundsLoading || scoresLoading;

  // Calculate statistics
  const totalScores = scores.length;
  const submittedScores = scores.filter(s => s.isSubmitted).length;
  const draftScores = scores.filter(s => !s.isSubmitted).length;
  const averageScore = scores.length > 0 
    ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length 
    : 0;

  if (isLoading) {
    return <LoadingSpinner text="Loading score history..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-akademia-primary">
            Score History
          </h1>
          <p className="text-gray-600 mt-1">
            View your scoring history and statistics
          </p>
        </div>
      </div>

      {/* Round Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-akademia-primary mb-4">
          Select Round
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Round</label>
            <select
              value={selectedRound || ''}
              onChange={(e) => {
                setSelectedRound(e.target.value);
                setCurrentPage(1);
              }}
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

      {selectedRound && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scores</p>
                  <p className="text-2xl font-bold text-akademia-primary">
                    {formatNumber(totalScores)}
                  </p>
                </div>
                <div className="stat-card-icon primary">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(submittedScores)}
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
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatNumber(draftScores)}
                  </p>
                </div>
                <div className="stat-card-icon warning">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-akademia-secondary">
                    {averageScore.toFixed(1)}
                  </p>
                </div>
                <div className="stat-card-icon secondary">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Scores Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-akademia-primary">
                Scoring History
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="akademia-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Criteria</th>
                    <th>Score</th>
                    <th>Max Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr key={score._id}>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">
                            {score.team.teamName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Team #{score.team.teamNumber}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <Target className="h-4 w-4 text-akademia-primary mr-2" />
                          <span className="text-sm text-gray-900">
                            {score.criteria.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="text-lg font-semibold text-akademia-primary">
                          {score.score}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {score.criteria.maxScore}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {((score.score / score.criteria.maxScore) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          score.isSubmitted
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        )}>
                          {score.isSubmitted ? 'Submitted' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">
                            {score.submittedAt ? formatDate(score.submittedAt) : '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button className="p-1 text-gray-400 hover:text-akademia-primary">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.current * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={pagination.current === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                    disabled={pagination.current === pagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {scores.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No scores found
              </h3>
              <p className="text-gray-500">
                You haven't scored any teams for this round yet.
              </p>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!selectedRound && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Round
          </h3>
          <p className="text-gray-500">
            Choose a round to view your scoring history.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScoreHistory;
