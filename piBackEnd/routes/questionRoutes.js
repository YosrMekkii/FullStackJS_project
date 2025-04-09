import express from 'express';
const router = express.Router();
import questionController from '../controllers/questionController.js';

// Question routes
router.post('/', questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

export default  router;