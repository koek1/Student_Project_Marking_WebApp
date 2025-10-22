import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { assignmentAPI, teamsAPI, authAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatNumber, cn } from '../../utils/helpers';

/**
 * Judge Assignment component for admin
 * Handles the complex algorithm for assigning judges to teams
 */
const JudgeAssignment = () => {
  const [selectedRound, setSelectedRound] = useState(null);
  const [assignmentResults, setAssignmentResults] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const queryClient = useQueryClient();

  // Fetch teams data
  const { data: teamsData, isLoading: teamsLoading } = useQuery(
    'participatingTeams',
    () => teamsAPI.getTeams({ isParticipating: true, limit: 100 }),
    { enabled: !!selectedRound }
  );

  // Fetch judges data
  const { data: judgesData, isLoading: judgesLoading } = useQuery(
    'activeJudges',
    () => authAPI.getUsers({ role: 'judge', isActive: true, limit: 100 }),
    { enabled: !!selectedRound }
  );

  // Fetch assignment stats
  const { data: assignmentStats, isLoading: statsLoading } = useQuery(
    ['assignmentStats', selectedRound],
    () => assignmentAPI.getAssignmentStats(selectedRound),
    { 
      enabled: !!selectedRound,
      refetchInterval: 30000
    }
  );

  // Assign judges mutation
  const assignJudgesMutation = useMutation(
    (roundId) => assignmentAPI.assignJudges(roundId),
    {
      onSuccess: (response) => {
        setAssignmentResults(response.data);
        queryClient.invalidateQueries('teams');
        queryClient.invalidateQueries('assignmentStats');
        toast.success('Judges assigned successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to assign judges');
      },
      onSettled: () => {
        setIsAssigning(false);
      }
    }
  );

  // Optimize assignments mutation
  const optimizeMutation = useMutation(
    (roundId) => assignmentAPI.optimizeAssignments(roundId),
    {
      onSuccess: (response) => {
        setAssignmentResults(response.data);
        queryClient.invalidateQueries('teams');
        queryClient.invalidateQueries('assignmentStats');
        toast.success('Assignments optimized successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to optimize assignments');
      },
      onSettled: () => {
        setIsOptimizing(false);
      }
    }
  );

  /**
   * Handle assign judges
   */
  const handleAssignJudges = () => {
    if (!selectedRound) {
      toast.error('Please select a round first');
      return;
    }

    if (window.confirm('This will assign judges to all participating teams. Continue?')) {
      setIsAssigning(true);
      assignJudgesMutation.mutate(selectedRound);
    }
  };

  /**
   * Handle optimize assignments
   */
  const handleOptimizeAssignments = () => {
    if (!selectedRound) {
      toast.error('Please select a round first');
      return;
    }

    if (window.confirm('This will optimize the current judge assignments. Continue?')) {
      setIsOptimizing(true);
      optimizeMutation.mutate(selectedRound);
    }
  };

  const teams = teamsData?.data?.teams || [];
  const judges = judgesData?.data?.users || [];
  const stats = assignmentStats?.data?.stats;

  const isLoading = teamsLoading || judgesLoading || statsLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-akademia-primary">
            Judge Assignment
          </h1>
          <p className="text-gray-600 mt-1">
            Automatically assign judges to teams using advanced algorithms
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
              onChange={(e) => setSelectedRound(e.target.value)}
              className="form-select"
            >
              <option value="">Select a round...</option>
              <option value="round1">Round 1 - Initial Evaluation</option>
              <option value="round2">Round 2 - Final Evaluation</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedRound(null);
                setAssignmentResults(null);
              }}
              className="akademia-btn-outline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      {selectedRound && (
        <>
          {/* Assignment Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Teams</p>
                    <p className="text-2xl font-bold text-akademia-primary">
                      {formatNumber(stats.totalTeams)}
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
                    <p className="text-sm font-medium text-gray-600">Available Judges</p>
                    <p className="text-2xl font-bold text-akademia-primary">
                      {formatNumber(stats.totalJudges)}
                    </p>
                  </div>
                  <div className="stat-card-icon secondary">
                    <UserCheck className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Teams with Judges</p>
                    <p className="text-2xl font-bold text-akademia-primary">
                      {formatNumber(stats.teamsWithJudges)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {stats.totalTeams > 0 
                        ? `${Math.round((stats.teamsWithJudges / stats.totalTeams) * 100)}% coverage`
                        : '0% coverage'
                      }
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
                    <p className="text-sm font-medium text-gray-600">Avg. Teams per Judge</p>
                    <p className="text-2xl font-bold text-akademia-primary">
                      {formatNumber(stats.averageJudgesPerTeam)}
                    </p>
                  </div>
                  <div className="stat-card-icon warning">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-akademia-primary mb-4">
              Assignment Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Automatic Assignment
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Use the advanced algorithm to automatically assign judges to teams based on workload balancing and optimal distribution.
                  </p>
                  <button
                    onClick={handleAssignJudges}
                    disabled={isAssigning || isOptimizing}
                    className={cn(
                      'akademia-btn-primary w-full',
                      (isAssigning || isOptimizing) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isAssigning ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Assigning Judges...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Play className="h-4 w-4 mr-2" />
                        Assign Judges
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Optimize Assignments
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Optimize existing assignments to better balance workload and improve distribution.
                  </p>
                  <button
                    onClick={handleOptimizeAssignments}
                    disabled={isAssigning || isOptimizing}
                    className={cn(
                      'akademia-btn-secondary w-full',
                      (isAssigning || isOptimizing) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isOptimizing ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Optimizing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Optimize Assignments
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Results */}
          {assignmentResults && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-akademia-primary mb-4">
                Assignment Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-akademia-primary">
                    {assignmentResults.stats?.totalTeams || 0}
                  </div>
                  <div className="text-sm text-gray-600">Teams Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-akademia-secondary">
                    {assignmentResults.stats?.averageTeamsPerJudge?.toFixed(1) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Teams per Judge</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {assignmentResults.stats?.utilizationRate ? 
                      `${(assignmentResults.stats.utilizationRate * 100).toFixed(1)}%` : '0%'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Utilization Rate</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">
                  Team Assignments
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned Judges
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Judge Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignmentResults.assignments?.map((assignment) => (
                        <tr key={assignment.teamId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {assignment.teamName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Team #{assignment.teamNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {assignment.assignedJudges.map((judge) => (
                                <span
                                  key={judge.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-akademia-primary text-white"
                                >
                                  {judge.username}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assignment.assignedJudges.length}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Judge Workload Distribution */}
          {stats && stats.judgeWorkload && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-akademia-primary mb-4">
                Judge Workload Distribution
              </h3>
              
              <div className="space-y-4">
                {stats.judgeWorkload.map((judge) => (
                  <div key={judge.judgeId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <UserCheck className="h-5 w-5 text-akademia-primary mr-2" />
                        <span className="font-medium text-gray-900">
                          {judge.judgeName}
                        </span>
                      </div>
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        judge.teamCount > 5 
                          ? 'bg-red-100 text-red-800'
                          : judge.teamCount > 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      )}>
                        {judge.teamCount} teams
                      </span>
                    </div>
                    
                    {judge.teams.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Assigned Teams:</p>
                        <div className="flex flex-wrap gap-2">
                          {judge.teams.map((team) => (
                            <span
                              key={team.teamId}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                            >
                              {team.teamName} (#{team.teamNumber})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Algorithm Information */}
          <div className="bg-akademia-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-akademia-primary mb-4">
              Algorithm Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Assignment Strategy
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Balances workload across all judges</li>
                  <li>• Ensures each team gets 2-3 judges</li>
                  <li>• Considers 20-minute presentation time</li>
                  <li>• Optimizes for 4-hour evaluation window</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Constraints
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Maximum 15 teams per round</li>
                  <li>• 12-20 judges available</li>
                  <li>• Minimum 20 minutes per presentation</li>
                  <li>• Maximum 3 judges per team</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <LoadingSpinner text="Loading assignment data..." />
        </div>
      )}

      {/* Empty State */}
      {!selectedRound && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a Round
          </h3>
          <p className="text-gray-500">
            Choose a round to view and manage judge assignments.
          </p>
        </div>
      )}
    </div>
  );
};

export default JudgeAssignment;