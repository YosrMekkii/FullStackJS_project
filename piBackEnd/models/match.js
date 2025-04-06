// models/Match.js
import mongoose from 'mongoose';

// Define the schema for the Match model
const matchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a 'User' model, if not, you can adjust accordingly
      required: true,
    },
    matchedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // This can be another user who is matched with the current user
      required: true,
    },
    matchDate: {
      type: Date,
      default: Date.now,
    },
    skillsMatched: [String], // Array of matched skills
    interestsMatched: [String], // Array of matched interests
  },
  { timestamps: true }
);

// Create the Match model using the schema
const Match = mongoose.model('Match', matchSchema);

// Export the model to be used in the routes
//module.exports = Match;

export default Match;