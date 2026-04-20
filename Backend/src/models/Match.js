import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  tournament: { type: String, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  venue: { type: String, required: true },
  matchDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Live', 'Completed'], 
    default: 'Scheduled' 
  },
  scores: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 }
  },
  // CRITICAL: This must be an array to use .push()
  images: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const Match = mongoose.model('Match', matchSchema);
export default Match;