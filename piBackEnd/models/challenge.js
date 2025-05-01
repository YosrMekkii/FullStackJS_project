import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['coding', 'quiz', 'interactive'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  xp: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  content: {
    question: String,
    options: [String],
    code: String,
    correctAnswer: mongoose.Schema.Types.Mixed // Can be string or array of strings
  },
  dailyChallenge: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;