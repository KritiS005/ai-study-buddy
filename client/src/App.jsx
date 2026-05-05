import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import FloatingChat from './components/ai/FloatingChat';
import './styles/global.css';

// Lazy load pages
const Auth = React.lazy(() => import('./pages/Auth'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const StudyPlanner = React.lazy(() => import('./pages/StudyPlanner'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const MoodTracker = React.lazy(() => import('./pages/MoodTracker'));
const AIStudyBuddy = React.lazy(() => import('./pages/AIStudyBuddy'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Gamification = React.lazy(() => import('./pages/Gamification'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <div className="flex h-screen overflow-hidden bg-[#0A0F1E] font-inter">
              <Routes>
                <Route path="/auth" element={
                  <Suspense fallback={<div className="flex items-center justify-center w-full">Loading...</div>}>
                    <Auth />
                  </Suspense>
                } />
                
                <Route path="/*" element={
                  <ProtectedRoute>
                    <Sidebar />
                    <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                      <Header />
                      <main className="p-4 md:p-6 lg:p-8">
                        <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/planner" element={<StudyPlanner />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/mood" element={<MoodTracker />} />
                            <Route path="/chat" element={<AIStudyBuddy />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/gamification" element={<Gamification />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </Suspense>
                      </main>
                    </div>
                    <FloatingChat />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
