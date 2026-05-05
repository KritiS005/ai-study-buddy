import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { Clock, Target, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E'];

const Analytics = () => {
  const { tasks, studyPlans, moodLogs, productivityScore, totalStudyHours } = useAppContext();
  const [range, setRange] = useState('This Week');

  const studyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map = days.map((name) => ({ name, hours: 0, tasks: 0 }));

    tasks.forEach((task) => {
      if (task.status !== 'Done') return;
      const date = new Date(task.completedAt || task.deadline || Date.now());
      const day = date.getDay();
      map[day].hours += Number(task.estimatedHours || 0);
      map[day].tasks += 1;
    });

    studyPlans.forEach((plan) => {
      if (plan.status !== 'done') return;
      const date = new Date(plan.date || Date.now());
      const day = date.getDay();
      const minutes = Number(String(plan.duration || '').match(/\d+/)?.[0] || 0);
      map[day].hours += Number((minutes / 60).toFixed(1));
    });

    return map.map((item) => ({ ...item, hours: Number(item.hours.toFixed(1)) }));
  }, [tasks, studyPlans, range]);

  const subjectData = useMemo(() => {
    const counts = {};
    tasks.forEach((task) => {
      counts[task.subject || 'General'] = (counts[task.subject || 'General'] || 0) + 1;
    });
    studyPlans.forEach((plan) => {
      counts[plan.subject || 'General'] = (counts[plan.subject || 'General'] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
  }, [tasks, studyPlans]);

  const productivityHistory = useMemo(() => {
    return studyData.map((item, index) => ({
      day: index + 1,
      score: Math.min(100, Math.round(item.tasks * 20 + item.hours * 8))
    }));
  }, [studyData]);

  const averageEnergy = moodLogs.length
    ? Math.round(moodLogs.reduce((sum, log) => sum + Number(log.energy || 0), 0) / moodLogs.length)
    : 0;

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-bold">Personal Analytics</h2>
        <p className="text-slate-400">Real insights from your tasks, planner, and mood logs</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold flex items-center gap-2"><Clock size={18} className="text-violet-400" /> Study Hours Distribution</h3>
            <select value={range} onChange={(e) => setRange(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold uppercase cursor-pointer">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#161B2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="hours" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 glass-card p-6">
          <h3 className="font-bold flex items-center gap-2 mb-8"><Target size={18} className="text-cyan-400" /> Subject Breakdown</h3>
          <div className="h-[250px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {subjectData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {subjectData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</div>
                <span className="text-xs font-bold text-slate-400">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6 h-[350px]">
          <h3 className="font-bold flex items-center gap-2 mb-8"><Zap size={18} className="text-amber-400" /> Productivity Trend</h3>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityHistory}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} hide />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip contentStyle={{ backgroundColor: '#161B2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#7C3AED" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 glass-card p-6">
          <h3 className="font-bold flex items-center gap-2 mb-6"><Award size={18} className="text-emerald-400" /> Performance Insights</h3>
          <div className="space-y-4">
            {[
              `Total study hours: ${totalStudyHours}h`,
              `Productivity score: ${productivityScore}%`,
              `Average energy: ${averageEnergy || 'No logs yet'}`,
              tasks.length ? `Completed tasks: ${tasks.filter((t) => t.status === 'Done').length}/${tasks.length}` : 'No tasks yet'
            ].map((text, index) => (
              <motion.div key={text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-slate-300">
                {text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
