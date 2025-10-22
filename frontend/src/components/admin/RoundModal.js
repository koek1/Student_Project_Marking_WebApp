import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { X, Calendar, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { roundsAPI, criteriaAPI } from '../../services/api';
import { cn } from '../../utils/helpers';

// Round Create/Edit Modal component - Handles round creation and editing with criteria selection
const RoundModal = ({ isOpen, onClose, round = null, mode = 'create' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      criteria: []
    }
  });

  // Fetch active criteria - Fetches the active criteria from the database
  const { data: criteriaData } = useQuery(
    'activeCriteria',
    () => criteriaAPI.getCriteria({ isActive: true, limit: 100 }),
    { enabled: isOpen }
  );

  const criteria = criteriaData?.data?.criteria || [];

  // Create/Update round mutation - Handles the creation and updating of rounds
  const roundMutation = useMutation(
    (data) => {
      if (mode === 'create') {
        return roundsAPI.createRound(data);
      } else {
        return roundsAPI.updateRound(round._id, data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rounds');
        toast.success(`Round ${mode === 'create' ? 'created' : 'updated'} successfully`);
        onClose();
        reset();
        setSelectedCriteria([]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || `Failed to ${mode} round`);
      }
    }
  );

  // Initialize form with round data for edit mode - Initializes the form with the round data for edit mode
  useEffect(() => {
    if (isOpen && round && mode === 'edit') {
      reset({
        name: round.name,
        description: round.description,
        startDate: round.startDate ? new Date(round.startDate).toISOString().slice(0, 16) : '',
        endDate: round.endDate ? new Date(round.endDate).toISOString().slice(0, 16) : '',
        criteria: round.criteria?.map(c => c._id) || []
      });
      setSelectedCriteria(round.criteria || []);
    } else if (isOpen && mode === 'create') {
      reset({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        criteria: []
      });
      setSelectedCriteria([]);
    }
  }, [isOpen, round, mode, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (endDate <= startDate) {
        toast.error('End date must be after start date');
        setIsSubmitting(false);
        return;
      }

      // Validate criteria selection
      if (selectedCriteria.length === 0) {
        toast.error('Please select at least one criteria');
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        ...data,
        criteria: selectedCriteria.map(c => c._id)
      };

      await roundMutation.mutateAsync(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle criteria selection
   */
  const handleCriteriaToggle = (criteria) => {
    const isSelected = selectedCriteria.some(c => c._id === criteria._id);
    
    if (isSelected) {
      setSelectedCriteria(prev => prev.filter(c => c._id !== criteria._id));
    } else {
      setSelectedCriteria(prev => [...prev, criteria]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-akademia-primary">
            {mode === 'create' ? 'Create New Round' : 'Edit Round'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Round Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Round Name *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('name', {
                    required: 'Round name is required',
                    minLength: {
                      value: 3,
                      message: 'Name must be at least 3 characters'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Name cannot exceed 100 characters'
                    }
                  })}
                  type="text"
                  className={cn(
                    'form-input pl-10',
                    errors.name && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="Enter round name"
                />
              </div>
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Description</label>
              <input
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'Description cannot exceed 500 characters'
                  }
                })}
                type="text"
                className={cn(
                  'form-input',
                  errors.description && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter round description (optional)"
              />
              {errors.description && (
                <p className="form-error">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Start Date *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('startDate', {
                    required: 'Start date is required'
                  })}
                  type="datetime-local"
                  className={cn(
                    'form-input pl-10',
                    errors.startDate && 'border-red-500 focus:ring-red-500'
                  )}
                />
              </div>
              {errors.startDate && (
                <p className="form-error">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">End Date *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('endDate', {
                    required: 'End date is required'
                  })}
                  type="datetime-local"
                  className={cn(
                    'form-input pl-10',
                    errors.endDate && 'border-red-500 focus:ring-red-500'
                  )}
                />
              </div>
              {errors.endDate && (
                <p className="form-error">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Criteria Selection */}
          <div>
            <label className="form-label">Evaluation Criteria *</label>
            <p className="text-sm text-gray-500 mb-4">
              Select the criteria that will be used to evaluate teams in this round
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {criteria.map((item) => {
                const isSelected = selectedCriteria.some(c => c._id === item._id);
                
                return (
                  <div
                    key={item._id}
                    onClick={() => handleCriteriaToggle(item)}
                    className={cn(
                      'p-3 border rounded-lg cursor-pointer transition-colors duration-200',
                      isSelected
                        ? 'border-akademia-primary bg-akademia-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {isSelected ? (
                          <CheckCircle className="h-5 w-5 text-akademia-primary" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {item.maxScore} pts
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.description}
                        </p>
                        <div className="flex items-center mt-2">
                          <Target className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            Weight: {(item.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedCriteria.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                Please select at least one criteria
              </p>
            )}
            
            {selectedCriteria.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Selected criteria ({selectedCriteria.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCriteria.map((item) => (
                    <span
                      key={item._id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-akademia-primary text-white"
                    >
                      {item.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCriteriaToggle(item);
                        }}
                        className="ml-1 hover:text-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-akademia-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-akademia-primary mb-3">
              Round Preview
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {watch('name') || 'Round name'}</p>
              <p><strong>Description:</strong> {watch('description') || 'No description'}</p>
              <p><strong>Start Date:</strong> {watch('startDate') || 'Not set'}</p>
              <p><strong>End Date:</strong> {watch('endDate') || 'Not set'}</p>
              <p><strong>Criteria:</strong> {selectedCriteria.length} selected</p>
              {selectedCriteria.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600">Selected criteria:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCriteria.map((item) => (
                      <span
                        key={item._id}
                        className="text-xs bg-white px-2 py-1 rounded border"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-akademia-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'akademia-btn-primary',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </div>
              ) : (
                mode === 'create' ? 'Create Round' : 'Update Round'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoundModal;