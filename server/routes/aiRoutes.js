import express from "express";
import * as aiController from "../controllers/aiController.js";
import { verifyToken } from '../middleware/auth.js';
import { aiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

router.use(verifyToken, aiRateLimit());
router.post("/chat", aiController.chat);
router.post("/generate-plan", aiController.generatePlan);
router.post("/burnout-advice", aiController.burnoutAdvice);
router.post("/recommendations", aiController.recommendations);
router.get("/daily-tip", aiController.dailyTip);

export default router;
