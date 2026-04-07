import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeamById,
  getTeamByCaptainId,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
  updatePlayerInTeam,
  removePlayerFromTeam
} from "../controllers/teamController.js";

const router = express.Router();

// TEAM ROUTES
router.post("/", createTeam);
router.get("/", getAllTeams);
router.get("/captain/:captainId", getTeamByCaptainId);
router.get("/:id", getTeamById);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

// PLAYER ROUTES
router.post("/:id/players", addPlayerToTeam);
router.put("/:id/players/:playerIndex", updatePlayerInTeam);
router.delete("/:id/players/:playerIndex", removePlayerFromTeam);

export default router;