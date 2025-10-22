import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  Target,
  Users,
  CheckCircle,
  X,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { roundsAPI, criteriaAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatNumber, cn } from '../../utils/helpers';
import { ROUND_STATUS_LABELS } from '../../utils/constants';

// Round Management component for admin - Handles CRUD operations for evaluation rounds
const RoundManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Fetch rounds data - Fetches the rounds data from the database
  const { data: roundsData, isLoading } = useQuery(
    ['rounds', currentPage, pageSize, searchTerm, filterStatus],
    () => roundsAPI.getRounds({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      isActive: filterStatus === 'all' ? undefined : filterStatus === 'active',
      isOpen: filterStatus === 'all' ? undefined : filterStatus === 'open'
    }),
    { keepPreviousData: true }
  );

  // Close round mutation
  const closeRoundMutation = useMutation(
    (roundId) => roundsAPI.closeRound(roundId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rounds');
        toast.success('Round closed successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to close round');
      }
    }
  );

  // Reopen round mutation
  const reopenRoundMutation = useMutation(
    (roundId) => roundsAPI.reopenRound(roundId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rounds');
        toast.success('Round reopened successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reopen round');
      }
    }
  );

  // Delete round mutation
  const deleteRoundMutation = useMutation(
    (roundId) => roundsAPI.deleteRound(roundId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rounds');
        toast.success('Round deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete round');
      }
    }
  );

  /**
   * Handle search
   */
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  /**
   * Handle close round
   */
  const handleCloseRound = (roundId) => {
    if (window.confirm('Are you sure you want to close this round? This will prevent new scores from being submitted.')) {
      closeRoundMutation.mutate(roundId);
    }
  };

  /**
   * Handle reopen round
   */
  const handleReopenRound = (roundId) => {
    if (window.confirm('Are you sure you want to reopen this round? This will allow scores to be modified again.')) {
      reopenRoundMutation.mutate(roundId);
    }
  };

  /**
   * Handle delete round
   */
  const handleDeleteRound = (roundId) => {
    if (window.confirm('Are you sure you want to delete this round? This action cannot be undone.')) {
      deleteRoundMutation.mutate(roundId);
    }
  };

  /**
   * Handle view round details
   */
  const handleViewRound = (round) => {
    setSelectedRound(round);
    setIsViewModalOpen(true);
  };

  /**
   * Handle edit round
   */
  const handleEditRound = (round) => {
    setSelectedRound(round);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading rounds..." />;
  }

  const rounds = roundsData?.data?.rounds || [];
  const pagination = roundsData?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-akademia-primary">
            Round Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage evaluation rounds and criteria assignments
          </p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="akademia-btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Round
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Search Rounds</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name or description..."
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
              <option value="all">All Rounds</option>
              <option value="active">Active</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
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

      {/* Rounds Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="akademia-table">
            <thead>
              <tr>
                <th>Round Name</th>
                <th>Description</th>
                <th>Criteria</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((round) => (
                <tr key={round._id}>
                  <td>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-akademia-primary mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{round.name}</p>
                        <p className="text-sm text-gray-500">ID: {round._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm text-gray-900 max-w-xs truncate">
                      {round.description || '-'}
                    </p>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {round.criteria?.length || 0} criteria
                      </span>
                    </div>
                    {round.criteria && round.criteria.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {round.criteria.slice(0, 2).map(c => c.name).join(', ')}
                        {round.criteria.length > 2 && '...'}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {formatDate(round.startDate)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {formatDate(round.endDate)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col space-y-1">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        round.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}>
                        {round.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        round.isOpen
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      )}>
                        {round.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-akademia-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${round.completionPercentage || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {round.completionPercentage || 0}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {round.completedEvaluations || 0} / {round.totalTeams || 0} teams
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewRound(round)}
                        className="p-1 text-gray-400 hover:text-akademia-primary"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditRound(round)}
                        className="p-1 text-gray-400 hover:text-akademia-secondary"
                        title="Edit Round"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      {round.isOpen ? (
                        <button
                          onClick={() => handleCloseRound(round._id)}
                          className="p-1 text-gray-400 hover:text-orange-600"
                          title="Close Round"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReopenRound(round._id)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Reopen Round"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteRound(round._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete Round"
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
      {rounds.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No rounds found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first evaluation round.'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="akademia-btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Round
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <RoundModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
      
      <RoundModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        round={selectedRound}
        mode="edit"
      />

      <RoundViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        round={selectedRound}
      />
    </div>
  );
};

export default RoundManagement;