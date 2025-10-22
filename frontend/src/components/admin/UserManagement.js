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
  Shield,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatNumber, cn } from '../../utils/helpers';
import { USER_ROLES, USER_ROLE_LABELS } from '../../utils/constants';

// User Management component for admin - Handles CRUD operations for users (admins and judges)
const UserManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Fetch users data - Fetches the users data from the database
  const { data: usersData, isLoading } = useQuery(
    ['users', currentPage, pageSize, searchTerm, filterRole, filterStatus],
    () => authAPI.getUsers({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      role: filterRole === 'all' ? undefined : filterRole,
      isActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
    }),
    { keepPreviousData: true }
  );

  // Toggle user status mutation - Toggles the user status in the database
  const toggleStatusMutation = useMutation(
    ({ userId, isActive }) => 
      authAPI.toggleUserStatus(userId, isActive),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user status');
      }
    }
  );

  // Handle search - Handles the search for users
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter change - Handles the filter change for users
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'role') {
      setFilterRole(value);
    } else if (filterType === 'status') {
      setFilterStatus(value);
    }
    setCurrentPage(1);
  };

  // Handle toggle status - Handles the toggle status for users
  const handleToggleStatus = (userId, currentStatus) => {
    toggleStatusMutation.mutate({
      userId,
      isActive: !currentStatus
    });
  };

  // Handle view user details - Handles the view user details for users
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Handle edit user - Handles the edit user for users
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Page Header - Displays the page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-akademia-primary">
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage administrators and judges
          </p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="akademia-btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Search Users</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by username or email..."
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="form-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="judge">Judges</option>
            </select>
          </div>

          <div>
            <label className="form-label">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-select"
            >
              <option value="all">All Status</option>
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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="akademia-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Company/Position</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-akademia-primary rounded-full flex items-center justify-center text-white font-medium">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      {user.role === 'admin' ? (
                        <Shield className="h-4 w-4 text-akademia-primary mr-2" />
                      ) : (
                        <User className="h-4 w-4 text-akademia-secondary mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        {USER_ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </td>
                  <td>
                    {user.role === 'judge' && user.judgeInfo ? (
                      <div>
                        <p className="text-sm text-gray-900">{user.judgeInfo.company}</p>
                        <p className="text-xs text-gray-500">{user.judgeInfo.position}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}
                    >
                      {user.isActive ? (
                        <>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-1 text-gray-400 hover:text-akademia-primary"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-1 text-gray-400 hover:text-akademia-secondary"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
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
      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first user.'
            }
          </p>
          {(!searchTerm && filterRole === 'all' && filterStatus === 'all') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="akademia-btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <UserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
      
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        mode="edit"
      />

      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;