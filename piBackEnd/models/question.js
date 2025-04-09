import mongoose from'mongoose';

const questionSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  category: String,
  timestamp: { type: Date, default: Date.now }
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
