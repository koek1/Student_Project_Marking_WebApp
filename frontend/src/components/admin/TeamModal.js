import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { X, Plus, Trash2, User, Mail, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { teamsAPI } from '../../services/api';
import { TEAM_MEMBER_ROLES, VALIDATION_RULES } from '../../utils/constants';
import { cn } from '../../utils/helpers';

/**
 * Team Create/Edit Modal component
 */
const TeamModal = ({ isOpen, onClose, team = null, mode = 'create' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      teamName: '',
      teamNumber: '',
      projectTitle: '',
      projectDescription: '',
      members: [
        { name: '', studentNumber: '', email: '', role: 'leader' },
        { name: '', studentNumber: '', email: '', role: 'member' },
        { name: '', studentNumber: '', email: '', role: 'member' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members'
  });

  // Create/Update team mutation
  const teamMutation = useMutation(
    (data) => {
      if (mode === 'create') {
        return teamsAPI.createTeam(data);
      } else {
        return teamsAPI.updateTeam(team._id, data);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teams');
        toast.success(`Team ${mode === 'create' ? 'created' : 'updated'} successfully`);
        onClose();
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || `Failed to ${mode} team`);
      }
    }
  );

  // Initialize form with team data for edit mode
  useEffect(() => {
    if (isOpen && team && mode === 'edit') {
      reset({
        teamName: team.teamName,
        teamNumber: team.teamNumber,
        projectTitle: team.projectTitle,
        projectDescription: team.projectDescription,
        members: team.members.map(member => ({
          name: member.name,
          studentNumber: member.studentNumber,
          email: member.email,
          role: member.role
        }))
      });
    } else if (isOpen && mode === 'create') {
      reset({
        teamName: '',
        teamNumber: '',
        projectTitle: '',
        projectDescription: '',
        members: [
          { name: '', studentNumber: '', email: '', role: 'leader' },
          { name: '', studentNumber: '', email: '', role: 'member' },
          { name: '', studentNumber: '', email: '', role: 'member' }
        ]
      });
    }
  }, [isOpen, team, mode, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Validate that there's exactly one leader
      const leaders = data.members.filter(member => member.role === 'leader');
      if (leaders.length !== 1) {
        toast.error('Team must have exactly one leader');
        setIsSubmitting(false);
        return;
      }

      // Validate that all required fields are filled
      const incompleteMembers = data.members.filter(member => 
        !member.name || !member.studentNumber || !member.email
      );
      
      if (incompleteMembers.length > 0) {
        toast.error('All member fields are required');
        setIsSubmitting(false);
        return;
      }

      await teamMutation.mutateAsync(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Add new member
   */
  const addMember = () => {
    if (fields.length < VALIDATION_RULES.MAX_TEAM_MEMBERS) {
      append({ name: '', studentNumber: '', email: '', role: 'member' });
    }
  };

  /**
   * Remove member
   */
  const removeMember = (index) => {
    if (fields.length > VALIDATION_RULES.MIN_TEAM_MEMBERS) {
      remove(index);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-akademia-primary">
            {mode === 'create' ? 'Create New Team' : 'Edit Team'}
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
          {/* Team Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Team Name *</label>
              <input
                {...register('teamName', {
                  required: 'Team name is required',
                  minLength: {
                    value: VALIDATION_RULES.TEAM_NAME_MIN_LENGTH,
                    message: `Team name must be at least ${VALIDATION_RULES.TEAM_NAME_MIN_LENGTH} characters`
                  },
                  maxLength: {
                    value: VALIDATION_RULES.TEAM_NAME_MAX_LENGTH,
                    message: `Team name cannot exceed ${VALIDATION_RULES.TEAM_NAME_MAX_LENGTH} characters`
                  }
                })}
                type="text"
                className={cn(
                  'form-input',
                  errors.teamName && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter team name"
              />
              {errors.teamName && (
                <p className="form-error">{errors.teamName.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Team Number *</label>
              <input
                {...register('teamNumber', {
                  required: 'Team number is required',
                  min: { value: 1, message: 'Team number must be at least 1' },
                  max: { value: 15, message: 'Team number cannot exceed 15' }
                })}
                type="number"
                className={cn(
                  'form-input',
                  errors.teamNumber && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter team number (1-15)"
              />
              {errors.teamNumber && (
                <p className="form-error">{errors.teamNumber.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="form-label">Project Title *</label>
            <input
              {...register('projectTitle', {
                required: 'Project title is required',
                minLength: {
                  value: VALIDATION_RULES.PROJECT_TITLE_MIN_LENGTH,
                  message: `Project title must be at least ${VALIDATION_RULES.PROJECT_TITLE_MIN_LENGTH} characters`
                },
                maxLength: {
                  value: VALIDATION_RULES.PROJECT_TITLE_MAX_LENGTH,
                  message: `Project title cannot exceed ${VALIDATION_RULES.PROJECT_TITLE_MAX_LENGTH} characters`
                }
              })}
              type="text"
              className={cn(
                'form-input',
                errors.projectTitle && 'border-red-500 focus:ring-red-500'
              )}
              placeholder="Enter project title"
            />
            {errors.projectTitle && (
              <p className="form-error">{errors.projectTitle.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Project Description</label>
            <textarea
              {...register('projectDescription', {
                maxLength: {
                  value: VALIDATION_RULES.DESCRIPTION_MAX_LENGTH,
                  message: `Description cannot exceed ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`
                }
              })}
              rows={3}
              className={cn(
                'form-textarea',
                errors.projectDescription && 'border-red-500 focus:ring-red-500'
              )}
              placeholder="Enter project description (optional)"
            />
            {errors.projectDescription && (
              <p className="form-error">{errors.projectDescription.message}</p>
            )}
          </div>

          {/* Team Members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="form-label">Team Members *</label>
              <button
                type="button"
                onClick={addMember}
                disabled={fields.length >= VALIDATION_RULES.MAX_TEAM_MEMBERS}
                className="akademia-btn-outline text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Member {index + 1}
                    </h4>
                    {fields.length > VALIDATION_RULES.MIN_TEAM_MEMBERS && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          {...register(`members.${index}.name`, {
                            required: 'Name is required',
                            minLength: {
                              value: 2,
                              message: 'Name must be at least 2 characters'
                            }
                          })}
                          type="text"
                          className={cn(
                            'form-input pl-10',
                            errors.members?.[index]?.name && 'border-red-500 focus:ring-red-500'
                          )}
                          placeholder="Enter member name"
                        />
                      </div>
                      {errors.members?.[index]?.name && (
                        <p className="form-error">{errors.members[index].name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Student Number *</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          {...register(`members.${index}.studentNumber`, {
                            required: 'Student number is required',
                            pattern: {
                              value: /^\d{8}$/,
                              message: 'Student number must be exactly 8 digits'
                            }
                          })}
                          type="text"
                          className={cn(
                            'form-input pl-10',
                            errors.members?.[index]?.studentNumber && 'border-red-500 focus:ring-red-500'
                          )}
                          placeholder="Enter 8-digit student number"
                        />
                      </div>
                      {errors.members?.[index]?.studentNumber && (
                        <p className="form-error">{errors.members[index].studentNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          {...register(`members.${index}.email`, {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          type="email"
                          className={cn(
                            'form-input pl-10',
                            errors.members?.[index]?.email && 'border-red-500 focus:ring-red-500'
                          )}
                          placeholder="Enter member email"
                        />
                      </div>
                      {errors.members?.[index]?.email && (
                        <p className="form-error">{errors.members[index].email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Role *</label>
                      <select
                        {...register(`members.${index}.role`, {
                          required: 'Role is required'
                        })}
                        className={cn(
                          'form-select',
                          errors.members?.[index]?.role && 'border-red-500 focus:ring-red-500'
                        )}
                      >
                        <option value="leader">Team Leader</option>
                        <option value="member">Member</option>
                      </select>
                      {errors.members?.[index]?.role && (
                        <p className="form-error">{errors.members[index].role.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Teams must have between {VALIDATION_RULES.MIN_TEAM_MEMBERS} and {VALIDATION_RULES.MAX_TEAM_MEMBERS} members, with exactly one team leader.
            </p>
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
                mode === 'create' ? 'Create Team' : 'Update Team'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;