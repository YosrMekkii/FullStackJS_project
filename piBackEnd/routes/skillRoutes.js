const express = require('express');
const skillController = require('../controllers/skillController');

const router = express.Router();

router.post('/skills', skillController.createSkill);
router.get('/skills', skillController.getAllSkills);
router.get('/skills/:id', skillController.getSkillById);
router.put('/skills/:id', skillController.updateSkill);
router.delete('/skills/:id', skillController.deleteSkill);

module.exports = router;
