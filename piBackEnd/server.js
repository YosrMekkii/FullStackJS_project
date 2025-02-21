const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());
const User = require('../piBackEnd/models/user');



// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/skillexchangedb')
  .then(async () => {
    console.log("✅ Connected to MongoDB!");

    const newUser = new User({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: "hashedpassword",
      age: 25,
      country: "France",
      educationLevel: "Bachelor",
      interests: ["Coding", "Gaming"],
      skills: ["Node.js", "React"],
    });

    await newUser.save();
    console.log("✅ Test user inserted!");
    mongoose.connection.close();
  })
  .catch(error => console.error("❌ Error:", error));

// Route de test
app.get('/', (req, res) => {
    res.send('🚀 Server is running...');
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});




