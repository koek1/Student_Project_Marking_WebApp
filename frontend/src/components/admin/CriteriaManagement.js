import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { criteriaAPI } from '../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatNumber, cn } from '../utils/helpers';
import { VALIDATION_RULES } from '../utils/constants';

/**
 * Criteria Management component for admin
 * Handles CRUD operations for evaluation criteria
 */
const CriteriaManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Fetch criteria data
  const { data: criteriaData, isLoading } = useQuery(
    ['criteria', currentPage, pageSize, searchTerm, filterStatus],
    () => criteriaAPI.getCriteria({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      isActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
    }),
    { keepPreviousData: true }
  );

  // Toggle status mutation
  const toggleStatusMutation = useMutation(
    ({ criteriaId, isActive }) => 
      criteriaAPI.toggleCriteriaStatus(criteriaId, isActive),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('criteria');
        toast.success('Criteria status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update criteria status');
      }
    }
  );

  // Delete criteria mutation
  const deleteCriteriaMutation = useMutation(
    (criteriaId) => criteriaAPI.deleteCriteria(criteriaId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('criteria');
        toast.success('Criteria deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete criteria');
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
   * Handle toggle status
   */
  const handleToggleStatus = (criteriaId, currentStatus) => {
    toggleStatusMutation.mutate({
      criteriaId,
      isActive: !currentStatus
    });
  };

  /**
   * Handle delete criteria
   */
  const handleDeleteCriteria = (criteriaId) => {
    if (window.confirm('Are you sure you want to delete this criteria? This action cannot be undone.')) {
      deleteCriteriaMutation.mutate(criteriaId);
    }
  };

  /**
   * Handle view criteria details
   */
  const handleViewCriteria = (criteria) => {
    setSelectedCriteria(criteria);
    setIsViewModalOpen(true);
  };

  /**
   * Handle edit criteria
   */
  const handleEditCriteria = (criteria) => {
    setSelectedCriteria(criteria);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading criteria..." />;
  }

  const criteria = criteriaData?.data?.criteria || [];
  const pagination = criteriaData?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-akademia-primary">
            Criteria Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage evaluation criteria and marking guides
          </p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="akademia-btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Criteria
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Search Criteria</label>
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
              <option value="all">All Criteria</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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

      {/* Criteria Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="akademia-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Max Score</th>
                <th>Weight</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-akademia-primary mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">ID: {item._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm text-gray-900 max-w-xs truncate">
                      {item.description}
                    </p>
                  </td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-akademia-primary text-white">
                      {item.maxScore} points
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {(item.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">
                        {formatNumber(item.usageCount)} times
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(item._id, item.isActive)}
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        item.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}
                    >
                      {item.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <span className="text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCriteria(item)}
                        className="p-1 text-gray-400 hover:text-akademia-primary"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditCriteria(item)}
                        className="p-1 text-gray-400 hover:text-akademia-secondary"
                        title="Edit Criteria"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCriteria(item._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete Criteria"
                        disabled={item.usageCount > 0}
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
      {criteria.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No criteria found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first evaluation criteria.'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="akademia-btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Criteria
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CriteriaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
      
      <CriteriaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        criteria={selectedCriteria}
        mode="edit"
      />

      <CriteriaViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        criteria={selectedCriteria}
      />
    </div>
  );
};

export default CriteriaManagement;