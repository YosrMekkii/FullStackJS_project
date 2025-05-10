// services/recommendationService.js
import Skill from '../models/skill.js'
import User from "../models/user.js";

/**
 * Service pour gérer les recommandations de compétences basées sur les intérêts utilisateur
 */
const recommendationService = {
  /**
   * Obtient des recommandations de compétences pour un utilisateur spécifique
   * @param {string} userId - ID de l'utilisateur
   * @param {number} limit - Nombre maximum de recommandations à retourner (défaut: 6)
   * @return {Promise<Array>} - Tableau de compétences recommandées
   */
  getRecommendationsForUser: async (userId, limit = 6) => {
    try {
      // 1. Récupérer l'utilisateur et ses intérêts
      const user = await User.findById(userId);
      if (!user || !user.interests || user.interests.length === 0) {
        return [];
      }

      // 2. Préparer les termes pour la recherche
      const interests = user.interests.map(interest => interest.toLowerCase());
      
      // 3. Construire la requête de recherche - Trouver les compétences qui:
      // - Ne sont pas créées par l'utilisateur actuel
      // - Correspondent aux intérêts par catégorie OU contiennent des mots-clés dans le titre/description
      const matchingSkills = await Skill.find({
        user: { $ne: userId }, // Exclure les compétences de l'utilisateur actuel
        $or: [
          { category: { $in: interests.map(i => new RegExp(i, 'i')) } }, // Correspondance de catégorie
          { title: { $in: interests.map(i => new RegExp(i, 'i')) } },    // Titre contient un intérêt
          { description: { $in: interests.map(i => new RegExp(i, 'i')) } } // Description contient un intérêt
        ]
      })
      .sort({ likes: -1 }) // Trier par popularité (nombre de likes)
      .limit(limit)
      .populate('user', 'firstName lastName'); // Récupérer les informations utilisateur
      
      // 4. Si pas assez de compétences trouvées, ajouter des skills populaires
      if (matchingSkills.length < limit) {
        const additionalCount = limit - matchingSkills.length;
        const existingIds = matchingSkills.map(skill => skill._id);
        
        const popularSkills = await Skill.find({
          user: { $ne: userId },
          _id: { $nin: existingIds } // Éviter les doublons
        })
        .sort({ likes: -1 })
        .limit(additionalCount)
        .populate('user', 'firstName lastName');
        
        return [...matchingSkills, ...popularSkills];
      }
      
      return matchingSkills;
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      throw error;
    }
  },
  
  /**
   * Formater les données de compétence pour l'affichage (similaire à getAllSkills)
   * @param {Array} skills - Tableau d'objets compétence
   * @return {Array} - Tableau formaté pour l'API
   */
  formatSkillsForResponse: (skills) => {
    return skills.map(skill => {
      const skillObj = skill.toObject ? skill.toObject() : skill;
      
      // Formater l'objet utilisateur
      if (skillObj.user) {
        if (typeof skillObj.user === 'string' || skillObj.user instanceof mongoose.Types.ObjectId) {
          // Si user est juste un ID
          skillObj.user = { _id: skillObj.user.toString() };
        } else {
          // Si user est un objet (après populate)
          skillObj.user = {
            _id: skillObj.user._id.toString(),
            name: `${skillObj.user.firstName} ${skillObj.user.lastName}`
          };
        }
      }
      
      return skillObj;
    });
  }
};

export default recommendationService;