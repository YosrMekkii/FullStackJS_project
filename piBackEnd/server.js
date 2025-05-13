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
import expertApplicationRoutes from './routes/expertApplicationRoutes.js';

import userRoutes from './routes/userRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import reportRoutes from "./routes/reportRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import openaiRoutes from './routes/openaiRoutes.js'; // Add this line near other route imports
import challengesRoutes from './routes/challengesRoutes.js';
import challenges from './routes/challenges.js'; 
import Message from './models/message.js';
//import cors from 'cors'; // ✅ Import CORS
import recommendationRoutes from './routes/recommendationRoutes.js';




const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // En développement uniquement! En production, utilisez des domaines spécifiques
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000, // Délai avant déconnexion en cas d'inactivité
});

const PORT = process.env.PORT || 3000;

app.use(express.json());app.use(cors({
  origin: '*', // En développement uniquement! Pour la production, spécifiez les domaines autorisés
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
//app.use("/api/openai", openaiRoutes); // Add this before 404 handler
app.use('/api/expert-applications', expertApplicationRoutes);
app.use('/api', recommendationRoutes);

// WebSocket logic
const connectedUsers = new Map(); // stocke userId -> socketId
const userSessions = new Map(); // stocke socketId -> userId

io.on('connection', (socket) => {
  console.log('🟢 Utilisateur connecté :', socket.id);

  // Enregistrer l'utilisateur quand il s'identifie
  socket.on('userJoined', (userId) => {
    console.log(`👤 Utilisateur ${userId} enregistré avec socket ${socket.id}`);
    connectedUsers.set(userId, socket.id);
    userSessions.set(socket.id, userId);
    
    // Informer les autres utilisateurs qu'un nouveau utilisateur est connecté
    socket.broadcast.emit('userOnline', { userId });
    
    // Envoyer la liste des utilisateurs connectés à ce nouvel utilisateur
    const onlineUsers = Array.from(connectedUsers.keys());
    socket.emit('onlineUsers', { users: onlineUsers });
  });



// Gestion des messages
socket.on('sendMessage', async (data) => {
  console.log('📨 Message reçu :', data);

  try {
    const senderId = data.senderId;
    const receiverId = "67f999a879e4baaee98047c6";  // Utiliser 'all' si receiverId n'est pas fourni

    const message = new Message({
      senderId: senderId,
      receiverId: receiverId,
      content: data.content,
      timestamp: data.timestamp || new Date()
    });

    await message.save();

    // Diffusion du message
    if (receiverId === 'all') {
      io.emit('receiveMessage', message);  // Message global
    } else {
      const receiverSocketId = connectedUsers.get(receiverId);
      socket.emit('receiveMessage', message);  // Envoi à l'expéditeur
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', message);  // Envoi au destinataire
      }
    }
  } catch (error) {
    console.error('❌ Erreur enregistrement message :', error);
    socket.emit('messageError', { error: 'Erreur lors de l\'envoi du message' });
  }
});


   // Partage de fichiers
   socket.on('fileShared', (fileData) => {
    if (fileData.receiverId === 'all') {
      // Fichier partagé avec tout le monde
      socket.broadcast.emit('newSharedFile', fileData);
    } else {
      // Fichier partagé avec un utilisateur spécifique
      const receiverSocketId = connectedUsers.get(fileData.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newSharedFile', fileData);
      }
    }
  });
  // Tableau blanc - synchronisation des dessins
  socket.on('drawLine', (lineData) => {
    // Diffuser le trait à tous les autres utilisateurs
    socket.broadcast.emit('newLine', lineData);
  });

  // Éditeur de code - synchronisation du code
  socket.on('codeChange', (codeData) => {
    // Diffuser les changements de code à tous les autres utilisateurs
    socket.broadcast.emit('codeUpdated', codeData);
  });

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    const userId = userSessions.get(socket.id);
    if (userId) {
      console.log(`🔴 Utilisateur ${userId} déconnecté`);
      connectedUsers.delete(userId);
      userSessions.delete(socket.id);
      
      // Informer les autres utilisateurs que cet utilisateur est déconnecté
      socket.broadcast.emit('userOffline', { userId });
    } else {
      console.log('🔴 Socket déconnecté sans utilisateur associé:', socket.id);
    }
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
// server.listen(PORT, () => {
//   console.log(`🚀 API + WebSocket running on http://localhost:${PORT}`);
// });

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API + WebSocket running on http://192.168.1.15:${PORT}`);
});
