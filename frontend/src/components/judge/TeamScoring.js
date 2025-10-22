import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Target, 
  FileText, 
  Save, 
  Send, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { scoresAPI, roundsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, cn } from '../../utils/helpers';

/**
 * Team Scoring component - Allows judges to score assigned teams
 */
const TeamScoring = () => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm();

  // Fetch active rounds
  const { data: roundsData, isLoading: roundsLoading } = useQuery(
    'activeRounds',
    () => roundsAPI.getActiveRounds()
  );

  // Fetch team scores
  const { data: teamScores, isLoading: scoresLoading } = useQuery(
    ['teamScores', selectedTeam, selectedRound],
    () => scoresAPI.getTeamScores(selectedTeam, selectedRound),
    { enabled: !!selectedTeam && !!selectedRound }
  );

  // Submit score mutation
  const submitScoreMutation = useMutation(
    (scoreData) => scoresAPI.submitScore(scoreData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teamScores');
        queryClient.invalidateQueries('judgeScores');
        toast.success('Score saved successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save score');
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    }
  );

  // Submit final score mutation
  const submitFinalMutation = useMutation(
    (scoreId) => scoresAPI.submitScoreFinal(scoreId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('teamScores');
        queryClient.invalidateQueries('judgeScores');
        toast.success('Score submitted as final');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit final score');
      },
      onSettled: () => {
        setIsSubmittingFinal(false);
      }
    }
  );

  const rounds = roundsData?.data?.rounds || [];
  const scores = teamScores?.data?.scores || [];

  // Initialize form with existing scores
  useEffect(() => {
    if (scores.length > 0) {
      const formData = {};
      scores.forEach(score => {
        formData[`score_${score.criteria._id}`] = score.score;
        formData[`comments_${score.criteria._id}`] = score.comments || '';
      });
      reset(formData);
    }
  }, [scores, reset]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    if (!selectedTeam || !selectedRound) {
      toast.error('Please select a team and round');
      return;
    }

    setIsSubmitting(true);

    try {
      // Process each criteria score
      const scorePromises = scores.map(async (score) => {
        const criteriaId = score.criteria._id;
        const scoreValue = data[`score_${criteriaId}`];
        const comments = data[`comments_${criteriaId}`] || '';

        if (scoreValue !== undefined && scoreValue !== null) {
          return submitScoreMutation.mutateAsync({
            teamId: selectedTeam,
            roundId: selectedRound,
            criteriaId: criteriaId,
            score: parseFloat(scoreValue),
            comments: comments
          });
        }
      });

      await Promise.all(scorePromises.filter(Boolean));
    } catch (error) {
      console.error('Error submitting scores:', error);
    }
  };

  /**
   * Handle final submission
   */
  const handleFinalSubmission = async () => {
    if (scores.length === 0) {
      toast.error('No scores to submit');
      return;
    }

    if (window.confirm('Are you sure you want to submit these scores as final? This action cannot be undone.')) {
      setIsSubmittingFinal(true);
      
      try {
        // Submit all scores as final
        const finalPromises = scores.map(score => 
          submitFinalMutation.mutateAsync(score._id)
        );
        
        await Promise.all(finalPromises);
      } catch (error) {
        console.error('Error submitting final scores:', error);
      }
    }
  };

  if (roundsLoading || scoresLoading) {
    return <LoadingSpinner text="Loading scoring data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-akademia-primary">
            Score Teams
          </h1>
          <p className="text-gray-600 mt-1">
            Evaluate teams based on assigned criteria
          </p>
        </div>
      </div>

      {/* Team and Round Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-akademia-primary mb-4">
          Select Team and Round
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Round</label>
            <select
              value={selectedRound || ''}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="form-select"
            >
              <option value="">Select a round...</option>
              {rounds.map((round) => (
                <option key={round._id} value={round._id}>
                  {round.name} - {formatDate(round.endDate)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Team</label>
            <select
              value={selectedTeam || ''}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="form-select"
              disabled={!selectedRound}
            >
              <option value="">Select a team...</option>
              {/* Teams will be populated based on selected round */}
            </select>
          </div>
        </div>
      </div>

      {selectedTeam && selectedRound && (
        <>
          {/* Scoring Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-akademia-primary">
                Scoring Form
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFinalSubmission}
                  disabled={isSubmittingFinal || scores.length === 0}
                  className={cn(
                    'akademia-btn-success',
                    (isSubmittingFinal || scores.length === 0) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isSubmittingFinal ? (
                    <div className="flex items-center">
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Final
                    </div>
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {scores.map((score) => (
                <div key={score._id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Target className="h-5 w-5 text-akademia-primary mr-2" />
                        <h4 className="text-lg font-medium text-gray-900">
                          {score.criteria.name}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {score.criteria.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Max Score: {score.criteria.maxScore} points</span>
                        <span>Weight: {(score.criteria.weight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      score.isSubmitted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    )}>
                      {score.isSubmitted ? 'Submitted' : 'Draft'}
                    </div>
                  </div>

                  {/* Marking Guide */}
                  <div className="bg-akademia-light rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 text-akademia-primary mr-2 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-medium text-akademia-primary mb-1">
                          Marking Guide
                        </h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {score.criteria.markingGuide}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Score Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Score (0 - {score.criteria.maxScore})</label>
                      <input
                        {...register(`score_${score.criteria._id}`, {
                          required: 'Score is required',
                          min: {
                            value: 0,
                            message: 'Score must be at least 0'
                          },
                          max: {
                            value: score.criteria.maxScore,
                            message: `Score cannot exceed ${score.criteria.maxScore}`
                          }
                        })}
                        type="number"
                        min="0"
                        max={score.criteria.maxScore}
                        step="0.1"
                        className={cn(
                          'form-input',
                          errors[`score_${score.criteria._id}`] && 'border-red-500 focus:ring-red-500'
                        )}
                        placeholder={`Enter score (0-${score.criteria.maxScore})`}
                      />
                      {errors[`score_${score.criteria._id}`] && (
                        <p className="form-error">{errors[`score_${score.criteria._id}`].message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Comments (Optional)</label>
                      <textarea
                        {...register(`comments_${score.criteria._id}`, {
                          maxLength: {
                            value: 1000,
                            message: 'Comments cannot exceed 1000 characters'
                          }
                        })}
                        rows={3}
                        className={cn(
                          'form-textarea',
                          errors[`comments_${score.criteria._id}`] && 'border-red-500 focus:ring-red-500'
                        )}
                        placeholder="Add comments about this criteria..."
                      />
                      {errors[`comments_${score.criteria._id}`] && (
                        <p className="form-error">{errors[`comments_${score.criteria._id}`].message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeam(null);
                    setSelectedRound(null);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Teams
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
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Save Scores
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Empty State */}
      {(!selectedTeam || !selectedRound) && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select Team and Round
          </h3>
          <p className="text-gray-500">
            Choose a team and round to start scoring.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamScoring;
