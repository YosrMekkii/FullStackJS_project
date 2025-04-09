// models/Match.js
import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  matchedUserId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  lastInteraction: {
    type: Date
  }
});

// Create a compound index to ensure uniqueness of matches
matchSchema.index({ userId: 1, matchedUserId: 1 }, { unique: true });

const Match = mongoose.model('Match', matchSchema);

// Export the model to be used in the routes
//module.exports = Match;

export default Match;
