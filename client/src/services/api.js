import axios from 'axios';
import { auth } from '../firebase/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ai-study-buddy-tph6.onrender.com/api',
  timeout: 30_000,
});

api.interceptors.request.use(async (config) => {
  const user = auth?.currentUser;
  if (user) {
    config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }
  return config;
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
