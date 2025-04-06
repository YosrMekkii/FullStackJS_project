const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  category: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);