import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { X, Target, FileText, BarChart3, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { criteriaAPI } from '../../services/api';
import { VALIDATION_RULES } from '../../utils/constants';
import { cn } from '../../utils/helpers';

// Criteria Create/Edit Modal component - Handles criteria creation and editing with marking guide
const CriteriaModal = ({ isOpen, onClose, criteria = null, mode = 'create' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      maxScore: 100,
      weight: 1.0,
      markingGuide: ''
    }
  });

  // Create/Update criteria mutation - Handles the creation and updating of criteria
  const criteriaMutation = useMutation(
    (data) => {
      if (mode === 'create') {
        return criteriaAPI.createCriteria(data);
      } else {
        return criteriaAPI.updateCriteria(criteria._id, data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('criteria');
        toast.success(`Criteria ${mode === 'create' ? 'created' : 'updated'} successfully`);
        onClose();
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || `Failed to ${mode} criteria`);
      }
    }
  );

  // Initialize form with criteria data for edit mode
  useEffect(() => {
    if (isOpen && criteria && mode === 'edit') {
      reset({
        name: criteria.name,
        description: criteria.description,
        maxScore: criteria.maxScore,
        weight: criteria.weight,
        markingGuide: criteria.markingGuide
      });
    } else if (isOpen && mode === 'create') {
      reset({
        name: '',
        description: '',
        maxScore: 100,
        weight: 1.0,
        markingGuide: ''
      });
    }
  }, [isOpen, criteria, mode, reset]);

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      await criteriaMutation.mutateAsync(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-akademia-primary">
            {mode === 'create' ? 'Create New Criteria' : 'Edit Criteria'}
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
          {/* Criteria Name */}
          <div>
            <label className="form-label">Criteria Name *</label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register('name', {
                  required: 'Criteria name is required',
                  minLength: {
                    value: VALIDATION_RULES.TEAM_NAME_MIN_LENGTH,
                    message: `Name must be at least ${VALIDATION_RULES.TEAM_NAME_MIN_LENGTH} characters`
                  },
                  maxLength: {
                    value: VALIDATION_RULES.TEAM_NAME_MAX_LENGTH,
                    message: `Name cannot exceed ${VALIDATION_RULES.TEAM_NAME_MAX_LENGTH} characters`
                  }
                })}
                type="text"
                className={cn(
                  'form-input pl-10',
                  errors.name && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter criteria name"
              />
            </div>
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            <textarea
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters'
                },
                maxLength: {
                  value: 500,
                  message: 'Description cannot exceed 500 characters'
                }
              })}
              rows={3}
              className={cn(
                'form-textarea',
                errors.description && 'border-red-500 focus:ring-red-500'
              )}
              placeholder="Enter detailed description of what this criteria evaluates"
            />
            {errors.description && (
              <p className="form-error">{errors.description.message}</p>
            )}
          </div>

          {/* Max Score and Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Maximum Score *</label>
              <div className="relative">
                <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('maxScore', {
                    required: 'Maximum score is required',
                    min: {
                      value: 1,
                      message: 'Maximum score must be at least 1'
                    },
                    max: {
                      value: VALIDATION_RULES.MAX_SCORE,
                      message: `Maximum score cannot exceed ${VALIDATION_RULES.MAX_SCORE}`
                    }
                  })}
                  type="number"
                  className={cn(
                    'form-input pl-10',
                    errors.maxScore && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="Enter maximum score"
                />
              </div>
              {errors.maxScore && (
                <p className="form-error">{errors.maxScore.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Weight (0.0 - 1.0) *</label>
              <input
                {...register('weight', {
                  required: 'Weight is required',
                  min: {
                    value: 0,
                    message: 'Weight must be at least 0'
                  },
                  max: {
                    value: 1,
                    message: 'Weight cannot exceed 1'
                  }
                })}
                type="number"
                step="0.1"
                min="0"
                max="1"
                className={cn(
                  'form-input',
                  errors.weight && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter weight (0.0 - 1.0)"
              />
              {errors.weight && (
                <p className="form-error">{errors.weight.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Weight determines the importance of this criteria in overall scoring
              </p>
            </div>
          </div>

          {/* Marking Guide */}
          <div>
            <label className="form-label">Marking Guide *</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                {...register('markingGuide', {
                  required: 'Marking guide is required',
                  minLength: {
                    value: 20,
                    message: 'Marking guide must be at least 20 characters'
                  },
                  maxLength: {
                    value: 2000,
                    message: 'Marking guide cannot exceed 2000 characters'
                  }
                })}
                rows={6}
                className={cn(
                  'form-textarea pl-10',
                  errors.markingGuide && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter detailed marking guide for judges. Include specific criteria, examples, and what to look for at different score levels..."
              />
            </div>
            {errors.markingGuide && (
              <p className="form-error">{errors.markingGuide.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Provide clear guidelines for judges on how to evaluate this criteria. Include examples and specific indicators for different score levels.
            </p>
          </div>

          {/* Preview Section */}
          <div className="bg-akademia-light rounded-lg p-4">
            <h4 className="text-sm font-medium text-akademia-primary mb-2">
              Preview
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {watch('name') || 'Criteria name'}</p>
              <p><strong>Description:</strong> {watch('description') || 'Criteria description'}</p>
              <p><strong>Max Score:</strong> {watch('maxScore') || 100} points</p>
              <p><strong>Weight:</strong> {((watch('weight') || 1) * 100).toFixed(0)}%</p>
              <p><strong>Marking Guide:</strong></p>
              <div className="bg-white rounded p-2 text-xs text-gray-700 max-h-20 overflow-y-auto">
                {watch('markingGuide') || 'Marking guide will appear here...'}
              </div>
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
                mode === 'create' ? 'Create Criteria' : 'Update Criteria'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriteriaModal;