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

// ✅ Route pour récupérer les recommandations basées sur les compétences
router.get("/recommend", userController.getRecommendations);

// ✅ New route to update skills (skills offered)
router.put("/:id/skills", userController.updateSkills);

// ✅ New route to update interests (skills wanted)
router.put("/:id/interests", userController.updateInterests);

module.exports = router;
