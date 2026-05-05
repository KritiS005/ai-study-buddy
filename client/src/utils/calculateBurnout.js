export const calculateBurnoutScore = (userData) => {
  const { moodLogs, tasks, dailyHours, plannedHours } = userData;
  
  if (!moodLogs || moodLogs.length === 0) return 0;
  
  // 1. Mood Factor (40%)
  const moodMap = { 'Excellent': 0, 'Good': 15, 'Okay': 30, 'Bad': 60, 'Very Bad': 90 };
  const avgMoodValue = moodLogs.slice(0, 7).reduce((acc, log) => acc + (moodMap[log.mood] || 30), 0) / Math.min(moodLogs.length, 7);
  
  // 2. Workload Factor (30%)
  const workloadRatio = plannedHours > 0 ? (dailyHours / plannedHours) : 0.5;
  const workloadScore = workloadRatio > 1.2 ? (workloadRatio - 1) * 100 : 0;
  
  // 3. Energy Factor (30%)
  const avgEnergy = moodLogs.slice(0, 7).reduce((acc, log) => acc + log.energyLevel, 0) / Math.min(moodLogs.length, 7);
  const energyScore = (10 - avgEnergy) * 10;
  
  const totalScore = (avgMoodValue * 0.4) + (workloadScore * 0.3) + (energyScore * 0.3);
  
  return Math.min(Math.round(totalScore), 100);
};

export const getRiskLevel = (score) => {
  if (score < 40) return { label: 'Low', color: 'emerald', tip: 'Doing great! Keep the consistency.' };
  if (score < 70) return { label: 'Medium', color: 'amber', tip: 'Warning: Consider taking more frequent breaks.' };
  return { label: 'High', color: 'red', tip: 'Alert: High burnout risk. Reduce workload immediately.' };
};
