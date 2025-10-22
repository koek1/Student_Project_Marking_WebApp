import React from 'react';
import { X, User, Mail, Calendar, Building, Briefcase, Clock, Shield } from 'lucide-react';
import { formatDate, cn } from '../../utils/helpers';

/**
 * User View Modal component - Display user details
 */
const UserViewModal = ({ isOpen, onClose, user = null }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-akademia-primary">
            User Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  )}>
                    {user.role === 'admin' ? 'Administrator' : 'Judge'}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  )}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Judge Information */}
          {user.role === 'judge' && user.judgeInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">Judge Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.judgeInfo.company || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.judgeInfo.position || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.judgeInfo.experience || 0} years
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                  </p>
                </div>
              </div>

              {user.createdBy && (
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Created By</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.createdBy.username}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="akademia-btn-outline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;
