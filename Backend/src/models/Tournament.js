import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sport: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    registeredTeams: {
      type: Number,
      default: 0
    },
    maxTeams: {
      type: Number,
      default: 0
    },
    matchesPlayed: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Registration Open', 'Upcoming', 'Completed'],
      default: 'Upcoming'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Tournament', tournamentSchema);
