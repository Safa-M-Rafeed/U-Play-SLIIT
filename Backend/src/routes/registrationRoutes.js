import express from "express";
import {
  registerTeamForTournament,
  getRegistrationsByCaptainId,
  reRegisterTournament
} from "../controllers/registrationController.js";

const router = express.Router();

router.post("/", registerTeamForTournament);
router.get("/captain/:captainId", getRegistrationsByCaptainId);
router.put("/:id/reregister", reRegisterTournament);

export default router;