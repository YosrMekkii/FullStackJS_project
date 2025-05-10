// routes/recommendationRoutes.js
import express from 'express';
import recommendationController from '../controllers/recommendationController.js';
//import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/recommendations/:userId
 * @desc    Obtenir des recommandations de compétences pour un utilisateur
 * @access  Privé
 */
router.get('/recommendations/:userId',  recommendationController.getRecommendations);

/**
 * @route   GET /api/users/interests/:userId
 * @desc    Obtenir les intérêts d'un utilisateur
 * @access  Privé
 */
router.get('/users/interests/:userId',  recommendationController.getUserInterests);

export default router;