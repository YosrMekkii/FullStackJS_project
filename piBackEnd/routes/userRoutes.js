
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
// ✅ Route pour récupérer les recommandations basées sur les compétences
router.get("/recommend", userController.getRecommendations);

// ✅ New route to update skills (skills offered)
router.put("/:id/skills", userController.updateSkills);

// ✅ New route to update interests (skills wanted)
router.put("/:id/interests", userController.updateInterests);



router.patch("/:userId/visibility", async (req, res) => {
    // const { userId } = req.params;
    // const { isVisible } = req.body;

    // try {
    //     const user = await User.findByIdAndUpdate(userId, { isVisible }, { new: true });

    //     if (!user) {
    //         return res.status(404).json({ error: "User not found" });
    //     }

    //     res.json({ message: "Visibility updated successfully", user });
    // } catch (error) {
    //     console.error("Error updating visibility:", error);
    //     res.status(500).json({ error: "Internal server error" });
    // }
});


// ✅ Obtenir le nombre total d'utilisateurs
router.get("/total/count", userController.getTotalUsers);

module.exports = router;
