import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  Trophy, 
  Medal, 
  Award, 
  BarChart3, 
  Users, 
  Target,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { scoresAPI, roundsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatNumber, cn } from '../../utils/helpers';

/**
 * Winner Display component - Shows competition results and winners
 */
const WinnerDisplay = () => {
  const [selectedRound, setSelectedRound] = useState(null);
  const [winners, setWinners] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch closed rounds
  const { data: roundsData, isLoading: roundsLoading } = useQuery(
    'closedRounds',
    () => roundsAPI.getRounds({ isOpen: false, limit: 100 })
  );

  // Calculate winners
  const calculateWinners = async (roundId) => {
    setIsCalculating(true);
    try {
      // This would call the backend API to calculate winners
      // For now, we'll simulate the data
      const mockWinners = {
        round: {
          id: roundId,
          name: 'Final Round',
          endDate: new Date().toISOString()
        },
        totalTeams: 12,
        evaluatedTeams: 12,
        winner: {
          teamId: '1',
          teamName: 'Team Alpha',
          teamNumber: 1,
          members: [
            { name: 'John Doe', role: 'leader' },
            { name: 'Jane Smith', role: 'member' },
            { name: 'Bob Johnson', role: 'member' }
          ],
          totalScore: 285.5,
          maxPossibleScore: 300,
          averageScore: 95.2,
          judgeCount: 3
        },
        rankings: [
          {
            position: 1,
            teamId: '1',
            teamName: 'Team Alpha',
            teamNumber: 1,
            totalScore: 285.5,
            averageScore: 95.2,
            judgeCount: 3
          },
          {
            position: 2,
            teamId: '2',
            teamName: 'Team Beta',
            teamNumber: 2,
            totalScore: 278.3,
            averageScore: 92.8,
            judgeCount: 3
          },
          {
            position: 3,
            teamId: '3',
            teamName: 'Team Gamma',
            teamNumber: 3,
            totalScore: 271.7,
            averageScore: 90.6,
            judgeCount: 3
          }
        ],
        statistics: {
          highestScore: 95.2,
          lowestScore: 78.5,
          averageScore: 87.3,
          scoreDistribution: {
            ranges: [
              { range: '90-100', count: 3, teams: ['Team Alpha', 'Team Beta', 'Team Gamma'] },
              { range: '80-89', count: 5, teams: ['Team Delta', 'Team Epsilon', 'Team Zeta', 'Team Eta', 'Team Theta'] },
              { range: '70-79', count: 4, teams: ['Team Iota', 'Team Kappa', 'Team Lambda', 'Team Mu'] }
            ],
            totalTeams: 12
          }
        }
      };
      
      setWinners(mockWinners);
    } catch (error) {
      console.error('Error calculating winners:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const rounds = roundsData?.data?.rounds || [];

  /**
   * Handle round selection
   */
  const handleRoundSelect = (roundId) => {
    setSelectedRound(roundId);
    calculateWinners(roundId);
  };

  /**
   * Handle export results
   */
  const handleExportResults = () => {
    if (!winners) return;
    
    const data = {
      round: winners.round,
      winner: winners.winner,
      rankings: winners.rankings,
      statistics: winners.statistics,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results-${winners.round.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (roundsLoading) {
    return <LoadingSpinner text="Loading results..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-akademia-primary">
            Competition Results
          </h1>
          <p className="text-gray-600 mt-1">
            View winners and final rankings
          </p>
        </div>
        {winners && (
          <button
            onClick={handleExportResults}
            className="akademia-btn-outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </button>
        )}
      </div>

      {/* Round Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-akademia-primary mb-4">
          Select Round
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Closed Round</label>
            <select
              value={selectedRound || ''}
              onChange={(e) => handleRoundSelect(e.target.value)}
              className="form-select"
            >
              <option value="">Select a closed round...</option>
              {rounds.map((round) => (
                <option key={round._id} value={round._id}>
                  {round.name} - {formatDate(round.endDate)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedRound(null);
                setWinners(null);
              }}
              className="akademia-btn-outline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      {isCalculating && (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-akademia-primary mx-auto mb-4" />
          <p className="text-gray-600">Calculating results...</p>
        </div>
      )}

      {winners && !isCalculating && (
        <>
          {/* Winner Announcement */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-8 text-center text-white">
            <Trophy className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
            <h3 className="text-2xl font-semibold mb-4">{winners.winner.teamName}</h3>
            <p className="text-lg mb-2">Team #{winners.winner.teamNumber}</p>
            <p className="text-xl font-semibold">
              Final Score: {winners.winner.averageScore.toFixed(1)}%
            </p>
          </div>

          {/* Winner Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-akademia-primary mb-4">
              Winning Team Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Team Members</h4>
                <div className="space-y-2">
                  {winners.winner.members.map((member, index) => (
                    <div key={index} className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {member.name}
                        {member.role === 'leader' && (
                          <span className="ml-2 text-xs text-akademia-primary font-medium">
                            (Leader)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Score Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Score:</span>
                    <span className="text-sm font-medium">{winners.winner.totalScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Max Possible:</span>
                    <span className="text-sm font-medium">{winners.winner.maxPossibleScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Score:</span>
                    <span className="text-sm font-medium">{winners.winner.averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Judges:</span>
                    <span className="text-sm font-medium">{winners.winner.judgeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rankings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-akademia-primary mb-4">
              Final Rankings
            </h3>
            <div className="space-y-4">
              {winners.rankings.map((team, index) => (
                <div
                  key={team.teamId}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border',
                    index === 0 
                      ? 'border-yellow-300 bg-yellow-50' 
                      : index === 1 
                      ? 'border-gray-300 bg-gray-50'
                      : index === 2
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4',
                      index === 0 
                        ? 'bg-yellow-500' 
                        : index === 1 
                        ? 'bg-gray-500'
                        : index === 2
                        ? 'bg-orange-500'
                        : 'bg-akademia-primary'
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{team.teamName}</h4>
                      <p className="text-sm text-gray-500">Team #{team.teamNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-akademia-primary">
                      {team.averageScore.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {team.totalScore} / {winners.winner.maxPossibleScore} points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-akademia-primary mb-4">
                Competition Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Teams:</span>
                  <span className="text-sm font-medium">{winners.totalTeams}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Evaluated Teams:</span>
                  <span className="text-sm font-medium">{winners.evaluatedTeams}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Highest Score:</span>
                  <span className="text-sm font-medium">{winners.statistics.highestScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lowest Score:</span>
                  <span className="text-sm font-medium">{winners.statistics.lowestScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Score:</span>
                  <span className="text-sm font-medium">{winners.statistics.averageScore.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-akademia-primary mb-4">
                Score Distribution
              </h3>
              <div className="space-y-3">
                {winners.statistics.scoreDistribution.ranges.map((range, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{range.range}:</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-akademia-primary h-2 rounded-full"
                          style={{ width: `${(range.count / winners.statistics.scoreDistribution.totalTeams) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{range.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedRound && !isCalculating && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Round
          </h3>
          <p className="text-gray-500">
            Choose a closed round to view the results and winners.
          </p>
        </div>
      )}
    </div>
  );
};

export default WinnerDisplay;
