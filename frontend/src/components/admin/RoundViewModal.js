import React from 'react';
import { X, Calendar, Clock, Target, Users, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate, formatNumber } from '../../utils/helpers';

// Round View Modal component - Displays detailed information about a round
const RoundViewModal = ({ isOpen, onClose, round }) => {
  if (!isOpen || !round) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Modal Header - Displays the round name and close button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-akademia-primary mr-3" />
            <h3 className="text-lg font-semibold text-akademia-primary">
              {round.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body - Displays the basic information, date information, criteria information, progress information, and statistics */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-akademia-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-akademia-primary mb-3">
              Round Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-sm text-gray-900 mt-1">
                  {round.description || 'No description provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    round.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {round.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    round.isOpen 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {round.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="bg-akademia-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-akademia-primary mb-3">
              Schedule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-akademia-primary mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(round.startDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-akademia-secondary mr-2" />
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(round.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Information */}
          <div className="bg-akademia-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-akademia-primary mb-3">
              Evaluation Criteria
            </h4>
            <div className="flex items-center mb-3">
              <Target className="h-5 w-5 text-akademia-primary mr-2" />
              <span className="text-sm text-gray-600">
                {round.criteria?.length || 0} criteria selected
              </span>
            </div>
            
            {round.criteria && round.criteria.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {round.criteria.map((criteria) => (
                  <div key={criteria._id} className="bg-white rounded p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-900">
                        {criteria.name}
                      </h5>
                      <span className="text-xs text-gray-500">
                        {criteria.maxScore} pts
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {criteria.description}
                    </p>
                    <div className="flex items-center mt-2">
                      <BarChart3 className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        Weight: {(criteria.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No criteria assigned</p>
            )}
          </div>

          {/* Progress Information */}
          <div className="bg-akademia-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-akademia-primary mb-3">
              Progress
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {round.completionPercentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-akademia-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${round.completionPercentage || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-akademia-primary mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Total Teams</p>
                    <p className="text-sm text-gray-900">
                      {formatNumber(round.totalTeams || 0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Completed Evaluations</p>
                    <p className="text-sm text-gray-900">
                      {formatNumber(round.completedEvaluations || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Round Statistics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-900">{formatDate(round.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 text-gray-900">{formatDate(round.updatedAt)}</span>
              </div>
              {round.createdBy && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Created By:</span>
                  <span className="ml-2 text-gray-900">{round.createdBy.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-akademia-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundViewModal;