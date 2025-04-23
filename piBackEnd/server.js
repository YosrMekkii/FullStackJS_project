import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import url from 'url'; 
import './models/user.js'; // juste pour enregistrer le modèle
import './models/report.js';

import userRoutes from './routes/userRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import reportRoutes from "./routes/reportRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import openaiRoutes from './routes/openaiRoutes.js'; // Add this line near other route imports


import cors from 'cors'; // ✅ Import CORS
//import imageModel from './models/image.model.js';
//const userRoutes = require('./routes/userRoutes'); // Import des routes utilisateurs


const app = express();
const PORT = process.env.PORT || 3000;
// ✅ Middleware pour parser les requêtes JSON
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173', // ✅ Autoriser uniquement le frontend
  methods: 'GET,POST,PATCH,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

// Connexion à MongoDB
mongoose.connect('mongodb+srv://ayari2014khalil:skillexchangedb@skillexchangedb.jyc2i.mongodb.net/')  .then(() => console.log("✅ Connected to MongoDB!"))
  .catch(error => console.error("❌ Database connection error:", error));

// Route principale (test)
app.get('/', (req, res) => {
  res.send('🚀 SkillExchange API is running...');
});

// Route de connexion
app.post("/api/login", async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ success: false, message: "reCAPTCHA manquant." });
  }

  // Vérifier le token reCAPTCHA avec Google
  const recaptchaSecret1 = "6LcGAOAqAAAAABnRcsfkKtY9aOaFyCwODtQ2J-UC"; // Remplace par ta clé secrète reCAPTCHA
  const recaptchaVerifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret1}&response=${recaptchaToken}`;

  try {
    const response = await fetch(recaptchaVerifyURL, { method: "POST" });
    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ success: false, message: "Échec de la vérification reCAPTCHA." });
    }

    // Vérification réussie, ici tu peux vérifier l'email et le mot de passe en base de données
    res.json({ success: true, message: "Connexion réussie !" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});



// ✅ Middleware pour activer CORS AVANT les routes


const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Define the upload folder path correctly
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Dossier où stocker les images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique
  }
});

// Vérifier l'extension du fichier
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers images sont acceptés !'), false);
  }
};

// Initialiser multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Route pour uploader une image
app.post('/upload', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier téléchargé' });
    }
    
    res.json({ message: 'Image téléchargée avec succès', filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






// Routes
app.use('/api/users', userRoutes);
app.use('/skill', skillRoutes);
app.use("/api/reports", reportRoutes);
app.use("/questions", questionRoutes);
app.use("/api/matches", matchRoutes);
app.use('/uploads', express.static('uploads'));
app.use("/api/openai", openaiRoutes); // Add this before 404 handler



app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
