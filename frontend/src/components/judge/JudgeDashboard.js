import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Calendar,
  Award
} from 'lucide-react';
import { teamsAPI, scoresAPI, roundsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatNumber, cn } from '../../utils/helpers';

/**
 * Judge Dashboard - Shows assigned teams and scoring progress
 */
const JudgeDashboard = () => {
  const [selectedRound, setSelectedRound] = useState(null);

  // Fetch active rounds
  const { data: roundsData, isLoading: roundsLoading } = useQuery(
    'activeRounds',
    () => roundsAPI.getActiveRounds()
  );

  // Fetch assigned teams
  const { data: teamsData, isLoading: teamsLoading } = useQuery(
    ['assignedTeams', selectedRound],
    () => teamsAPI.getTeams({ limit: 100 }),
    { enabled: !!selectedRound }
  );

  // Fetch judge's scores
  const { data: scoresData, isLoading: scoresLoading } = useQuery(
    ['judgeScores', selectedRound],
    () => scoresAPI.getMyScores({ roundId: selectedRound }),
    { enabled: !!selectedRound }
  );

  const rounds = roundsData?.data?.rounds || [];
  const teams = teamsData?.data?.teams || [];
  const scores = scoresData?.data?.scores || [];

  const isLoading = roundsLoading || teamsLoading || scoresLoading;

  // Calculate statistics
  const totalTeams = teams.length;
  const scoredTeams = scores.length;
  const completionRate = totalTeams > 0 ? (scoredTeams / totalTeams) * 100 : 0;

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-akademia-primary">
            Judge Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Evaluate your assigned teams
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
            <label className="form-label">Active Round</label>
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

      {selectedRound && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned Teams</p>
                  <p className="text-2xl font-bold text-akademia-primary">
                    {formatNumber(totalTeams)}
                  </p>
                </div>
                <div className="stat-card-icon primary">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teams Scored</p>
                  <p className="text-2xl font-bold text-akademia-primary">
                    {formatNumber(scoredTeams)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {completionRate.toFixed(1)}% complete
                  </p>
                </div>
                <div className="stat-card-icon success">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-akademia-primary">
                    {formatNumber(totalTeams - scoredTeams)}
                  </p>
                </div>
                <div className="stat-card-icon warning">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-akademia-primary mb-4">
              Scoring Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-akademia-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-600">Completed:</span>
                  <span className="ml-2 text-gray-900">{scoredTeams} teams</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-gray-600">Remaining:</span>
                  <span className="ml-2 text-gray-900">{totalTeams - scoredTeams} teams</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Teams */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-akademia-primary mb-4">
              Your Assigned Teams
            </h3>
            
            {teams.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No teams assigned
                </h3>
                <p className="text-gray-500">
                  You haven't been assigned to any teams for this round.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => {
                  const teamScore = scores.find(s => s.team._id === team._id);
                  const isScored = !!teamScore;
                  
                  return (
                    <div key={team._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{team.teamName}</h4>
                          <p className="text-sm text-gray-500">Team #{team.teamNumber}</p>
                        </div>
                        <div className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          isScored 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        )}>
                          {isScored ? 'Scored' : 'Pending'}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Project:</strong> {team.projectTitle}</p>
                        <p><strong>Members:</strong> {team.members.length}</p>
                        <p><strong>Leader:</strong> {team.members.find(m => m.role === 'leader')?.name || 'N/A'}</p>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button className="akademia-btn-primary text-sm flex-1">
                          {isScored ? 'View Score' : 'Score Team'}
                        </button>
                        <button className="akademia-btn-outline text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedRound && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Round
          </h3>
          <p className="text-gray-500">
            Choose an active round to view your assigned teams and start scoring.
          </p>
        </div>
      )}
    </div>
  );
};

export default JudgeDashboard;
