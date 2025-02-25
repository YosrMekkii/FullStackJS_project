const userService = require("../services/userService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user")
require('dotenv').config();

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
    const { firstName, lastName, email, password, age, country, educationLevel } = req.body;

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
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};





module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  signupUser,
  loginUser
};
