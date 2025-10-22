import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck, 
  UserX,
  Users,
  Calendar,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { teamsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatNumber, cn } from '../../utils/helpers';
import { TEAM_MEMBER_ROLE_LABELS } from '../../utils/constants';

// Team Management component for admin - Handles CRUD operations for teams
const TeamManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Fetch teams data
  const { data: teamsData, isLoading } = useQuery(
    ['teams', currentPage, pageSize, searchTerm, filterStatus],
    () => teamsAPI.getTeams({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      isParticipating: filterStatus === 'all' ? undefined : filterStatus === 'participating'
    }),
    { keepPreviousData: true }
  );

  // Toggle participation mutation
  const toggleParticipationMutation = useMutation(
    ({ teamId, isParticipating }) => 
      teamsAPI.toggleParticipation(teamId, isParticipating),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teams');
        toast.success('Team participation updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update participation');
      }
    }
  );

  // Delete team mutation
  const deleteTeamMutation = useMutation(
    (teamId) => teamsAPI.deleteTeam(teamId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teams');
        toast.success('Team deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete team');
      }
    }
  );

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  // Handle toggle participation
  const handleToggleParticipation = (teamId, currentStatus) => {
    toggleParticipationMutation.mutate({
      teamId,
      isParticipating: !currentStatus
    });
  };

  // Handle delete team
  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  // Handle view team details
  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setIsViewModalOpen(true);
  };

  // Handle edit team
  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading teams..." />;
  }

  const teams = teamsData?.data?.teams || [];
  const pagination = teamsData?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-akademia-primary">
            Team Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage project teams and their participation
          </p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="akademia-btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Search Teams</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by team name, project title, or member name..."
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="all">All Teams</option>
              <option value="participating">Participating</option>
              <option value="not-participating">Not Participating</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Page Size</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="form-select"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="akademia-table">
            <thead>
              <tr>
                <th>Team #</th>
                <th>Team Name</th>
                <th>Project Title</th>
                <th>Members</th>
                <th>Judges</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team._id}>
                  <td className="font-medium text-akademia-primary">
                    #{team.teamNumber}
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{team.teamName}</p>
                      <p className="text-sm text-gray-500">{team.projectDescription}</p>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm text-gray-900">{team.projectTitle}</p>
                  </td>
                  <td>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {team.members.length} members
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Leader: {team.members.find(m => m.role === 'leader')?.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-1">
                      <UserCheck className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {team.assignedJudges.length} judges
                      </span>
                    </div>
                    {team.assignedJudges.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {team.assignedJudges.slice(0, 2).map(judge => judge.username).join(', ')}
                        {team.assignedJudges.length > 2 && '...'}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleParticipation(team._id, team.isParticipating)}
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        team.isParticipating
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}
                    >
                      {team.isParticipating ? 'Participating' : 'Not Participating'}
                    </button>
                  </td>
                  <td>
                    <span className="text-sm text-gray-500">
                      {formatDate(team.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewTeam(team)}
                        className="p-1 text-gray-400 hover:text-akademia-primary"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditTeam(team)}
                        className="p-1 text-gray-400 hover:text-akademia-secondary"
                        title="Edit Team"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTeam(team._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete Team"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No teams found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first team.'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="akademia-btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamManagement;