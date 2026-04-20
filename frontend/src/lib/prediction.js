export const predictWinner = (homeTeamName, awayTeamName, leaderboard) => {
    const homeTeam = leaderboard.find(t => t.team === homeTeamName);
    const awayTeam = leaderboard.find(t => t.team === awayTeamName);

    if (!homeTeam || !awayTeam) return "TBD"; // To Be Determined

    if (homeTeam.points > awayTeam.points) return homeTeamName;
    if (awayTeam.points > homeTeam.points) return awayTeamName;
    return "Draw Predicted";
};