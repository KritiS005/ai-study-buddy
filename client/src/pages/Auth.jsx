import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Auth = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const { login, signup, loginWithGoogle, setIsDemo, createDemoUser } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast('Please enter email and password.', 'error');
      return;
    }

    if (!isLogin && !name.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        showToast('Logged in successfully!', 'success');
      } else {
        await signup(name, email, password);
        showToast('Account created successfully!', 'success');
      }

      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      showToast(error.message || 'Authentication failed. Please try again.', 'error');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      showToast('Google login successful!', 'success');
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      showToast(error.message || 'Google login failed. Please try again.', 'error');
    }
  };

  const handleDemoLogin = () => {
    createDemoUser();
    showToast('Demo mode enabled.', 'info');
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A0F1E]">
      {/* Left Decoration */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-1/2 relative overflow-hidden bg-gradient-to-br from-[#161B2E] to-[#0A0F1E]">
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-[160px] animate-pulse [animation-delay:2s]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2.5 bg-violet-600 rounded-xl">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">StudyBuddy</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight">
              Elevate your <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Learning Journey
              </span>{' '}
              <br />
              with AI.
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              Personalized study plans, real-time tracking, and AI-powered burnout detection.
              Everything a modern student needs to succeed.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex gap-12">
          <div>
            <p className="text-2xl font-bold">12K+</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Active Students</p>
          </div>
          <div>
            <p className="text-2xl font-bold">98%</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Success Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold">AI</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Powered Insights</p>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
            <p className="text-slate-400 mt-2">
              {isLogin ? 'Log in to your student dashboard' : 'Join thousands of students and start learning'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-slate-300">Password</label>
                {isLogin && (
                  <button type="button" className="text-xs text-violet-400 hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-violet-600/20 active:scale-95"
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0A0F1E] px-4 text-slate-500 font-bold tracking-widest">
                Or Continue With
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
              <span className="text-sm font-semibold">Google</span>
            </button>

            <button
              onClick={handleDemoLogin}
              className="flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
            >
              <Terminal size={18} className="text-cyan-400" />
              <span className="text-sm font-semibold">Demo</span>
            </button>
          </div>

          <p className="text-center text-sm text-slate-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-violet-400 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up Free' : 'Log In Instead'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;