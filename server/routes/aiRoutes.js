import express from "express";
import * as aiController from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", aiController.chat);
router.post("/generate-plan", aiController.generatePlan);
router.post("/burnout-advice", aiController.burnoutAdvice);
router.post("/recommendations", aiController.recommendations);
router.get("/daily-tip", aiController.dailyTip);

export default router;
