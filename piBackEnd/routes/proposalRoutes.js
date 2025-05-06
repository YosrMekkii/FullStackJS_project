import express from 'express';
import { createProposal, getAllProposals } from '../controllers/proposalController.js';
// optionnel : import protect middleware
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', /* protect, */ createProposal);
router.get('/', getAllProposals);

export default router;
