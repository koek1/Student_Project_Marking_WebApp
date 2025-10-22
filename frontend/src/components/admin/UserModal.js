import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { X, User, Mail, Lock, Building, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { USER_ROLES, VALIDATION_RULES } from '../../utils/constants';
import { cn } from '../../utils/helpers';

/**
 * User Create/Edit Modal component
 */
const UserModal = ({ isOpen, onClose, user = null, mode = 'create' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: 'judge',
      judgeInfo: {
        company: '',
        position: '',
        experience: 0
      }
    }
  });

  const selectedRole = watch('role');

  // Create/Update user mutation
  const userMutation = useMutation(
    (data) => {
      if (mode === 'create') {
        return authAPI.register(data);
      } else {
        return authAPI.updateProfile(data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success(`User ${mode === 'create' ? 'created' : 'updated'} successfully`);
        onClose();
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || `Failed to ${mode} user`);
      }
    }
  );

  // Initialize form with user data for edit mode
  useEffect(() => {
    if (isOpen && user && mode === 'edit') {
      reset({
        username: user.username,
        email: user.email,
        password: '', // Don't pre-fill password
        role: user.role,
        judgeInfo: user.judgeInfo || {
          company: '',
          position: '',
          experience: 0
        }
      });
    } else if (isOpen && mode === 'create') {
      reset({
        username: '',
        email: '',
        password: '',
        role: 'judge',
        judgeInfo: {
          company: '',
          position: '',
          experience: 0
        }
      });
    }
  }, [isOpen, user, mode, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Remove password from data if editing and password is empty
      if (mode === 'edit' && !data.password) {
        delete data.password;
      }

      // Remove judgeInfo if role is admin
      if (data.role === 'admin') {
        delete data.judgeInfo;
      }

      await userMutation.mutateAsync(data);
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
            {mode === 'create' ? 'Create New User' : 'Edit User'}
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Username *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: VALIDATION_RULES.USERNAME_MIN_LENGTH,
                      message: `Username must be at least ${VALIDATION_RULES.USERNAME_MIN_LENGTH} characters`
                    },
                    maxLength: {
                      value: VALIDATION_RULES.USERNAME_MAX_LENGTH,
                      message: `Username cannot exceed ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters`
                    }
                  })}
                  type="text"
                  className={cn(
                    'form-input pl-10',
                    errors.username && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="Enter username"
                />
              </div>
              {errors.username && (
                <p className="form-error">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className={cn(
                    'form-input pl-10',
                    errors.email && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="form-label">Password {mode === 'create' ? '*' : '(leave blank to keep current)'}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register('password', {
                  required: mode === 'create' ? 'Password is required' : false,
                  minLength: {
                    value: VALIDATION_RULES.PASSWORD_MIN_LENGTH,
                    message: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`
                  }
                })}
                type="password"
                className={cn(
                  'form-input pl-10',
                  errors.password && 'border-red-500 focus:ring-red-500'
                )}
                placeholder={mode === 'create' ? 'Enter password' : 'Enter new password (optional)'}
              />
            </div>
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Role *</label>
            <select
              {...register('role', {
                required: 'Role is required'
              })}
              className={cn(
                'form-select',
                errors.role && 'border-red-500 focus:ring-red-500'
              )}
            >
              <option value="admin">Administrator</option>
              <option value="judge">Judge</option>
            </select>
            {errors.role && (
              <p className="form-error">{errors.role.message}</p>
            )}
          </div>

          {/* Judge Information */}
          {selectedRole === 'judge' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">Judge Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Company *</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register('judgeInfo.company', {
                        required: selectedRole === 'judge' ? 'Company is required' : false,
                        maxLength: {
                          value: 100,
                          message: 'Company name cannot exceed 100 characters'
                        }
                      })}
                      type="text"
                      className={cn(
                        'form-input pl-10',
                        errors.judgeInfo?.company && 'border-red-500 focus:ring-red-500'
                      )}
                      placeholder="Enter company name"
                    />
                  </div>
                  {errors.judgeInfo?.company && (
                    <p className="form-error">{errors.judgeInfo.company.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Position *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register('judgeInfo.position', {
                        required: selectedRole === 'judge' ? 'Position is required' : false,
                        maxLength: {
                          value: 100,
                          message: 'Position cannot exceed 100 characters'
                        }
                      })}
                      type="text"
                      className={cn(
                        'form-input pl-10',
                        errors.judgeInfo?.position && 'border-red-500 focus:ring-red-500'
                      )}
                      placeholder="Enter position"
                    />
                  </div>
                  {errors.judgeInfo?.position && (
                    <p className="form-error">{errors.judgeInfo.position.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Years of Experience</label>
                  <input
                    {...register('judgeInfo.experience', {
                      min: {
                        value: 0,
                        message: 'Experience cannot be negative'
                      },
                      max: {
                        value: 50,
                        message: 'Experience cannot exceed 50 years'
                      }
                    })}
                    type="number"
                    min="0"
                    max="50"
                    className={cn(
                      'form-input',
                      errors.judgeInfo?.experience && 'border-red-500 focus:ring-red-500'
                    )}
                    placeholder="Enter years of experience"
                  />
                  {errors.judgeInfo?.experience && (
                    <p className="form-error">{errors.judgeInfo.experience.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

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
                mode === 'create' ? 'Create User' : 'Update User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
