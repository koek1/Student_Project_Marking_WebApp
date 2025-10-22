import React from 'react';
import { X, Target, FileText, BarChart3, Calendar, User, TrendingUp } from 'lucide-react';
import { formatDate, formatNumber } from '../../utils/helpers';

// Criteria View Modal component - Displays detailed information about a criteria
const CriteriaViewModal = ({ isOpen, onClose, criteria }) => {
  if (!isOpen || !criteria) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        {/* Modal Header - Displays the criteria name and close button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-akademia-primary mr-3" />
            <h3 className="text-lg font-semibold text-akademia-primary">
              {criteria.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body - Displays the basic information, scoring information, usage statistics, marking guide, and metadata */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-akademia-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-akademia-primary mb-3">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-sm text-gray-900 mt-1">{criteria.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  criteria.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {criteria.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Scoring Information - Displays the maximum score and weight */}
          <div className="bg-akademia-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-akademia-primary mb-3">
              Scoring Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-akademia-primary mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Maximum Score</p>
                  <p className="text-lg font-semibold text-akademia-primary">
                    {criteria.maxScore} points
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-akademia-secondary mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="text-lg font-semibold text-akademia-secondary">
                    {(criteria.weight * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Statistics - Displays the number of times the criteria has been used and the date it was created */}
          <div className="bg-akademia-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-akademia-primary mb-3">
              Usage Statistics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Times Used</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatNumber(criteria.usageCount)} rounds
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm text-gray-900">
                  {formatDate(criteria.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Marking Guide - Displays the marking guide */}
          <div className="bg-akademia-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-akademia-primary mb-3">
              Marking Guide
            </h4>
            <div className="bg-white rounded p-4 border border-gray-200">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {criteria.markingGuide}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata - Displays the date it was created and last updated */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Additional Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-900">{formatDate(criteria.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 text-gray-900">{formatDate(criteria.updatedAt)}</span>
              </div>
              {criteria.createdBy && (
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Created By:</span>
                  <span className="ml-2 text-gray-900">{criteria.createdBy.username}</span>
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

export default CriteriaViewModal;