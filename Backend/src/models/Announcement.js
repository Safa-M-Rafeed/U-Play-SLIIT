import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: [true, 'Tournament ID is required'],
    index: true
  },
  
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    minlength: [10, 'Content must be at least 10 characters'],
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
announcementSchema.index({ tournamentId: 1, createdAt: -1 });

export default mongoose.model('Announcement', announcementSchema);