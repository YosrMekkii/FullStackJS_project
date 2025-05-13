import mongoose from 'mongoose';
import User from "../models/user.js";  // Ajout de l'extension .js

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String,},
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  });

export default mongoose.model('Message', messageSchema);
