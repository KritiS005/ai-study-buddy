import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { aiService } from '../services/api';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

const SUBJECT_COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-emerald-500'
];

const fallbackPlan = (formData, selectedDate) => {
  const subjects = formData.subjects
    .split(',')
    .map((subject) => subject.trim())
    .filter(Boolean);

  const safeSubjects = subjects.length
    ? subjects
    : ['Computer Networks', 'DSA', 'DBMS'];

  return safeSubjects.map((subject, index) => ({
    id: `${Date.now()}-${index}`,
    date: selectedDate,
    startTime:
      index === 0
        ? '09:00 AM'
        : index === 1
        ? '12:00 PM'
        : index === 2
        ? '04:00 PM'
        : '07:00 PM',
    duration: `${Math.max(45, Number(formData.dailyHours || 3) * 20)} min`,
    subject,
    topic: formData.weakTopics || `Revise important concepts of ${subject}`,
    difficulty: formData.difficulty || 'Balanced',
    status: 'pending'
  }));
};

const StudyPlanner = () => {
  const { showToast } = useToast();

  const {
    studyPlans = [],
    saveStudyPlan,
    updateStudyPlan
  } = useAppContext();

  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [activeView, setActiveView] = useState('Daily');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [formData, setFormData] = useState({
    subjects: '',
    weakTopics: '',
    dailyHours: 4,
    difficulty: 'Balanced',
    preferredTime: 'Afternoon'
  });

  const activePlan = studyPlans?.[0];
  const planSlots = Array.isArray(activePlan?.slots) ? activePlan.slots : [];

  const currentMonth = calendarDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  const daysInMonth = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + 1,
    0
  ).getDate();

  const visiblePlans = useMemo(() => {
    if (activeView === 'Daily') {
      return planSlots.filter((slot) => slot.date === selectedDate);
    }

    const selected = new Date(selectedDate);

    const weekStart = new Date(selected);
    weekStart.setDate(selected.getDate() - selected.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return planSlots.filter((slot) => {
      const date = new Date(slot.date);
      return date >= weekStart && date <= weekEnd;
    });
  }, [planSlots, activeView, selectedDate]);

  const subjectList = useMemo(() => {
    const counts = planSlots.reduce((acc, slot) => {
      const subject = slot.subject || 'General';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(counts).map(([subj, count], index) => ({
      subj,
      color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
      pct: Math.round((count / total) * 100)
    }));
  }, [planSlots]);

  const changeMonth = (direction) => {
    const next = new Date(calendarDate);
    next.setMonth(next.getMonth() + direction);
    setCalendarDate(next);
  };

  const getSubjectsArray = () => {
    return formData.subjects
      .split(',')
      .map((subject) => subject.trim())
      .filter(Boolean);
  };

  const normalizeGeneratedPlan = (generated, payload) => {
    if (Array.isArray(generated)) {
      return generated.map((slot, index) => ({
        id: slot.id || `${Date.now()}-${index}`,
        date: slot.date || selectedDate,
        startTime: slot.startTime || slot.time || '09:00 AM',
        duration: slot.duration || '45 min',
        subject:
          slot.subject ||
          payload.subjects[index % payload.subjects.length] ||
          'General',
        topic: slot.topic || slot.task || `Study ${slot.subject || 'topic'}`,
        difficulty: slot.difficulty || formData.difficulty,
        status: slot.status || 'pending'
      }));
    }

    if (generated && Array.isArray(generated.slots)) {
      return generated.slots.map((slot, index) => ({
        id: slot.id || `${Date.now()}-${index}`,
        date: slot.date || selectedDate,
        startTime: slot.startTime || slot.time || '09:00 AM',
        duration: slot.duration || '45 min',
        subject:
          slot.subject ||
          payload.subjects[index % payload.subjects.length] ||
          'General',
        topic: slot.topic || slot.task || `Study ${slot.subject || 'topic'}`,
        difficulty: slot.difficulty || formData.difficulty,
        status: slot.status || 'pending'
      }));
    }

    return fallbackPlan(formData, selectedDate);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!formData.subjects.trim()) {
      showToast('Please enter at least one subject.', 'error');
      return;
    }

    if (!saveStudyPlan) {
      showToast('saveStudyPlan function is missing from AppContext.', 'error');
      return;
    }

    setIsGenerating(true);
    setShowGenModal(false);

    const payload = {
      ...formData,
      subjects: getSubjectsArray(),
      selectedDate,
      examDates: 'Next month',
      breakPreference: 'Pomodoro'
    };

    try {
      console.log('Sending AI plan payload:', payload);

      const response = await aiService.generatePlan(payload);

      console.log('AI plan response:', response.data);

      const generated =
        response?.data?.plan ||
        response?.data?.data ||
        response?.data?.studyPlan ||
        response?.data?.slots ||
        response?.data;

      const slots = normalizeGeneratedPlan(generated, payload);

      if (!Array.isArray(slots) || slots.length === 0) {
        throw new Error('AI returned an empty study plan.');
      }

      await saveStudyPlan({
        title: 'AI Study Plan',
        subjects: payload.subjects,
        slots
      });

      showToast('AI Study Plan generated successfully! 🧠', 'success');
    } catch (error) {
      console.error('Generate AI plan failed:', error);

      const backendError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Unknown error';

      console.log('Real AI plan error:', backendError);

      const slots = fallbackPlan(formData, selectedDate);

      try {
        await saveStudyPlan({
          title: 'Offline Study Plan',
          subjects: getSubjectsArray(),
          slots
        });

        showToast(`AI failed: ${backendError}. Offline plan saved.`, 'error');
      } catch (fallbackSaveError) {
        console.error('Fallback plan save failed:', fallbackSaveError);
        showToast(
          fallbackSaveError?.message || 'AI and fallback save both failed.',
          'error'
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlanDone = async (slotId) => {
    if (!activePlan || !Array.isArray(activePlan.slots)) {
      showToast('No active study plan found.', 'error');
      return;
    }

    if (!updateStudyPlan) {
      showToast('updateStudyPlan function is missing from AppContext.', 'error');
      return;
    }

    const updatedSlots = activePlan.slots.map((slot) =>
      slot.id === slotId
        ? {
            ...slot,
            status: slot.status === 'done' ? 'pending' : 'done'
          }
        : slot
    );

    try {
      await updateStudyPlan(activePlan.id, {
        slots: updatedSlots
      });

      showToast('Study slot updated.', 'success');
    } catch (error) {
      console.error('Update study slot failed:', error);
      showToast(error?.message || 'Failed to update study slot.', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Smart Planner</h2>
          <p className="text-slate-400">
            AI-optimized schedules for maximum retention
          </p>
        </div>

        <button
          onClick={() => setShowGenModal(true)}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-violet-600/20 active:scale-95 transition-all disabled:opacity-60"
        >
          <Sparkles size={18} />
          {isGenerating ? 'Generating...' : 'Generate AI Plan'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">{currentMonth}</h3>

              <div className="flex gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={() => changeMonth(1)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm">
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const date = new Date(
                  calendarDate.getFullYear(),
                  calendarDate.getMonth(),
                  index + 1
                );

                const key = date.toISOString().slice(0, 10);
                const hasPlan = planSlots.some((slot) => slot.date === key);

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    className={`p-2 rounded-xl cursor-pointer hover:bg-violet-500/20 transition-colors relative ${
                      selectedDate === key
                        ? 'bg-violet-600 font-bold text-white'
                        : 'bg-transparent'
                    }`}
                  >
                    {index + 1}

                    {hasPlan && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" />
              Focus Distribution
            </h4>

            <div className="space-y-3">
              {subjectList.map((item) => (
                <div key={item.subj} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>{item.subj}</span>
                    <span>{item.pct}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}

              {subjectList.length === 0 && (
                <p className="text-xs text-slate-500">No plan yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold underline decoration-violet-500 underline-offset-8">
              Focus Schedule
            </h3>

            <div className="flex bg-white/5 p-1 rounded-xl">
              {['Daily', 'Weekly'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeView === view
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + selectedDate + (activePlan?.id || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5"
            >
              {visiblePlans.map((slot, index) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-12"
                >
                  <div
                    className={`absolute left-2.5 top-0 w-3.5 h-3.5 rounded-full border-2 border-[#0A0F1E] z-10 ${
                      slot.status === 'done'
                        ? 'bg-emerald-500'
                        : 'bg-slate-600'
                    }`}
                  />

                  <div
                    className={`glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${
                      slot.difficulty === 'Intensive'
                        ? 'border-l-red-500'
                        : slot.difficulty === 'Balanced'
                        ? 'border-l-amber-500'
                        : 'border-l-emerald-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center min-w-[70px] py-1 px-2 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs font-bold text-white">
                          {slot.startTime}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase font-black">
                          {slot.duration}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold flex items-center gap-2">
                          {slot.subject}
                          {slot.status === 'done' && (
                            <CheckCircle2
                              size={14}
                              className="text-emerald-500"
                            />
                          )}
                        </h4>

                        <p className="text-xs text-slate-400 mt-1">
                          {slot.topic}
                        </p>

                        <p className="text-[10px] text-slate-600 mt-1">
                          {slot.date}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePlanDone(slot.id)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border ${
                        slot.status === 'done'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border-white/5'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {isGenerating && (
                <div className="pl-12 py-10 space-y-4">
                  <div className="w-full h-24 bg-white/5 rounded-2xl animate-pulse" />
                  <div className="w-full h-24 bg-white/5 rounded-2xl animate-pulse" />
                </div>
              )}

              {!isGenerating && visiblePlans.length === 0 && (
                <p className="text-center text-slate-500 py-20">
                  No plan for this date. Generate one.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Modal
        isOpen={showGenModal}
        onClose={() => setShowGenModal(false)}
        title="Generate AI Study Plan"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <input
            value={formData.subjects}
            onChange={(e) =>
              setFormData({ ...formData, subjects: e.target.value })
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
            placeholder="Subjects separated by comma, e.g. DSA, DBMS, CN"
          />

          <textarea
            value={formData.weakTopics}
            onChange={(e) =>
              setFormData({ ...formData, weakTopics: e.target.value })
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none h-24 resize-none"
            placeholder="Weak topics or exam focus"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              min="1"
              max="12"
              value={formData.dailyHours}
              onChange={(e) =>
                setFormData({ ...formData, dailyHours: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
            />

            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
            >
              <option>Easy</option>
              <option>Balanced</option>
              <option>Intensive</option>
            </select>
          </div>

          <select
            value={formData.preferredTime}
            onChange={(e) =>
              setFormData({ ...formData, preferredTime: e.target.value })
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
          >
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
            <option>Night</option>
          </select>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold disabled:opacity-60"
          >
            {isGenerating ? 'Generating...' : 'Generate Plan'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StudyPlanner;