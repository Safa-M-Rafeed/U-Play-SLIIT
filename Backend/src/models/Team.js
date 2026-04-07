import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    studentId: {
      type: String,
      required: true,
      trim: true
    },
    jerseyNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 99
    },
    position: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const registrationItemSchema = new mongoose.Schema(
  {
    tournament: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    rejectionReason: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    sport: {
      type: String,
      default: "Football",
      trim: true
    },
    logo: {
      type: String,
      required: true
    },
    captain: {
      type: String,
      required: true,
      trim: true
    },
    captainId: {
      type: String,
      required: true,
      trim: true
    },
    players: {
      type: [playerSchema],
      default: []
    },
    registrations: {
      type: [registrationItemSchema],
      default: []
    },
    chemistryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Team", teamSchema);