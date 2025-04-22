// models/Challenge.js
const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['coding', 'quiz', 'interactive'], required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  xp: { type: Number, required: true },
  timeLimit: { type: Number, required: true }, // minutes
  category: { type: String, required: true },
  tags: [String], // For matching with user interests
  content: {
    question: String,
    options: [String],
    code: String,
    correctAnswer: mongoose.Schema.Types.Mixed // String or Array
  },
  dailyChallenge: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);