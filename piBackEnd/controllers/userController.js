import * as userService from "../services/userService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from"../models/user.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { ObjectId } from 'mongodb'
import mongoose from 'mongoose';
import UserProgress from '../models/userProgress.js';
import Challenge from '../models/challenge.js';


import dotenv from 'dotenv';
dotenv.config();
import Match from '../models/match.js';



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
const getUsersByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide an array of user IDs" 
      });
    }

    console.log("Attempting to fetch users with IDs:", ids);

    // Convert string IDs to ObjectId if they're not already
    const objectIds = ids.map(id => {
      try {
        return typeof id === 'string' ? new ObjectId(id) : id;
      } catch (err) {
        console.warn(`Invalid ObjectId format for: ${id}`);
        return id; // Keep original if conversion fails
      }
    });

    // Query only against _id field since that's all we have now
    const users = await User.find(
      { _id: { $in: objectIds } },
      {
        _id: 1,
        firstName: 1,
        lastName: 1,
        location: 1,
        bio: 1,
        skills: 1,
        profileImagePath: 1
      }
    );

    console.log(`Found ${users.length} users out of ${ids.length} requested IDs`);

    // Format the response to match what the frontend expects
    const formattedResults = ids.map(id => {
      // Convert both to string for comparison
      const user = users.find(u => u._id.toString() === id.toString());
      
      return {
        id,
        user: user ? {
          id: user._id.toString(), // Use _id as the id in the response
          firstName: user.firstName,
          lastName: user.lastName,
          location: user.location || "",
          bio: user.bio || "",
          skills: user.skills || [],
          profileImagePath: user.profileImagePath || ""
        } : null,
        exists: !!user
      };
    });

    console.log(`Formatted ${formattedResults.length} results`);
    
    res.status(200).json({
      success: true,
      users: formattedResults
    });
  } catch (error) {
    console.error("Error fetching users by IDs:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching users",
      error: error.message
    });
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

 const getUserProgress = async (req, res) => {
  const userId = req.params.userId;
  
  try {
    console.log(`Fetching progress for user ID: ${userId}`);
    
    // Fetch all active challenges
    const challenges = await Challenge.find({ active: true });
    
    // Fetch user's progress for these challenges
    const userProgress = await UserProgress.find({ userId });
    
    // Map progress to challenges
    const progressMap = {};
    userProgress.forEach(progress => {
      progressMap[progress.challengeId.toString()] = {
        completed: progress.completed,
        progress: progress.progress,
        startedAt: progress.startedAt,
        completedAt: progress.completedAt
      };
    });
    
    // Create response with all challenges and their progress
    const result = challenges.map(challenge => ({
      challengeId: challenge._id,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      points: challenge.points,
      category: challenge.category,
      // If user has progress for this challenge, include it, otherwise set defaults
      progress: progressMap[challenge._id.toString()] || {
        completed: false,
        progress: 0,
        startedAt: null,
        completedAt: null
      }
    }));
    
    return res.status(200).json({
      success: true,
      progress: result
    });
  } catch (error) {
    console.error(`Error fetching progress for user ${userId}:`, error);
    return res.status(500).json({ 
      success: false,
      message: "Error fetching user progress",
      error: error.message
    });
  }
};

// Update user progress for a challenge
 const updateUserProgress = async (req, res) => {
  const { userId, challengeId } = req.params;
  const { progress, completed } = req.body;
  
  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if challenge exists
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found"
      });
    }
    
    // Find or create progress record
    let userProgress = await UserProgress.findOne({ userId, challengeId });
    
    if (!userProgress) {
      userProgress = new UserProgress({
        userId,
        challengeId,
        progress: progress || 0,
        completed: completed || false
      });
    } else {
      userProgress.progress = progress !== undefined ? progress : userProgress.progress;
      userProgress.completed = completed !== undefined ? completed : userProgress.completed;
    }
    
    // Add completedAt date if challenge is completed
    if (completed && !userProgress.completedAt) {
      userProgress.completedAt = new Date();
    }
    
    await userProgress.save();
    
    return res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      progress: userProgress
    });
  } catch (error) {
    console.error(`Error updating progress for user ${userId} on challenge ${challengeId}:`, error);
    return res.status(500).json({
      success: false,
      message: "Error updating user progress",
      error: error.message
    });
  }
};

