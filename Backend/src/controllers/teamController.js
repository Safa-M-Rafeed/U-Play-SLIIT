import Team from "../models/Team.js";

const calculateChemistryScore = (players = []) => {
  const playerCount = players.length;
  let score = 0;

  score += Math.min(playerCount * 10, 50);

  const uniqueJerseys = new Set(players.map((p) => p.jerseyNumber));
  if (playerCount > 0 && uniqueJerseys.size === playerCount) {
    score += 20;
  }

  const positions = new Set(players.map((p) => p.position));
  score += Math.min(positions.size * 10, 30);

  return Math.min(score, 100);
};

// CREATE TEAM
export const createTeam = async (req, res) => {
  try {
    const {
      teamName,
      sport,
      logo,
      captain,
      captainId
    } = req.body;

    if (!teamName || !logo || !captain || !captainId) {
      return res.status(400).json({
        message: "teamName, logo, captain, and captainId are required"
      });
    }

    const existingTeamName = await Team.findOne({ teamName });
    if (existingTeamName) {
      return res.status(400).json({
        message: "Team name already exists"
      });
    }

    const existingCaptainTeam = await Team.findOne({ captainId });
    if (existingCaptainTeam) {
      return res.status(400).json({
        message: "One captain can create only one team"
      });
    }

    const initialPlayers = [];

    const team = await Team.create({
      teamName,
      sport: sport || "Football",
      logo,
      captain,
      captainId,
      players: initialPlayers,
      registrations: [],
      chemistryScore: calculateChemistryScore(initialPlayers)
    });

    res.status(201).json({
      message: "Team created successfully",
      team
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create team",
      error: error.message
    });
  }
};

// GET ALL TEAMS
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });

    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch teams",
      error: error.message
    });
  }
};

// GET TEAM BY ID
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch team",
      error: error.message
    });
  }
};

// GET TEAM BY CAPTAIN ID
export const getTeamByCaptainId = async (req, res) => {
  try {
    const { captainId } = req.params;

    const team = await Team.findOne({ captainId });

    if (!team) {
      return res.status(404).json({
        message: "No team found for this captain"
      });
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch captain team",
      error: error.message
    });
  }
};

// UPDATE TEAM
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, sport, logo, registrations } = req.body;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    if (teamName && teamName !== team.teamName) {
      const duplicateName = await Team.findOne({
        teamName,
        _id: { $ne: id }
      });

      if (duplicateName) {
        return res.status(400).json({
          message: "Team name already exists"
        });
      }
    }

    team.teamName = teamName ?? team.teamName;
    team.sport = sport ?? team.sport;
    team.logo = logo ?? team.logo;
    team.registrations = registrations ?? team.registrations;
    team.chemistryScore = calculateChemistryScore(team.players);

    const updatedTeam = await team.save();

    res.status(200).json({
      message: "Team updated successfully",
      team: updatedTeam
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update team",
      error: error.message
    });
  }
};

// DELETE TEAM
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    if (team.registrations && team.registrations.length > 0) {
      return res.status(400).json({
        message: "Registered team cannot be deleted"
      });
    }

    await Team.findByIdAndDelete(id);

    res.status(200).json({
      message: "Team deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete team",
      error: error.message
    });
  }
};

// ADD PLAYER
export const addPlayerToTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, studentId, jerseyNumber, position } = req.body;

    if (!name || !studentId || !jerseyNumber || !position) {
      return res.status(400).json({
        message: "All player fields are required"
      });
    }

    if (Number(jerseyNumber) < 1 || Number(jerseyNumber) > 99) {
      return res.status(400).json({
        message: "Jersey number must be between 1 and 99"
      });
    }

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    const duplicateJersey = team.players.some(
      (player) => Number(player.jerseyNumber) === Number(jerseyNumber)
    );

    if (duplicateJersey) {
      return res.status(400).json({
        message: "Jersey number must be unique per team"
      });
    }

    team.players.push({
      name,
      studentId,
      jerseyNumber,
      position
    });

    team.chemistryScore = calculateChemistryScore(team.players);

    const updatedTeam = await team.save();

    res.status(200).json({
      message: "Player added successfully",
      team: updatedTeam
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add player",
      error: error.message
    });
  }
};

// UPDATE PLAYER
export const updatePlayerInTeam = async (req, res) => {
  try {
    const { id, playerIndex } = req.params;
    const { name, studentId, jerseyNumber, position } = req.body;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    const index = Number(playerIndex);

    if (index < 0 || index >= team.players.length) {
      return res.status(400).json({
        message: "Invalid player index"
      });
    }

    const duplicateJersey = team.players.some((player, i) => {
      return i !== index && Number(player.jerseyNumber) === Number(jerseyNumber);
    });

    if (duplicateJersey) {
      return res.status(400).json({
        message: "Jersey number must be unique per team"
      });
    }

    team.players[index] = {
      name,
      studentId,
      jerseyNumber,
      position
    };

    team.chemistryScore = calculateChemistryScore(team.players);

    const updatedTeam = await team.save();

    res.status(200).json({
      message: "Player updated successfully",
      team: updatedTeam
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update player",
      error: error.message
    });
  }
};

// REMOVE PLAYER
export const removePlayerFromTeam = async (req, res) => {
  try {
    const { id, playerIndex } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    const index = Number(playerIndex);

    if (index < 0 || index >= team.players.length) {
      return res.status(400).json({
        message: "Invalid player index"
      });
    }

    team.players.splice(index, 1);

    team.chemistryScore = calculateChemistryScore(team.players);

    const updatedTeam = await team.save();

    res.status(200).json({
      message: "Player removed successfully",
      team: updatedTeam
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove player",
      error: error.message
    });
  }
};