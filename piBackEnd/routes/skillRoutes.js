import express from 'express';
import skillController from '../controllers/skillController.js';
import { authenticateToken } from '../services/userService.js';
import { upload } from '../controllers/skillController.js'; // Import the upload middleware

const router = express.Router();

// Public routes (no authentication required)
router.get('/skills', skillController.getAllSkills);
router.get('/skills/:id', skillController.getSkillById);
router.get('/user/:userId', skillController.getUserSkills);

// Protected routes (authentication required)
// Utilisez le middleware d'authentification si vous le souhaitez
// router.use(authenticateToken);

// Ajout du middleware upload.single pour la gestion des images
router.put('/skills/:id', upload.single('image'),  skillController.updateSkill);
router.delete('/skills/:id', skillController.deleteSkill);
router.post('/skills', upload.single('image'), skillController.createSkill);

export default router;