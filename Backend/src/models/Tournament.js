import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: String, required: true },
    format: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    venue: { type: String, required: true },
    maxTeams: { type: Number, required: true, min: 2, max: 64 },
    registeredTeams: { type: Number, default: 0 },
    rules: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    healthScore: { type: Number, default: 100 },
    conflicts: [
      {
        type: { type: String },
        message: { type: String },
        severity: { type: String, enum: ['error', 'warning'] },
      },
    ],
    announcements: [
      {
        title: { type: String },
        message: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    clonedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      default: null,
    },
  },
  { timestamps: true }
);

tournamentSchema.pre('save', function (next) {
  const now = new Date();
  if (this.startDate > now) this.status = 'Upcoming';
  else if (this.endDate < now) this.status = 'Completed';
  else this.status = 'Ongoing';
  next();
});

export default mongoose.model('Tournament', tournamentSchema);