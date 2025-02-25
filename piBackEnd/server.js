import express from 'express';
import mongoose from 'mongoose';
const cors = require('cors'); // ✅ Import CORS
const userRoutes = require('./routes/userRoutes'); // Import des routes utilisateurs
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/skillexchangedb')
  .then(() => console.log("✅ Connected to MongoDB!"))
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
  const recaptchaSecret = "6LcGAOAqAAAAAKAW6BF13HT6FCGSM_xJ5ks2Ss0D"; // Remplace par ta clé secrète reCAPTCHA
  const recaptchaVerifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`;

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

// Routes
app.use('/api/users', userRoutes);
app.use('/skill', skillRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
