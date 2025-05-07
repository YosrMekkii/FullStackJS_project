import mongoose from 'mongoose';

const expertApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  motivation: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminComment: { type: String },
  documentPath: { type: String }, // Chemin du fichier (PDF/image/etc.)
  documentFilename: { type: String }
});

const ExpertApplication = mongoose.model('ExpertApplication', expertApplicationSchema);
export default ExpertApplication;
