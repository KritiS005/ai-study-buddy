import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smile, Frown, Meh, Angry, Laugh, Zap, Brain, Activity, History
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const moods = [
  { id: 'very-bad', label: 'Very Bad', icon: Angry, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' },
  { id: 'bad', label: 'Bad', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500' },
  { id: 'okay', label: 'Okay', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500' },
  { id: 'good', label: 'Good', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
  { id: 'excellent', label: 'Excellent', icon: Laugh, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500' }
];

const MoodTracker = () => {
  const { moodLogs, addMoodLog } = useAppContext();
  const { showToast } = useToast();
  const [selectedMood, setSelectedMood] = useState(null);
  const [energy, setEnergy] = useState(7);
  const [note, setNote] = useState('');

  const selectedMoodObj = moods.find((mood) => mood.id === selectedMood);

  const insight = useMemo(() => {
    if (!moodLogs.length) return 'Start logging your mood daily to receive better study suggestions.';
    const averageEnergy = moodLogs.reduce((sum, log) => sum + Number(log.energy || 0), 0) / moodLogs.length;

    if (averageEnergy >= 8) return 'Your energy trend is strong. Use this time for difficult subjects and deep work.';
    if (averageEnergy <= 4) return 'Your energy trend is low. Add short breaks and avoid overloading your task list.';
    return 'Your energy is balanced. Keep using planner blocks and review your hardest topic first.';
  }, [moodLogs]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMoodObj) {
      showToast('Please select your mood first.', 'error');
      return;
    }

    try {
      await addMoodLog({
        mood: selectedMoodObj.id,
        label: selectedMoodObj.label,
        energy,
        note
      });

      setSelectedMood(null);
      setEnergy(7);
      setNote('');
      showToast('Mood logged successfully. +20 XP', 'success');
    } catch (error) {
      console.error(error);
      showToast('Mood log failed.', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-bold">Mood & Energy</h2>
        <p className="text-slate-400">Track your mental well-being to avoid burnout</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 glass-card p-8">
          <h3 className="text-xl font-bold mb-8 underline decoration-cyan-500 underline-offset-8">
            How are you feeling?
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
            {moods.map((mood) => {
              const Icon = mood.icon;
              const active = selectedMood === mood.id;

              return (
                <button
                  type="button"
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all ${
                    active ? `${mood.border} ${mood.bg} scale-105` : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Icon size={32} className={mood.color} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Zap size={18} className="text-amber-400" />
                  Energy Level
                </label>
                <span className="text-2xl font-black text-amber-400">{energy}</span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-amber-500"
              />

              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                <span>Drained</span>
                <span>Average</span>
                <span>Hyper</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold block ml-1">Daily Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What triggered this mood? Any productive wins or setbacks?"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-violet-500/50 focus:outline-none h-24 resize-none"
              />
            </div>

            <button
              disabled={!selectedMood}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white rounded-2xl font-bold shadow-xl shadow-cyan-600/20 transition-all active:scale-95"
            >
              Log Statistics
            </button>
          </div>
        </form>

        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-l-4 border-violet-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-violet-600/20 text-violet-400 rounded-lg">
                <Brain size={20} />
              </div>
              <h4 className="font-bold">AI Insight</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed italic">"{insight}"</p>
          </div>

          <div className="glass-card p-6">
            <h4 className="font-bold flex items-center gap-2 mb-6">
              <History size={18} className="text-slate-400" />
              Recent Logs
            </h4>

            <div className="space-y-4">
              {moodLogs.slice(0, 5).map((log) => {
                const mood = moods.find((item) => item.id === log.mood) || moods[2];
                const Icon = mood.icon;
                const dateValue = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp || Date.now());

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={18} className={mood.color} />
                        <span className="text-sm font-bold">{log.label}</span>
                      </div>
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        <Activity size={13} />
                        {log.energy}/10
                      </span>
                    </div>

                    {log.note && <p className="text-xs text-slate-500 mt-2">{log.note}</p>}
                    <p className="text-[10px] text-slate-600 mt-2">
                      {dateValue.toLocaleString()}
                    </p>
                  </motion.div>
                );
              })}

              {moodLogs.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No mood logs yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
