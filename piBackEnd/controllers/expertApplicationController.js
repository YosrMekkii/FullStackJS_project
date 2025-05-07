import ExpertApplication from '../models/ExpertApplication.js';
import User from '../models/user.js';
import { checkCertificate } from '../services/certificateChecker.js'; // 👈 Ajouter cette ligne
import fs from 'fs';


export const submitExpertApplication = async (req, res) => {
    try {
      const { userId, motivation } = req.body;
  
      if (!req.file) {
        return res.status(400).json({ error: 'Le document est requis.' });
      }
  
      const existing = await ExpertApplication.findOne({ user: userId, status: 'pending' });
      if (existing) {
        return res.status(400).json({ message: "Vous avez déjà une demande en cours." });
      }
      
  
      const application = new ExpertApplication({
        user: userId,
        motivation,
        documentPath: req.file.path.replace(/\\/g, '/'), // Normalize path
        documentFilename: req.file.originalname,
      });
  
      await application.save();
  
      res.status(201).json({ message: "Demande d'expert envoyée avec succès !", application });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

// Fonction pour récupérer toutes les applications d'experts
export const getExpertApplications = async (req, res) => {
    try {
      // Recherche des applications d'experts
      const applications = await ExpertApplication.find()
        .populate('user') // Peupler les informations de l'utilisateur
        .exec();
  
      if (!applications) {
        return res.status(404).json({ message: "Aucune application trouvée." });
      }
  
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des applications", error });
    }
  };

  export const verifyCertificateByApplicationId = async (req, res) => {
    try {
      const { id } = req.params;
  
      const application = await ExpertApplication.findById(id).populate('user');
      if (!application) {
        return res.status(404).json({ error: 'Demande non trouvée.' });
      }
  
      if (!application.documentPath) {
        return res.status(400).json({ error: 'Aucun document à vérifier pour cette demande.' });
      }
  
      const filePath = application.documentPath;
  
      // Vérifie que le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier introuvable.' });
      }
  
      const { valid, extractedText, error } = await checkCertificate(filePath);
  
      return res.status(200).json({
        valid,
        extrait: extractedText,
        erreurVision: error || null,
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur serveur lors de la vérification du certificat.' });
    }
  };
  

  
