export const demoTasks = [
  { id: '1', title: 'Calculus Assignment', subject: 'Mathematics', deadline: '2026-05-02T14:00:00', priority: 'High', status: 'Todo', estimatedHours: 3 },
  { id: '2', title: 'React Hooks Deep Dive', subject: 'Computer Science', deadline: '2026-05-03T10:00:00', priority: 'Medium', status: 'In Progress', estimatedHours: 5 },
  { id: '3', title: 'History Essay', subject: 'History', deadline: '2026-05-05T23:59:00', priority: 'Low', status: 'Todo', estimatedHours: 4 },
  { id: '4', title: 'Lab Report', subject: 'Physics', deadline: '2026-05-01T18:00:00', priority: 'High', status: 'Done', estimatedHours: 2 },
];

export const demoMoodLogs = [
  { id: '1', mood: 'Excellent', energyLevel: 9, note: 'Productive day!', timestamp: '2026-04-30T10:00:00' },
  { id: '2', mood: 'Good', energyLevel: 7, note: 'Finished math tasks', timestamp: '2026-04-29T10:00:00' },
  { id: '3', mood: 'Okay', energyLevel: 5, note: 'Feeling a bit tired', timestamp: '2026-04-28T10:00:00' },
];

export const demoNotifications = [
  { id: '1', type: 'Task Due', title: 'Deadline Approaching', message: 'Calculus Assignment is due in 2 hours!', read: false, createdAt: 'Just now' },
  { id: '2', type: 'AI Tip', title: 'Daily Study Tip', message: 'Use active recall for your history essay today.', read: false, createdAt: '2 hours ago' },
  { id: '3', type: 'Badge', title: 'Badge Unlocked!', message: 'You earned the "Night Owl" badge!', read: true, createdAt: 'Yesterday' },
];

export const demoStudyPlan = [
  { subject: 'Computer Science', topic: 'Algorithm Complexity', startTime: '09:00', endTime: '11:00', duration: '2h', difficulty: 'Intensive', status: 'done' },
  { subject: 'Mathematics', topic: 'Integrals Part 2', startTime: '12:00', endTime: '14:00', duration: '2h', difficulty: 'Balanced', status: 'pending' },
  { subject: 'Physics', topic: 'Quantum Basics', startTime: '15:00', endTime: '16:30', duration: '1.5h', difficulty: 'Easy', status: 'pending' },
];
