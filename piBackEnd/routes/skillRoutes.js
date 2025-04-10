import express from 'express';
import skillController from '../controllers/skillController.js';
import { authenticateToken } from '../services/userService.js';

const router = express.Router();


router.post('/skills', skillController.createSkill);
router.get('/skills', skillController.getAllSkills);
router.get('/skills/:id', skillController.getSkillById);
router.get('/user/:userId', skillController.getUserSkills);
router.put('/skills/:id', skillController.updateSkill);
router.delete('/skills/:id', skillController.deleteSkill);


export default router;