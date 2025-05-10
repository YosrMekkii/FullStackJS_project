import express from 'express';
import upload from '../middlewares/upload.js';
import ExpertApplication from '../models/ExpertApplication.js';
import { reviewApplication,getExpertApplications, submitExpertApplication,verifyCertificateByApplicationId } from '../controllers/expertApplicationController.js';

const router = express.Router();

/*// 📤 Envoi d’une demande d’expert avec fichier et motivation
router.post('/', upload.single('document'), async (req, res) => {
  try {
    const { userId, motivation } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Le document est requis.' });
    }

    const application = new ExpertApplication({
      user: userId,
      motivation,
      documentPath: req.file.path,
      documentFilename: req.file.originalname,
    });

    await application.save();

    res.status(201).json({ message: 'Demande d\'expert envoyée avec succès !', application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});*/
// POST /api/expert-applications
router.post('/', upload.single('document'), submitExpertApplication);
// Route pour récupérer toutes les applications d'experts
router.get('/applications', getExpertApplications);

// ✅ Route indépendante pour la vérification seule

router.get('/verify-certificate/:id', verifyCertificateByApplicationId);

// Route pour approuver ou rejeter une demande d'expert
router.put('/review/:id', reviewApplication);



export default router;
