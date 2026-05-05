import React, { useState } from 'react';
import { Bell, Search, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';

const Header = () => {
  const { currentUser, isDemo } = useAuth();
  const { notifications } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0A0F1E]/80 backdrop-blur-xl border-bottom border-white/5">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search for subjects, tasks or tips..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        {isDemo && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} />
            Demo Mode
          </div>
        )}

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0A0F1E]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-[#161B2E] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-bold underline">Notifications</h3>
                    <button className="text-xs text-violet-400 hover:text-violet-300">Mark all as read</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-violet-500/5' : ''}`}>
                          <h4 className="text-sm font-semibold mb-1">{n.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-2 block">{n.createdAt}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-sm">No notifications yet</div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold">{currentUser?.displayName || 'User'}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Lvl 12 Champion</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-500/20">
            <div className="w-full h-full rounded-[10px] bg-[#0A0F1E] flex items-center justify-center overflow-hidden">
               {currentUser?.photoURL ? (
                 <img src={currentUser.photoURL} alt="profile" className="w-full h-full object-cover" />
               ) : (
                 <User size={20} className="text-violet-400" />
               )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
