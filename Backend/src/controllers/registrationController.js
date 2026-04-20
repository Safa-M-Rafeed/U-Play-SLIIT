import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import Team from "../models/Team.js";
import Tournament from "../models/Tournament.js";

// REGISTER TEAM FOR TOURNAMENT
export const registerTeamForTournament = async (req, res) => {
  try {
    const { teamId, tournamentId } = req.body;

    if (!teamId || !tournamentId) {
      return res.status(400).json({
        message: "teamId and tournamentId are required"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(tournamentId)
    ) {
      return res.status(400).json({
        message: "Invalid teamId or tournamentId"
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found"
      });
    }

    if ((team.players?.length || 0) < 5) {
      return res.status(400).json({
        message: "Minimum 5 players required to register"
      });
    }

    const existingRegistration = await Registration.findOne({
      teamId: team._id,
      tournamentId: tournament._id
    });

    if (existingRegistration) {
      return res.status(400).json({
        message: "This team is already registered for this tournament"
      });
    }

    const registration = await Registration.create({
      tournamentId: tournament._id,
      tournamentName: tournament.name,
      teamId: team._id,
      teamName: team.teamName,
      captainId: team.captainId,
      status: "Pending",
      rejectionReason: ""
    });

    const alreadyInTeamDoc = (team.registrations || []).some(
      (item) =>
        String(item.tournamentId) === String(tournament._id) ||
        item.tournament === tournament.name
    );

    if (!alreadyInTeamDoc) {
      team.registrations.push({
        tournamentId: tournament._id,
        tournament: tournament.name,
        status: "Pending",
        rejectionReason: "",
        submittedAt: registration.createdAt
      });
      await team.save();
    }

    res.status(201).json({
      message: "Registration request submitted successfully",
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

    const registrations = await Registration.find({ captainId })
      .sort({ createdAt: -1 })
      .lean();

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

    if (registration.status !== "Rejected") {
      return res.status(400).json({
        message: "Only rejected registrations can be re-submitted"
      });
    }

    registration.status = "Pending";
    registration.rejectionReason = "";
    registration.approvedBy = null;
    registration.approvedAt = null;
    await registration.save();

    const team = await Team.findById(registration.teamId);

    if (team) {
      const item = team.registrations.find(
        (r) =>
          String(r.tournamentId) === String(registration.tournamentId) ||
          r.tournament === registration.tournamentName
      );

      if (item) {
        item.status = "Pending";
        item.rejectionReason = "";
        item.submittedAt = registration.updatedAt;
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