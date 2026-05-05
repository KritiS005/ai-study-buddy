import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, CheckSquare, Smile, 
  MessageSquare, BarChart3, Trophy, Settings, 
  LogOut, ChevronLeft, ChevronRight, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
      ${isActive 
        ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}
    `}
  >
    <Icon size={22} className="shrink-0" />
    <AnimatePresence>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="font-medium whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </NavLink>
);

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, currentUser } = useAuth();
  const location = useLocation();

  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/planner', icon: Calendar, label: 'Study Planner' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/mood', icon: Smile, label: 'Mood Tracker' },
    { to: '/chat', icon: MessageSquare, label: 'AI Study Buddy' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/gamification', icon: Trophy, label: 'Achievements' },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      className="relative flex flex-col h-full bg-[#0A0F1E] border-r border-white/5 transition-all z-40"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="p-2 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-lg shadow-lg shadow-violet-500/20">
          <GraduationCap size={24} className="text-white" />
        </div>
        {!collapsed && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
          >
            StudyBuddy
          </motion.h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <SidebarItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 mt-auto border-t border-white/5">
        <SidebarItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-3 mt-2 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent"
        >
          <LogOut size={22} className="shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-white border-2 border-[#0A0F1E] shadow-lg hover:scale-110 transition-transform hidden lg:flex"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
