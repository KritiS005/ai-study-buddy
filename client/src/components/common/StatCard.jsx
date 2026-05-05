import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, trend, colorClass }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group hover:bg-white/5 transition-colors"
    >
      <div className={`p-3 rounded-2xl w-fit ${colorClass || 'bg-violet-500/10 text-violet-400'} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <div className="flex items-end gap-3 mt-1">
          <h3 className="text-3xl font-bold">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>

      {/* Decorative background shape */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 ${colorClass?.split(' ')[0] || 'bg-violet-500'}`} />
    </motion.div>
  );
};

export default StatCard;
