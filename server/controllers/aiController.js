import * as geminiService from "../services/geminiService.js";

const MAX_TEXT_LENGTH = 4_000;
const isText = (value, max = MAX_TEXT_LENGTH) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const validHistory = (history) => Array.isArray(history) && history.length <= 20 && history.every(
  (entry) => entry && ['user', 'assistant', 'model'].includes(entry.role) && isText(entry.content)
);

export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!isText(message) || !validHistory(history)) {
      return res.status(400).json({
        success: false,
        error: "Message must be 1-4000 characters and history must contain at most 20 valid messages."
      });
    }

    const response = await geminiService.getChatResponse(message, history);

    return res.status(200).json({
      success: true,
      response
    });
  } catch (error) {
    console.error("Chat error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get AI response"
    });
  }
};

export const generatePlan = async (req, res) => {
  try {
    const userData = req.body.userData || req.body;

    if (!userData || typeof userData !== 'object' || Array.isArray(userData)) {
      return res.status(400).json({
        success: false,
        error: "User data is required"
      });
    }

    const plan = await geminiService.generateStudyPlan(userData);

    return res.status(200).json({
      success: true,
      plan,
      data: plan
    });
  } catch (error) {
    console.error("Generate plan error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate study plan"
    });
  }
};

export const burnoutAdvice = async (req, res) => {
  try {
    const { burnoutLevel, userData } = req.body;

    if (burnoutLevel && !['low', 'medium', 'high'].includes(String(burnoutLevel).toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Invalid burnout level.' });
    }

    const advice = await geminiService.getBurnoutAdvice(
      burnoutLevel,
      userData || {}
    );

    return res.status(200).json({
      success: true,
      advice
    });
  } catch (error) {
    console.error("Burnout advice error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get burnout advice"
    });
  }
};

export const recommendations = async (req, res) => {
  try {
    const { recentActivity } = req.body;

    if (recentActivity !== undefined && !isText(recentActivity)) {
      return res.status(400).json({ success: false, error: 'Recent activity must be 1-4000 characters.' });
    }

    const suggestions = await geminiService.getRecommendations(
      recentActivity || "No recent activity"
    );

    return res.status(200).json({
      success: true,
      suggestions,
      data: suggestions
    });
  } catch (error) {
    console.error("Recommendations error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get recommendations"
    });
  }
};

export const dailyTip = async (req, res) => {
  try {
    const tip = await geminiService.getDailyTip();

    return res.status(200).json({
      success: true,
      tip
    });
  } catch (error) {
    console.error("Daily tip error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get daily tip"
    });
  }
};
