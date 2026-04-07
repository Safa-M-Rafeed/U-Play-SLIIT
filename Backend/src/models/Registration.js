import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },
    teamName: {
      type: String,
      required: true,
      trim: true
    },
    captainId: {
      type: String,
      required: true,
      trim: true
    },
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
  {
    timestamps: true
  }
);

export default mongoose.model("Registration", registrationSchema);