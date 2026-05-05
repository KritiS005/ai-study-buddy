import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Clock,
  Flame,
  CheckCircle2,
  Plus,
  Calendar,
  ArrowRight,
  BrainCircuit,
  Sparkles,
  User,
  Settings,
  Smile,
  Target,
  Trophy,
  BookOpen,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import StatCard from '../components/common/StatCard';
import ProgressRing from '../components/common/ProgressRing';

const getTodayISO = () => new Date().toISOString().slice(0, 10);

const getDeadlineLabel = (deadline) => {
  if (!deadline) return 'No deadline';

  const today = new Date(getTodayISO());
  const due = new Date(deadline);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days left`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser } = useAuth();

  const {
    tasks = [],
    moodLogs = [],
    studyPlans = [],
    settings,
    productivityScore = 0,
    streak = 0,
    updateTask,
    addTask
  } = useAppContext();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    subject: settings?.preferences?.defaultSubject || 'Computer Science',
    priority: 'Medium',
    deadline: getTodayISO(),
    estimatedHours: 1,
    notes: ''
  });

  const userName =
    settings?.profile?.fullName ||
    currentUser?.displayName ||
    'Scholar';

  const avatar =
    settings?.profile?.avatar ||
    currentUser?.photoURL ||
    '';

  const completedTasks = tasks.filter((task) => task.status === 'Done').length;
  const pendingTasks = tasks.filter((task) => task.status !== 'Done');

  const todayTasks = useMemo(() => {
    return pendingTasks
      .slice()
      .sort((a, b) => {
        const priorityRank = { High: 0, Medium: 1, Low: 2 };
        const priorityDiff = (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.deadline || '2099-12-31') - new Date(b.deadline || '2099-12-31');
      })
      .slice(0, 4);
  }, [pendingTasks]);

  const totalStudyHours = useMemo(() => {
    const fromTasks = tasks.reduce((sum, task) => {
      if (task.status === 'Done') return sum + Number(task.estimatedHours || 0);
      return sum;
    }, 0);

    const fromPlans = studyPlans.reduce((sum, plan) => {
      const slots = Array.isArray(plan.slots) ? plan.slots : [];
      return sum + slots.filter((slot) => slot.status === 'done' || slot.status === 'Done').length;
    }, 0);

    return Math.max(fromTasks, fromPlans);
  }, [tasks, studyPlans]);

  const latestMood = moodLogs?.[0];

  const moodText = latestMood
    ? `${latestMood.mood || 'Mood'} • Energy ${latestMood.energy || 0}/10`
    : 'No mood logged yet';

  const activePlan = studyPlans?.[0];
  const activePlanSlots = Array.isArray(activePlan?.slots) ? activePlan.slots : [];
  const completedSlots = activePlanSlots.filter((slot) => slot.status === 'done' || slot.status === 'Done').length;
  const planProgress = activePlanSlots.length
    ? Math.round((completedSlots / activePlanSlots.length) * 100)
    : 0;

  const aiTip = useMemo(() => {
    if (productivityScore >= 80) {
      return 'You are in a strong flow. Keep your hardest subject in your next focus block.';
    }

    if (pendingTasks.some((task) => task.priority === 'High')) {
      return 'Start with your high-priority task first. Use a 25-minute timer and remove distractions.';
    }

    if (latestMood && Number(latestMood.energy) <= 4) {
      return 'Your energy seems low. Try a lighter revision task or a short break before deep study.';
    }

    return 'Use active recall today: close your notes and explain the topic in your own words.';
  }, [productivityScore, pendingTasks, latestMood]);

  const handleTaskFormChange = (key, value) => {
    setTaskForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddTask = async (event) => {
    event.preventDefault();

    if (!taskForm.title.trim()) {
      showToast('Please enter a task title.', 'error');
      return;
    }

    try {
      setIsSavingTask(true);
      await addTask({
        ...taskForm,
        estimatedHours: Number(taskForm.estimatedHours || 1),
        status: 'Todo'
      });

      setTaskForm({
        title: '',
        subject: settings?.preferences?.defaultSubject || 'Computer Science',
        priority: 'Medium',
        deadline: getTodayISO(),
        estimatedHours: 1,
        notes: ''
      });

      setIsTaskModalOpen(false);
      showToast('Quick task added successfully.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to add task.', 'error');
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleMarkDone = async (task) => {
    try {
      await updateTask(task.id, { status: 'Done', completedAt: new Date().toISOString() });
      showToast('Task marked as done.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update task.', 'error');
    }
  };

  const dashboardCards = [
    {
      title: 'Planner',
      subtitle: activePlan ? `${planProgress}% plan completed` : 'Create your AI schedule',
      icon: Calendar,
      action: () => navigate('/planner'),
      accent: 'from-violet-600/20 to-cyan-600/10'
    },
    {
      title: 'Mood',
      subtitle: moodText,
      icon: Smile,
      action: () => navigate('/mood'),
      accent: 'from-emerald-600/20 to-cyan-600/10'
    },
    {
      title: 'Analytics',
      subtitle: `${productivityScore}% productivity`,
      icon: Activity,
      action: () => navigate('/analytics'),
      accent: 'from-cyan-600/20 to-violet-600/10'
    },
    {
      title: 'Rewards',
      subtitle: `${completedTasks} tasks completed`,
      icon: Trophy,
      action: () => navigate('/gamification'),
      accent: 'from-amber-600/20 to-violet-600/10'
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-950/40 via-[#111827]/70 to-cyan-950/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-[90px]" />
        <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-violet-600/25 blur-[90px]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/settings')}
              className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 p-0.5 shadow-xl shadow-violet-600/25 hover:scale-105 transition-all"
              title="Open Settings"
            >
              <div className="w-full h-full rounded-[22px] bg-[#0A0F1E] flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={34} className="text-violet-300" />
                )}
              </div>
            </button>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-400 mb-2">
                Student Command Center
              </p>
              <motion.h2
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl md:text-5xl font-black leading-tight"
              >
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                  {userName.split(' ')[0] || 'Scholar'}
                </span>
              </motion.h2>
              <p className="text-slate-400 mt-2">
                Your AI-powered study system is ready. Focus on the next best action.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-violet-600/25 active:scale-95"
            >
              <Plus size={20} />
              Quick Task
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-2xl font-bold transition-all"
            >
              <Settings size={20} />
              Settings
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard label="Study Hours" value={`${totalStudyHours}h`} icon={Clock} trend={12} colorClass="bg-cyan-500/10 text-cyan-400" />
        <StatCard label="Study Streak" value={`${streak} Days`} icon={Flame} colorClass="bg-amber-500/10 text-amber-400" />
        <StatCard label="Productivity" value={`${productivityScore}%`} icon={BarChart3} trend={productivityScore >= 70 ? 8 : -5} colorClass="bg-violet-500/10 text-violet-400" />
        <StatCard label="Tasks Done" value={completedTasks} icon={CheckCircle2} colorClass="bg-emerald-500/10 text-emerald-400" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass-card p-8 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h3 className="text-lg font-bold underline decoration-violet-500 underline-offset-8">Productivity Score</h3>
            <p className="text-xs text-slate-500 mt-3">Based on your completed tasks</p>
          </div>

          <ProgressRing radius={90} stroke={12} progress={productivityScore} />

          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">
              {productivityScore >= 80 ? 'Excellent momentum!' : productivityScore >= 50 ? 'Good progress. Keep going.' : 'Start with one small task.'}
            </p>
            <button
              onClick={() => navigate('/analytics')}
              className="mt-4 text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
            >
              View analytics <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Calendar size={20} className="text-violet-400" />
              Focus Tasks
            </h3>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs text-violet-400 hover:text-violet-300 font-bold inline-flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {todayTasks.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-violet-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-1 h-12 rounded-full ${
                      task.priority === 'High' ? 'bg-red-500' :
                      task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-semibold group-hover:text-violet-300 transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {task.subject || 'General'} • {task.estimatedHours || 1}h est. • {getDeadlineLabel(task.deadline)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getDeadlineLabel(task.deadline) === 'Overdue' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                      <AlertTriangle size={12} />
                      Overdue
                    </span>
                  )}
                  <button
                    onClick={() => handleMarkDone(task)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all border border-white/5"
                    title="Mark as done"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}

            {todayTasks.length === 0 && (
              <div className="text-center py-12 bg-white/[0.03] rounded-3xl border border-dashed border-white/10">
                <CheckCircle2 className="mx-auto text-emerald-400 mb-3" size={34} />
                <p className="text-slate-300 font-bold">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">Add a new focus task to continue your streak.</p>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-bold"
                >
                  Add Task
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {dashboardCards.map((card) => (
          <button
            key={card.title}
            onClick={card.action}
            className={`text-left glass-card p-5 hover:scale-[1.02] transition-all bg-gradient-to-br ${card.accent}`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                <card.icon size={22} className="text-cyan-300" />
              </div>
              <ArrowRight size={18} className="text-slate-500" />
            </div>
            <h4 className="font-bold text-lg">{card.title}</h4>
            <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-violet-900/40 to-blue-900/40 border border-violet-500/20 rounded-[32px] p-8 relative overflow-hidden">
          <BrainCircuit className="absolute -right-8 -bottom-8 w-48 h-48 text-violet-500/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-violet-400 mb-4">
              <Sparkles size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">AI Study Tip</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Your next best move</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">{aiTip}</p>
            <button
              onClick={() => navigate('/ai-study-buddy')}
              className="flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300"
            >
              Ask AI Study Buddy <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Target className="text-emerald-400" />
            Active Study Plan
          </h3>

          {activePlan ? (
            <div className="space-y-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{activePlan.title || 'AI Study Plan'}</span>
                <span className="font-bold text-cyan-400">{planProgress}%</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full"
                  style={{ width: `${planProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {completedSlots}/{activePlanSlots.length} focus slots completed.
              </p>
              <button
                onClick={() => navigate('/planner')}
                className="inline-flex items-center gap-2 text-sm font-bold text-violet-400 hover:text-violet-300"
              >
                Open planner <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-3xl bg-white/[0.03]">
              <BookOpen className="mx-auto text-cyan-400 mb-3" size={32} />
              <p className="font-bold">No active plan yet</p>
              <p className="text-xs text-slate-500 mt-1">Generate an AI plan from the Study Planner page.</p>
              <button
                onClick={() => navigate('/planner')}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-bold"
              >
                Create Plan
              </button>
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Add Quick Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Task Title</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(event) => handleTaskFormChange('title', event.target.value)}
              placeholder="e.g., Revise Computer Networks"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</label>
              <input
                type="text"
                value={taskForm.subject}
                onChange={(event) => handleTaskFormChange('subject', event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(event) => handleTaskFormChange('priority', event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deadline</label>
              <input
                type="date"
                value={taskForm.deadline}
                onChange={(event) => handleTaskFormChange('deadline', event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimated Hours</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={taskForm.estimatedHours}
                onChange={(event) => handleTaskFormChange('estimatedHours', event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes</label>
            <textarea
              value={taskForm.notes}
              onChange={(event) => handleTaskFormChange('notes', event.target.value)}
              placeholder="Optional task details..."
              className="w-full h-24 resize-none bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingTask}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-sm font-bold shadow-lg shadow-violet-600/20 disabled:opacity-60 transition-all"
            >
              {isSavingTask ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
