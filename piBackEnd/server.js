const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ Import CORS
const userRoutes = require('./routes/userRoutes'); // Import des routes utilisateurs

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware pour activer CORS AVANT les routes
app.use(cors({
  origin: 'http://localhost:5173', // ✅ Autoriser uniquement le frontend
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

// ✅ Middleware pour parser les requêtes JSON
app.use(express.json());

// ✅ Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/skillexchangedb')
  .then(() => console.log("✅ Connected to MongoDB!"))
  .catch(error => console.error("❌ Database connection error:", error));

// ✅ Route principale (test)
app.get('/', (req, res) => {
  res.send('🚀 SkillExchange API is running...');
});

// ✅ Intégration des routes utilisateurs
app.use('/api/users', userRoutes);

// ✅ Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
