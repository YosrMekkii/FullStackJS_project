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
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/signup", userController.signupUser);
router.post("/login", userController.loginUser);
router.get("/recommend", userController.getRecommendations);
router.put("/:id/skills", userController.updateSkills);
router.put("/:id/interests", userController.updateInterests);
router.get("/total/count", userController.getTotalUsers);
router.post("/upload/:userId", upload.single("profileImage"), userController.uploadProfileImage);


export default router; // ✅ Export par défaut
