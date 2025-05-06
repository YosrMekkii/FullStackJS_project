import express from 'express';
import { getSuggestions } from '../controllers/aiController.js';
//import { getSuggestionsForUser } from '../controllers/aiController.js';
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/suggestions', /* protect, */ getSuggestions);

//router.get('/suggestions/:userId', getSuggestionsForUser);


export default router;
