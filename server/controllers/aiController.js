import * as geminiService from "../services/geminiService.js";

export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
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

    if (!userData) {
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