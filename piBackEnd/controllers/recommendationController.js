// controllers/recommendationController.js
import recommendationService from '../services/recommendationService.js';
import User from '../models/user.js';

/**
 * Contrôleur pour gérer les recommandations de compétences
 */
const recommendationController = {
  /**
   * Récupère les recommandations de compétences pour un utilisateur spécifique
   * @param {Object} req - Requête Express (req.params.userId contient l'ID de l'utilisateur)
   * @param {Object} res - Réponse Express
   */
  getRecommendations: async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Valider l'ID utilisateur
      if (!userId) {
        return res.status(400).json({ error: "ID utilisateur requis" });
      }
      
      // Vérifier si l'utilisateur existe
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      
      // Récupérer les recommandations
      const limit = parseInt(req.query.limit) || 6;
      const recommendations = await recommendationService.getRecommendationsForUser(userId, limit);
      
      // Formater la réponse
      const formattedRecommendations = recommendationService.formatSkillsForResponse(recommendations);
      
      // Renvoyer les recommandations
      res.status(200).json(formattedRecommendations);
    } catch (error) {
      console.error("Erreur dans getRecommendations:", error);
      res.status(500).json({ error: error.message });
    }
  },
  
  /**
   * Récupère les intérêts d'un utilisateur spécifique
   * @param {Object} req - Requête Express (req.params.userId contient l'ID de l'utilisateur)
   * @param {Object} res - Réponse Express
   */
  getUserInterests: async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Valider l'ID utilisateur
      if (!userId) {
        return res.status(400).json({ error: "ID utilisateur requis" });
      }
      
      // Récupérer les intérêts de l'utilisateur
      const user = await User.findById(userId).select('interests');
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      
      // Renvoyer les intérêts
      res.status(200).json({ interests: user.interests || [] });
    } catch (error) {
      console.error("Erreur dans getUserInterests:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

export default recommendationController;