import Match from '../models/Match.js';

/**
 * @desc    Create a new match
 * @route   POST /api/matches/create
 */
export const createMatch = async (req, res) => {
    try {
        const { tournament, homeTeam, awayTeam, venue, matchDate } = req.body;

        if (homeTeam === awayTeam) {
            return res.status(400).json({ message: "Home and Away teams must be different." });
        }

        const existingMatch = await Match.findOne({ venue, matchDate });
        if (existingMatch) {
            return res.status(400).json({ message: "Venue is already booked for this time." });
        }

        const newMatch = new Match({ tournament, homeTeam, awayTeam, venue, matchDate });
        await newMatch.save();
        
        res.status(201).json({ message: "Match created successfully", match: newMatch });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all matches sorted by date
 * @route   GET /api/matches
 */
export const getAllMatches = async (req, res) => {
    try {
        const matches = await Match.find().sort({ matchDate: 1 });
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update match scores and status
 * @route   PUT /api/matches/update/:id
 */
export const updateScore = async (req, res) => {
    try {
        const { scores, status } = req.body;

        if (!scores || scores.home < 0 || scores.away < 0) {
            return res.status(400).json({ message: "Invalid scores provided." });
        }

        const updatedMatch = await Match.findByIdAndUpdate(
            req.params.id,
            { 
                "scores.home": Number(scores.home), 
                "scores.away": Number(scores.away), 
                status 
            },
            { new: true }
        );

        if (!updatedMatch) {
            return res.status(404).json({ message: "Match not found" });
        }

        res.status(200).json({ message: "Score updated successfully", match: updatedMatch });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete a match
 * @route   DELETE /api/matches/:id
 */
export const deleteMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        if (match.scores && (match.scores.home > 0 || match.scores.away > 0)) {
            return res.status(400).json({ 
                message: "Cannot delete a match with recorded scores. Reset scores to 0 first." 
            });
        }

        await Match.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Match deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Calculate leaderboard based on completed matches
 * @route   GET /api/matches/leaderboard
 */
export const getLeaderboard = async (req, res) => {
    try {
        // Find matches that are explicitly marked as 'Completed'
        const completedMatches = await Match.find({ status: 'Completed' });
        const stats = {};

        completedMatches.forEach(m => {
            const { homeTeam, awayTeam, scores } = m;
            
            // Initialize teams if they don't exist in the object
            [homeTeam, awayTeam].forEach(team => {
                if (!stats[team]) {
                    stats[team] = { 
                        team, 
                        played: 0, 
                        win: 0, 
                        draw: 0, 
                        loss: 0, 
                        gf: 0, 
                        ga: 0, 
                        gd: 0, 
                        points: 0 
                    };
                }
            });

            const hScore = Number(scores.home) || 0;
            const aScore = Number(scores.away) || 0;

            // Update Goals For (GF) and Goals Against (GA)
            stats[homeTeam].gf += hScore;
            stats[homeTeam].ga += aScore;
            stats[awayTeam].gf += aScore;
            stats[awayTeam].ga += hScore;

            // Update Wins, Losses, Draws and Points
            if (hScore > aScore) {
                stats[homeTeam].win += 1; 
                stats[homeTeam].points += 3;
                stats[awayTeam].loss += 1;
            } else if (hScore < aScore) {
                stats[awayTeam].win += 1; 
                stats[awayTeam].points += 3;
                stats[homeTeam].loss += 1;
            } else {
                stats[homeTeam].draw += 1; 
                stats[homeTeam].points += 1;
                stats[awayTeam].draw += 1; 
                stats[awayTeam].points += 1;
            }
            
            stats[homeTeam].played += 1;
            stats[awayTeam].played += 1;
        });

        // Calculate Final GD and Sort
        const leaderboard = Object.values(stats)
            .map(t => ({ 
                ...t, 
                gd: t.gf - t.ga  // Goal Difference Calculation
            }))
            .sort((a, b) => {
                // Primary Sort: Points
                if (b.points !== a.points) return b.points - a.points;
                // Secondary Sort: Goal Difference
                if (b.gd !== a.gd) return b.gd - a.gd;
                // Tertiary Sort: Goals Scored
                return b.gf - a.gf;
            });

        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};