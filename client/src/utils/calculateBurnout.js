export const calculateBurnoutScore = (userData) => {
  const { moodLogs, tasks, dailyHours, plannedHours } = userData;
  
  if (!moodLogs || moodLogs.length === 0) return 0;
  
  // 1. Mood Factor (40%)
  const moodMap = { excellent: 0, good: 15, okay: 30, bad: 60, 'very-bad': 90 };
  const recentLogs = moodLogs.slice(0, 7);
  const avgMoodValue = recentLogs.reduce((acc, log) => acc + (moodMap[log.mood] ?? 30), 0) / recentLogs.length;
  
  // 2. Workload Factor (30%)
  const workloadRatio = plannedHours > 0 ? (dailyHours / plannedHours) : 0.5;
  const workloadScore = workloadRatio > 1.2 ? (workloadRatio - 1) * 100 : 0;
  
  // 3. Energy Factor (30%)
  const avgEnergy = recentLogs.reduce((acc, log) => acc + Number(log.energy || 5), 0) / recentLogs.length;
  const energyScore = (10 - avgEnergy) * 10;
  
  const totalScore = (avgMoodValue * 0.4) + (workloadScore * 0.3) + (energyScore * 0.3);
  
  return Math.min(Math.round(totalScore), 100);
};

export const getRiskLevel = (score) => {
  if (score < 40) return { label: 'Low', color: 'emerald', tip: 'Doing great! Keep the consistency.' };
  if (score < 70) return { label: 'Medium', color: 'amber', tip: 'Warning: Consider taking more frequent breaks.' };
  return { label: 'High', color: 'red', tip: 'Alert: High burnout risk. Reduce workload immediately.' };
};
