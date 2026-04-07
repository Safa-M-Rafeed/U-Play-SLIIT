/**
 * Logic: Compares leaderboard points to determine win probability.
 * If Team A has 15 points and Team B has 5, the bar shifts toward Team A.
 */
export const calculatePrediction = (homeTeamName, awayTeamName, leaderboard) => {
  // 1. Find the teams in the current leaderboard data
  const homeStats = leaderboard.find(t => t.team === homeTeamName);
  const awayStats = leaderboard.find(t => t.team === awayTeamName);

  // 2. Extract points (default to 0 if they haven't played yet)
  const homePts = homeStats?.points || 0;
  const awayPts = awayStats?.points || 0;

  // 3. Calculation Logic
  // We add 10 as a "smoothing factor" so we don't get 100% vs 0% results too early
  const total = homePts + awayPts + 10; 
  
  // Give each team a base 5% chance + their share of the points
  const homeWinProb = Math.round(((homePts + 5) / total) * 100);
  const awayWinProb = 100 - homeWinProb;

  return { homeWinProb, awayWinProb };
};