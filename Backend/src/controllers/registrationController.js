import Registration from "../models/Registration.js";
import Team from "../models/Team.js";

// REGISTER TEAM FOR TOURNAMENT
export const registerTeamForTournament = async (req, res) => {
  try {
    const { teamId, tournament } = req.body;

    if (!teamId || !tournament) {
      return res.status(400).json({
        message: "teamId and tournament are required"
      });
    }

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    if ((team.players?.length || 0) < 5) {
      return res.status(400).json({
        message: "Minimum 5 players required to register"
      });
    }

    const alreadyInTeamDoc = (team.registrations || []).some(
      (item) => item.tournament === tournament
    );

    if (alreadyInTeamDoc) {
      return res.status(400).json({
        message: "This team is already registered for the selected tournament"
      });
    }

    const existingRegistration = await Registration.findOne({
      teamId: team._id,
      tournament
    });

    if (existingRegistration) {
      return res.status(400).json({
        message: "Registration already exists for this tournament"
      });
    }

    const registration = await Registration.create({
      teamId: team._id,
      teamName: team.teamName,
      captainId: team.captainId,
      tournament,
      status: "Pending",
      rejectionReason: ""
    });

    team.registrations.push({
      tournament,
      status: "Pending",
      rejectionReason: ""
    });

    await team.save();

    res.status(201).json({
      message: "Team registered successfully",
      registration,
      team
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to register team",
      error: error.message
    });
  }
};

// GET REGISTRATIONS BY CAPTAIN ID
export const getRegistrationsByCaptainId = async (req, res) => {
  try {
    const { captainId } = req.params;

    const registrations = await Registration.find({ captainId }).sort({
      createdAt: -1
    });

    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch registrations",
      error: error.message
    });
  }
};

// RE-REGISTER REJECTED TOURNAMENT
export const reRegisterTournament = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found"
      });
    }

    registration.status = "Pending";
    registration.rejectionReason = "";
    await registration.save();

    const team = await Team.findById(registration.teamId);

    if (team) {
      const item = team.registrations.find(
        (r) => r.tournament === registration.tournament
      );

      if (item) {
        item.status = "Pending";
        item.rejectionReason = "";
        await team.save();
      }
    }

    res.status(200).json({
      message: "Tournament re-registration submitted successfully",
      registration
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to re-register tournament",
      error: error.message
    });
  }
};