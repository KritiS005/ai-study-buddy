import React, { useMemo } from 'react';
import {
  Trophy,
  Flame,
  Target,
  Star,
  Lock,
  CheckCircle2,
  Award,
  Zap,
  ShieldCheck,
  Crown,
  Heart,
  Medal,
  Brain,
  CalendarCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const Badge = ({ name, icon: Icon, description, unlocked, rarity }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`glass-card p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden ${
      !unlocked ? 'opacity-60 grayscale select-none' : ''
    }`}
  >
    {!unlocked && <Lock className="absolute top-4 right-4 text-slate-600" size={16} />}

    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center p-0.5 relative group ${
      unlocked
        ? 'bg-gradient-to-br from-violet-600 to-cyan-500 shadow-xl shadow-violet-600/20'
        : 'bg-white/10'
    }`}>
      <div className="w-full h-full rounded-[14px] bg-[#0A0F1E] flex items-center justify-center group-hover:scale-95 transition-transform">
        <Icon size={38} className={unlocked ? 'text-violet-300' : 'text-slate-600'} />
      </div>

      {unlocked && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-2 border border-dashed border-violet-500/30 rounded-full z-0"
        />
      )}
    </div>

    <div>
      <h4 className="font-bold text-sm mb-1">{name}</h4>
      <p className="text-[10px] text-slate-500 leading-tight">{description}</p>
    </div>

    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
      rarity === 'Legendary' ? 'bg-amber-500/10 text-amber-500' :
      rarity === 'Epic' ? 'bg-violet-500/10 text-violet-500' :
      'bg-slate-500/10 text-slate-400'
    }`}>
      {unlocked ? rarity : 'Locked'}
    </div>
  </motion.div>
);

const ProgressBar = ({ label, value, target, colorClass }) => {
  const pct = target ? Math.min(Math.round((value / target) * 100), 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">{pct}% ({value}/{target})</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const Gamification = () => {
  const {
    tasks = [],
    moodLogs = [],
    studyPlans = [],
    streak = 0,
    productivityScore = 0
  } = useAppContext();

  const stats = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.status === 'Done').length;
    const highPriorityDone = tasks.filter((task) => task.status === 'Done' && task.priority === 'High').length;

    const allSlots = studyPlans.flatMap((plan) => Array.isArray(plan.slots) ? plan.slots : []);
    const completedSlots = allSlots.filter((slot) => slot.status === 'done' || slot.status === 'Done').length;

    const goodMoodLogs = moodLogs.filter((log) => (
      ['good', 'excellent', 'excelent'].includes(String(log.mood).toLowerCase()) || Number(log.energy) >= 7
    )).length;

    const xp =
      completedTasks * 80 +
      highPriorityDone * 60 +
      completedSlots * 40 +
      Math.max(streak, 0) * 25 +
      goodMoodLogs * 20;

    const level = Math.max(Math.floor(xp / 500) + 1, 1);
    const currentLevelXp = xp % 500;
    const xpToNext = 500;

    return {
      completedTasks,
      highPriorityDone,
      completedSlots,
      goodMoodLogs,
      xp,
      level,
      currentLevelXp,
      xpToNext
    };
  }, [tasks, moodLogs, studyPlans, streak]);

  const badges = [
    {
      name: 'First Victory',
      icon: CheckCircle2,
      description: 'Complete your first task.',
      unlocked: stats.completedTasks >= 1,
      rarity: 'Common'
    },
    {
      name: 'Task Master',
      icon: Target,
      description: 'Complete 10 total tasks.',
      unlocked: stats.completedTasks >= 10,
      rarity: 'Epic'
    },
    {
      name: 'Priority Slayer',
      icon: Zap,
      description: 'Finish 3 high-priority tasks.',
      unlocked: stats.highPriorityDone >= 3,
      rarity: 'Epic'
    },
    {
      name: 'Consistency King',
      icon: Trophy,
      description: 'Maintain a 7-day study streak.',
      unlocked: streak >= 7,
      rarity: 'Legendary'
    },
    {
      name: 'Planner Pro',
      icon: CalendarCheck,
      description: 'Complete 5 study plan slots.',
      unlocked: stats.completedSlots >= 5,
      rarity: 'Common'
    },
    {
      name: 'Focus Champion',
      icon: Brain,
      description: 'Reach 80% productivity.',
      unlocked: productivityScore >= 80,
      rarity: 'Epic'
    },
    {
      name: 'Burnout Guard',
      icon: ShieldCheck,
      description: 'Log 5 mood or energy entries.',
      unlocked: moodLogs.length >= 5,
      rarity: 'Common'
    },
    {
      name: 'Legend Scholar',
      icon: Crown,
      description: 'Reach Level 5.',
      unlocked: stats.level >= 5,
      rarity: 'Legendary'
    }
  ];

  const unlockedCount = badges.filter((badge) => badge.unlocked).length;
  const levelProgress = Math.round((stats.currentLevelXp / stats.xpToNext) * 100);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold">Achievements & Stats</h2>
          <p className="text-slate-400">Unlock badges and climb the ranks based on your real progress</p>
        </div>

        <div className="glass-card p-4 min-w-[300px] border-violet-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              Level {stats.level} Explorer
            </span>
            <span className="text-xs font-black text-violet-400">
              {stats.currentLevelXp} / {stats.xpToNext} XP
            </span>
          </div>

          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              className="h-full bg-gradient-to-r from-violet-600 to-cyan-400"
            />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <Award className="text-violet-400" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Total XP</p>
              <h3 className="text-2xl font-black">{stats.xp}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <Medal className="text-amber-400" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Badges</p>
              <h3 className="text-2xl font-black">{unlockedCount}/{badges.length}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <Flame className="text-orange-400" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Streak</p>
              <h3 className="text-2xl font-black">{streak} Days</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <Star className="text-cyan-400" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Productivity</p>
              <h3 className="text-2xl font-black">{productivityScore}%</h3>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-6 underline decoration-violet-500 underline-offset-8">
          Badge Collection
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <Badge key={badge.name} {...badge} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Flame size={24} className="text-amber-500" />
            Streak Milestones
          </h3>

          <div className="space-y-6">
            <ProgressBar label="First Week" value={Math.min(streak, 7)} target={7} colorClass="bg-emerald-500" />
            <ProgressBar label="Habit Former" value={Math.min(streak, 14)} target={14} colorClass="bg-blue-500" />
            <ProgressBar label="Study Master" value={Math.min(streak, 30)} target={30} colorClass="bg-violet-500" />
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Heart size={24} className="text-rose-400" />
            Daily Challenge
          </h3>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-600/15 to-cyan-600/10 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-violet-600/20">
                <Target className="text-violet-300" />
              </div>

              <div>
                <h4 className="font-bold">Complete 2 focus tasks today</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Finish two pending tasks to gain extra XP and improve your productivity score.
                </p>

                <div className="mt-4">
                  <ProgressBar
                    label="Challenge Progress"
                    value={Math.min(stats.completedTasks, 2)}
                    target={2}
                    colorClass="bg-gradient-to-r from-violet-600 to-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Tip: XP updates automatically when you complete tasks, plan slots, and mood logs.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gamification;
