const Team = require('../models/Team');
const Score = require('../models/Score');
const Round = require('../models/Round');


//Calculate winner based on scores from closed rounds - Round ID (optional, uses latest closed round if not provided)
const calculateWinner = async (roundId = null) => {
  try {
    let round;
    
    if (roundId) {
      round = await Round.findById(roundId);
      if (!round) {
        throw new Error('Round not found');
      }
    } else {
      // Get the latest closed round
      round = await Round.findOne({ 
        isActive: true, 
        isOpen: false 
      }).sort({ endDate: -1 });
      
      if (!round) {
        throw new Error('No closed rounds found');
      }
    }
    
    // Get all teams that participated
    const teams = await Team.find({ isParticipating: true });
    
    if (teams.length === 0) {
      throw new Error('No participating teams found');
    }
    
    // Calculate scores for each team
    const teamScores = [];
    
    for (const team of teams) {
      const scoreSummary = await Score.getTeamScoreSummary(team._id, round._id);
      
      if (scoreSummary.judgeCount > 0) { // Only include teams that were evaluated
        teamScores.push({
          teamId: team._id,
          teamName: team.teamName,
          teamNumber: team.teamNumber,
          members: team.members,
          totalScore: scoreSummary.totalScore,
          maxPossibleScore: scoreSummary.maxPossibleScore,
          averageScore: scoreSummary.averageScore,
          judgeCount: scoreSummary.judgeCount,
          criteriaScores: scoreSummary.criteriaScores
        });
      }
    }
    
    // Sort teams by average score (descending)
    teamScores.sort((a, b) => b.averageScore - a.averageScore);
    
    // Determine winner and rankings
    const results = {
      round: {
        id: round._id,
        name: round.name,
        description: round.description,
        endDate: round.endDate
      },
      totalTeams: teams.length,
      evaluatedTeams: teamScores.length,
      winner: teamScores.length > 0 ? teamScores[0] : null,
      rankings: teamScores.map((team, index) => ({
        position: index + 1,
        ...team
      })),
      statistics: {
        highestScore: teamScores.length > 0 ? Math.max(...teamScores.map(t => t.averageScore)) : 0,
        lowestScore: teamScores.length > 0 ? Math.min(...teamScores.map(t => t.averageScore)) : 0,
        averageScore: teamScores.length > 0 ? 
          teamScores.reduce((sum, t) => sum + t.averageScore, 0) / teamScores.length : 0,
        scoreDistribution: calculateScoreDistribution(teamScores)
      }
    };
    
    return results;
    
  } catch (error) {
    console.error('Calculate winner error:', error);
    throw error;
  }
};


//Calculate score distribution for analytics
const calculateScoreDistribution = (teamScores) => {
  if (teamScores.length === 0) return {};
  
  const scores = teamScores.map(t => t.averageScore);
  const ranges = [
    { range: '90-100', count: 0, teams: [] },
    { range: '80-89', count: 0, teams: [] },
    { range: '70-79', count: 0, teams: [] },
    { range: '60-69', count: 0, teams: [] },
    { range: '50-59', count: 0, teams: [] },
    { range: '0-49', count: 0, teams: [] }
  ];
  
  scores.forEach(score => {
    const team = teamScores.find(t => t.averageScore === score);
    if (score >= 90) {
      ranges[0].count++;
      ranges[0].teams.push(team.teamName);
    } else if (score >= 80) {
      ranges[1].count++;
      ranges[1].teams.push(team.teamName);
    } else if (score >= 70) {
      ranges[2].count++;
      ranges[2].teams.push(team.teamName);
    } else if (score >= 60) {
      ranges[3].count++;
      ranges[3].teams.push(team.teamName);
    } else if (score >= 50) {
      ranges[4].count++;
      ranges[4].teams.push(team.teamName);
    } else {
      ranges[5].count++;
      ranges[5].teams.push(team.teamName);
    }
  });
  
  return {
    ranges,
    totalTeams: teamScores.length
  };
};


//Get detailed analytics for a round
const getDetailedAnalytics = async (roundId) => {
  try {
    const round = await Round.findById(roundId)
      .populate('criteria', 'name maxScore weight');
    
    if (!round) {
      throw new Error('Round not found');
    }
    
    // Get all scores for this round
    const scores = await Score.find({ 
      round: roundId, 
      isSubmitted: true 
    }).populate('team', 'teamName teamNumber');
    
    // Group scores by criteria
    const criteriaAnalytics = {};
    
    round.criteria.forEach(criteria => {
      const criteriaScores = scores.filter(s => s.criteria.equals(criteria._id));
      const scoreValues = criteriaScores.map(s => s.score);
      
      criteriaAnalytics[criteria.name] = {
        criteriaId: criteria._id,
        maxScore: criteria.maxScore,
        weight: criteria.weight,
        totalEvaluations: criteriaScores.length,
        averageScore: scoreValues.length > 0 ? 
          scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length : 0,
        highestScore: scoreValues.length > 0 ? Math.max(...scoreValues) : 0,
        lowestScore: scoreValues.length > 0 ? Math.min(...scoreValues) : 0,
        scoreDistribution: calculateScoreDistribution(
          scoreValues.map(score => ({ averageScore: score }))
        )
      };
    });
    
    // Judge performance analytics
    const judgeAnalytics = {};
    const judgeScores = scores.reduce((acc, score) => {
      const judgeId = score.judge.toString();
      if (!acc[judgeId]) {
        acc[judgeId] = [];
      }
      acc[judgeId].push(score);
      return acc;
    }, {});
    
    Object.entries(judgeScores).forEach(([judgeId, judgeScoreList]) => {
      const scoreValues = judgeScoreList.map(s => s.score);
      judgeAnalytics[judgeId] = {
        totalEvaluations: judgeScoreList.length,
        averageScore: scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length,
        scoreRange: {
          highest: Math.max(...scoreValues),
          lowest: Math.min(...scoreValues)
        },
        teamsEvaluated: [...new Set(judgeScoreList.map(s => s.team._id.toString()))].length
      };
    });
    
    return {
      round: {
        id: round._id,
        name: round.name,
        criteria: round.criteria
      },
      criteriaAnalytics,
      judgeAnalytics,
      overallStats: {
        totalScores: scores.length,
        totalTeams: [...new Set(scores.map(s => s.team._id.toString()))].length,
        totalJudges: [...new Set(scores.map(s => s.judge.toString()))].length
      }
    };
    
  } catch (error) {
    console.error('Get detailed analytics error:', error);
    throw error;
  }
};

module.exports = {
  calculateWinner,
  getDetailedAnalytics,
  calculateScoreDistribution
};