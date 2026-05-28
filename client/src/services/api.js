import axios from 'axios';
// api config
const api = axios.create({
  baseURL: 'https://ai-study-buddy-tph6.onrender.com/api',
});

export const aiService = {
  chat: (message, history = []) =>
    api.post('/ai/chat', { message, history }),
  generatePlan: (userData) =>
    api.post('/ai/generate-plan', { userData }),
  getBurnoutAdvice: (burnoutLevel, userData) =>
    api.post('/ai/burnout-advice', { burnoutLevel, userData }),
  getRecommendations: (activity) =>
    api.post('/ai/recommendations', { recentActivity: activity }),
  getDailyTip: () =>
    api.get('/ai/daily-tip'),
};

export default api;