// ✅ Fonction pour l'inscription d'un utilisateur
const signupUser = async (req, res) => {
  const { file } = req; // Fichier téléchargé via multer
  const { firstName, lastName, email, password, age, country, city, educationLevel } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ error: "Le mot de passe est requis." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "L'email est déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Création de l'utilisateur sans le profilImagePath au début
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      country,
      city,
      educationLevel,
      isVerified: false,
      verificationToken,
    });

    // Sauvegarder l'utilisateur sans l'URL de l'image de profil
    await newUser.save();

    // Si un fichier d'image est fourni, on l'upload
    if (file) {
      const profileImagePath = `/uploads/${file.filename}`;

      // Mise à jour de l'utilisateur avec le chemin de l'image de profil
      newUser.profileImagePath = profileImagePath;
      await newUser.save();
    }

    // Envoi de l'email de vérification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ghoumadhia01@gmail.com", 
        pass: "taxq sccq foja pfau", 
      },
    });

    const verificationLink = `http://localhost:3000/api/users/auth/verify/${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Vérification de votre compte",
      html: `<p>Bonjour ${firstName},</p>
             <p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour vérifier votre compte :</p>
             <a href="${verificationLink}">Vérifier mon compte</a>`,
    });

    res.status(201).json({ message: "Un e-mail de vérification a été envoyé." });
  } catch (error) {
    console.error("Erreur lors de l'inscription de l'utilisateur :", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Une erreur est survenue lors de l'inscription." });
    }
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

    // Vérification si le compte est vérifié
    if (!user.isVerified) {
      return res.status(400).json({ error: "Votre compte n'est pas vérifié. Veuillez vérifier votre email." });
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
      user: { 
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,  // Ajouter le rôle
        skills: user.skills,  // Ajouter les compétences
        interests: user.interests, 
        city: user.city,  // Ajouter la ville
        country: user.country,  // Ajouter le pays
        bio: user.bio,  // Ajouter la biographie
        educationLevel: user.educationLevel,  // Ajouter le niveau d'éducation
        dateInscription: user.dateInscription,  // Ajouter la date d'inscription
        isVerified: user.isVerified,  // Ajouter l'état de vérification
        profileImagePath: user.profileImagePath || ''  // Ajouter le chemin de l'image de profil (si disponible)
      }
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

// export const updateUserInterests = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
    
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }
//     // Update interests
//     user.interests = req.body.interests;
//     await user.save();
    
//     // Send back success response with updated user data
//     res.json({ user: user });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// };
 const getMatches = async (req, res) => {
  const userId = req.params.id;
  
  try {
    console.log(`Fetching matches for user ID: ${userId}`);
    
    // Fetch all matches where the current user is either the user or the matched user
    const matches = await Match.find({
      $or: [
        { userId: userId },
        { matchedUserId: userId }
      ]
    });
    
    console.log(`Found ${matches.length} matches for user ${userId}`);
    
    if (matches.length === 0) {
      return res.json([]);  // Return empty array instead of 404 error
    }
    
    return res.json(matches);
  } catch (error) {
    console.error(`Error fetching matches for user ${userId}:`, error);
    return res.status(500).json({ error: "Server error" });
  }
};

 const getMatchesFor = async (req, res) => {
  const userId = req.params.userId;
  
  try {
    console.log(`Fetching formatted matches for user ID: ${userId}`);
    
    // Find all matches where the current user is either the user or the matched user
    const matches = await Match.find({
      $or: [
        { userId: userId },
        { matchedUserId: userId }
      ]
    });
    
    if (matches.length === 0) {
      return res.json([]);  // Return empty array instead of 404 error
    }
    
    // Collect all the user IDs we need to fetch
    const userIds = matches.map(match => 
      match.userId === userId ? match.matchedUserId : match.userId
    );
    
    // Fetch all users at once
    const users = await User.find(
      { _id: { $in: userIds } },
      {
        _id: 1,
        firstName: 1,
        lastName: 1,
        location: 1,
        skills: 1,
        profileImagePath: 1
      }
    );
    
    // Map users to a dictionary for quick lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    // Build the final response with matched user details
    const formattedMatches = matches.map(match => {
      const matchedUserId = match.userId === userId ? match.matchedUserId : match.userId;
      const matchedUser = userMap[matchedUserId];
      
      return {
        _id: match._id,
        matchId: match._id,
        userId: match.userId,
        matchedUserId: match.matchedUserId,
        createdAt: match.createdAt,
        // Include matched user details
        matchedUser: matchedUser ? {
          _id: matchedUser._id,
          firstName: matchedUser.firstName,
          lastName: matchedUser.lastName,
          location: matchedUser.location,
          skills: matchedUser.skills,
          profileImagePath: matchedUser.profileImagePath
        } : null
      };
    });
    
    return res.json(formattedMatches);
  } catch (error) {
    console.error(`Error fetching formatted matches for user ${userId}:`, error);
    return res.status(500).json({ error: "Server error" });
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

// ✅ Update bio and achievements
const updateBioAndAchievements = async (req, res) => {
  try {
    const { id } = req.params;
    const { bio, achievements } = req.body;

    const user = await userService.updateUser(id, { bio, achievements });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json({ message: "Bio et réalisations mises à jour avec succès", user });
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


const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ error: "Token de vérification invalide ou expiré." });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // On supprime le token
    await user.save();

    // ✅ Redirection vers la page /interests après vérification réussie
    res.redirect(`http://localhost:5173/interests/${user._id}`);
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email :", error);
    res.redirect("http://localhost:5173/verify-email/error");
  }

};



const getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email; // Récupère l'email depuis les paramètres de l'URL

    // Recherche de l'utilisateur par email (s'assurer qu'on cherche dans le champ 'email' et non '_id')
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Retourner les informations de l'utilisateur si trouvé
    return res.status(200).json(user);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'utilisateur:", error);
    return res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    // Génère un token sécurisé
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 3600000; // 1 heure

    // Sauvegarde dans le user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpire;
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // Envoi de l'e-mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ghoumadhia01@gmail.com", 
        pass: "taxq sccq foja pfau", 
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `<p>Bonjour ${user.firstName},</p>
            <p>Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour le faire :</p>
            <a href="${resetLink}">Réinitialiser mon mot de passe</a><br/>
            <p>Ce lien expirera dans 1 heure.</p>`,
    });

    res.status(200).json({ message: "Email de réinitialisation envoyé avec succès." });
  } catch (error) {
    console.error("Erreur dans forgotPassword:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  console.log("Token reçu :", token);
  console.log("Token reçu :", newPassword);


  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Token invalide ou expiré" });
    }

    // Hash du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur dans resetPassword:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const updateUserInterests = async (req, res) => {
  const { id } = req.params;
  const { interests } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { interests }, // ou { $set: { interests } } si plus clair
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.status(200).json({ message: "Intérêts mis à jour avec succès", user: updatedUser });
  } catch (error) {
    console.error("Erreur updateUser:", error);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour" });
  }
};

export {
  updateUserInterests,
  forgotPassword,
  resetPassword,
  getUserByEmail,
  verifyEmail,
  uploadProfileImage,
  getTotalUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  signupUser,
  loginUser,
  getRecommendations,
  updateSkills,
  updateInterests,
  logoutUser,
  getUsersByIds,
  updateBioAndAchievements,
  getUserProgress,
  getMatchesFor,
  getMatches,
  updateUserProgress};
