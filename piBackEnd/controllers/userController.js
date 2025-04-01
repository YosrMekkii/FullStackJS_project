const userService = require("../services/userService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user")
require('dotenv').config();
const Match = require('../models/Match');


// ✅ Créer un utilisateur
const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ message: "Utilisateur créé avec succès", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Récupérer un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json({ message: "Utilisateur mis à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Fonction pour l'inscription d'un utilisateur
const signupUser = async (req, res) => {
  try {
    console.log("Données reçues :", req.body); 
    const { firstName, lastName, email, password, age, country, city, educationLevel } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Le mot de passe est requis." });
    }
    // Vérification si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "L'email est déjà utilisé" });
    }

    // Hachage du mot de passe avant de le sauvegarder
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du nouvel utilisateur
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      country,
      city,
      educationLevel,
    });

    // Sauvegarde de l'utilisateur dans la base de données
    await newUser.save();

    // Génération d'un token JWT pour l'utilisateur
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Réponse avec le token
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: { id: newUser._id, email: newUser.email }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ✅ Fonction pour la connexion d'un utilisateur
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Vérification du mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }

    // Génération d'un token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Réponse avec le token
    res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: { id: user._id,firstName: user.firstName,lastName: user.lastName, email: user.email }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });}}

// ✅ Recommander des utilisateurs avec des compétences communes
const getRecommendations = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Fetch the current user by ID
    const currentUser = await userService.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch users with common skills (excluding the current user)
    const recommendedUsers = await userService.getUsersWithCommonSkills(userId, currentUser.skills);

    // Send the recommended users
    res.status(200).json({ recommendedUsers });
  } catch (error) {
    console.error("Error finding recommendations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Fetch users with matching skills
exports.getMatches = async (req, res) => {
  const userId = req.params.id;  // Extract user ID from the request params
  try {
      // Fetch match data using userId
      const match = await Match.findOne({ userId: userId });

      if (match) {
          return res.json(match);  // Send the match data if found
      } else {
          return res.status(404).json({ error: "Match not found" });  // Handle no match found
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });  // Handle any server errors
  }
};

// ✅ Update skills (skills offered)
const updateSkills = async (req, res) => {
  try {
    const { id } = req.params;
    const { skills } = req.body;

    const user = await userService.updateUser(id, { skills: skills });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json({ message: "Compétences mises à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update interests (skills wanted)
const updateInterests = async (req, res) => {
  try {
    const { id } = req.params;
    const { interests } = req.body;

    const user = await userService.updateUser(id, { interests: interests });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json({ message: "Intérêts mis à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await userService.getTotalUsers();
    res.status(200).json({ totalUsers });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du comptage des utilisateurs", error });
  }
};



// Fonction pour gérer l'upload de l'image de profil
const uploadProfileImage = async (req, res) => {
  const { userId } = req.params;
  const { file } = req; // Assurez-vous que le fichier est bien récupéré
  
  console.log("userId reçu :", userId);
  console.log("Fichier reçu :", file); // Debug pour vérifier le fichier reçu

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Logique de mise à jour de l'image
    user.profileImagePath = file.path; // Ou le champ où tu veux stocker l'image
    await user.save();
    
    res.status(200).json({ message: "Image de profil téléchargée avec succès", user });
  } catch (error) {
    console.error("Erreur dans le contrôleur :", error);
    res.status(500).json({ error: error.message });
  }
};



const blacklist = new Set(); // Liste noire pour stocker les tokens invalidés

const logoutUser = async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // Récupérer le token depuis le header

    if (!token) {
      return res.status(400).json({ error: "Aucun token fourni" });
    }

    blacklist.add(token); // Ajouter le token à la liste noire
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la déconnexion" });
  }
};



module.exports = {
  uploadProfileImage,
  getTotalUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  signupUser,
  loginUser,
  getRecommendations,// Export the recommendation function
  updateSkills,
  updateInterests,
  logoutUser,
};
