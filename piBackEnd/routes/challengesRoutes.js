// routes/challengeRoutes.js
import express from "express";
import * as challengeController from "../controllers/challengeController.js";

const router = express.Router();


// ✅ Routes des challenges
router.get("/", challengeController.getAllChallenges);
router.get("/daily", challengeController.getDailyChallenges);
router.get("/personalized", challengeController.getPersonalizedChallenges);
router.get("/recommended", challengeController.getRecommendedChallenges);
router.get("/completed", challengeController.getCompletedChallenges);
router.get("/:id", challengeController.getChallengeById);
router.post("/complete", challengeController.completeChallenge);
router.get("/user/progress", challengeController.getUserProgress);
router.post('/batch', challengeController.getChallengesByIds);  

export default router;
