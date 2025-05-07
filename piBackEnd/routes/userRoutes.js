import express from "express";
import * as userController from "../controllers/userController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// 📂 Configuration de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 📁 Dossier de stockage
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 🔥 Nom unique
  },
  });
/*// ✅ Route pour créer un utilisateur
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

// ✅ Route pour la déconnexion
router.post("/logout", userController.logoutUser);


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
*/

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers images sont acceptés !"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ✅ Routes utilisateurs
router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.post("/batch", userController.getUsersByIds);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.put("/interests/:id", userController.updateUser);
router.put("/skills/:id", userController.updateSkills);
router.put("/achievements/:id", userController.updateBioAndAchievements);


router.delete("/:id", userController.deleteUser);
//router.post("/signup", userController.signupUser);
router.post('/signup', upload.single('profileImage'), userController.signupUser);
router.post("/login", userController.loginUser);
router.get("/recommend", userController.getRecommendations);
router.put("/:id/skills", userController.updateSkills);
router.put("/:id/interests", userController.updateInterests);
router.get("/total/count", userController.getTotalUsers);
router.post("/upload/:userId", upload.single("profileImage"), userController.uploadProfileImage);
router.post("/logout", userController.logoutUser);
router.get("/api/auth/verify/:token", userController.verifyEmail);
router.get("/auth/verify/:token", userController.verifyEmail); // ✅
router.get('/email/:email', userController.getUserByEmail); // Appel de la fonction dans le controller
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);
router.get('/matches/:id', userController.getMatches);
export default router; // ✅ Export par défaut
