const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// ✅ Route pour créer un utilisateur
router.post("/", userController.createUser);

// ✅ Route pour récupérer tous les utilisateurs
router.get("/", userController.getAllUsers);

// ✅ Route pour récupérer un utilisateur par ID
router.get("/:id", userController.getUserById);

// ✅ Route pour mettre à jour un utilisateur
router.put("/:id", userController.updateUser);

// ✅ Route pour supprimer un utilisateur
router.delete("/:id", userController.deleteUser);

// Route d'inscription
router.post('/signup', userController.signupUser);

// Route de connexion
router.post('/login', userController.loginUser);

module.exports = router;
