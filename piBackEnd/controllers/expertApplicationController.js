import ExpertApplication from '../models/ExpertApplication.js';
import User from '../models/user.js';

export const submitExpertApplication = async (req, res) => {
  try {
    const { motivation } = req.body;
    const userId = req.user._id; // récupéré via middleware auth
    const file = req.file;

    const existing = await ExpertApplication.findOne({ user: userId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: "Vous avez déjà une demande en cours." });
    }

    const application = new ExpertApplication({
      user: userId,
      motivation,
      documentPath: file?.path,
      documentFilename: file?.filename
    });

    await application.save();

    res.status(201).json({ message: "Demande envoyée avec succès.", application });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la demande", error });
  }
};

// Fonction pour récupérer toutes les applications d'experts
export const getExpertApplications = async (req, res) => {
    try {
      // Recherche des applications d'experts
      const applications = await ExpertApplication.find()
        .populate('user', 'firstName lastName email') // Peupler les informations de l'utilisateur
        .exec();
  
      if (!applications) {
        return res.status(404).json({ message: "Aucune application trouvée." });
      }
  
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des applications", error });
    }
  };
