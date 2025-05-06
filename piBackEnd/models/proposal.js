// models/Proposal.js
import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offering: {
    type: String,
    required: true,
  },
  lookingFor: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Proposal = mongoose.model('Proposal', proposalSchema);
export default Proposal;