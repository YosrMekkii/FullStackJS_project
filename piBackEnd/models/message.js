import mongoose from 'mongoose';
import User from "../models/user.js";  // Ajout de l'extension .js

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  });

export default mongoose.model('Message', messageSchema);
