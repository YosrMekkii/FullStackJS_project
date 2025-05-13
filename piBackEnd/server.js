import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import url from 'url'; 
import './models/user.js'; // juste pour enregistrer le modèle
import fs from 'fs';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import './models/report.js';

import userRoutes from './routes/userRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import reportRoutes from "./routes/reportRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import openaiRoutes from './routes/openaiRoutes.js'; // Add this line near other route imports
import challengesRoutes from './routes/challengesRoutes.js';
import challenges from './routes/challenges.js'; 



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

  if (!recaptchaToken) {
    return res.status(400).json({ success: false, message: "reCAPTCHA manquant." });
  }

  // Vérifier le token reCAPTCHA avec Google
  const recaptchaSecret1 = "6LcGAOAqAAAAABnRcsfkKtY9aOaFyCwODtQ2J-UC"; // Remplace par ta clé secrète reCAPTCHA
  const recaptchaVerifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret1}&response=${recaptchaToken}`;

  
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
app.use('/uploads', express.static('uploads'));
app.use("/api/openai", openaiRoutes); 
app.use('/api/challenges', challengesRoutes);
app.use('/api/adminChallenges', challenges); 


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
