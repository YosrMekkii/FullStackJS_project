import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  xp: {
    type: Number,
    default: 0 // Track user's experience points
  },
  streak: {
    type: Number,
    default: 0 // Track current streak of completed challenges
  },
  dailyGoals: {
    type: Number,
    default: 0 // Track how many daily goals are completed
  }
}, { timestamps: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;
