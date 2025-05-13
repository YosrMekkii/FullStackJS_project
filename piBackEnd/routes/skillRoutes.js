import express from 'express';
import skillController from '../controllers/skillController.js';

const router = express.Router();

router.post('/skills', skillController.createSkill);
router.get('/skills', skillController.getAllSkills);
router.get('/skills/:id', skillController.getSkillById);
router.put('/skills/:id', skillController.updateSkill);
router.delete('/skills/:id', skillController.deleteSkill);
router.post('/skills/:id/like', skillController.likeSkill);
router.post('/skills/:id/unlike', skillController.unlikeSkill);
export default router;