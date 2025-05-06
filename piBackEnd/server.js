import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import url from 'url'; 
import fs from 'fs';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import './models/user.js';
import './models/report.js';

import userRoutes from './routes/userRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import reportRoutes from "./routes/reportRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import openaiRoutes from './routes/openaiRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import proposalRoutes  from './routes/proposalRoutes.js';
import Message from './models/message.js';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PATCH,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

// Connexion MongoDB
mongoose.connect('mongodb+srv://ayari2014khalil:skillexchangedb@skillexchangedb.jyc2i.mongodb.net/')
  .then(() => console.log("✅ Connected to MongoDB!"))
  .catch(error => console.error("❌ MongoDB connection error:", error));

// ReCaptcha login route
app.post("/api/login", async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  if (!recaptchaToken) return res.status(400).json({ success: false, message: "reCAPTCHA manquant." });

  const recaptchaSecret = "6LcGAOAqAAAAABnRcsfkKtY9aOaFyCwODtQ2J-UC";
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`;

  try {
    const response = await fetch(verifyUrl, { method: "POST" });
    const data = await response.json();
    if (!data.success) return res.status(400).json({ success: false, message: "Échec de la vérification reCAPTCHA." });

    res.json({ success: true, message: "Connexion réussie !" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// Upload image
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads/'),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const fileFilter = (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Seuls les fichiers images sont acceptés !'), false);
const upload = multer({ storage, fileFilter });

app.post('/upload', upload.single('profileImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier téléchargé' });
  res.json({ message: 'Image téléchargée avec succès', filename: req.file.filename });
});

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/users', userRoutes);
app.use('/skill', skillRoutes);
app.use("/api/reports", reportRoutes);
app.use("/questions", questionRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/openai", openaiRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/proposal", proposalRoutes);

// WebSocket logic

io.on('connection', (socket) => {
  console.log('🟢 Utilisateur connecté :', socket.id);

  socket.on('sendMessage', async (data) => {
    console.log('📨 Message reçu :', data);

    try {
      const message = new Message({
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        timestamp: data.timestamp || new Date()
      });

      await message.save(); // 💾 Enregistrement en base

      // Envoie uniquement au destinataire si tu veux du 1-to-1 (optionnel)
      io.emit('receiveMessage', message); // 🔁 Diffusion à tous les clients
    } catch (error) {
      console.error('❌ Erreur enregistrement message :', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Utilisateur déconnecté :', socket.id);
  });
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});



// route pour charger les messages stockés :
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// Start the server
server.listen(PORT, () => {
  console.log(`🚀 API + WebSocket running on http://localhost:${PORT}`);
});
