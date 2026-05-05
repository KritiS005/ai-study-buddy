import React, { useEffect, useRef, useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Trash2,
  Save,
  Cloud,
  Mic,
  Sun,
  Moon,
  LogOut,
  Upload,
  RefreshCw,
  Brain,
  Volume2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`w-12 h-6 rounded-full relative p-1 transition-all ${
      checked
        ? 'bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/30'
        : 'bg-slate-700'
    }`}
  >
    <div
      className={`w-4 h-4 bg-white rounded-full transition-all ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
);

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </label>
    {children}
  </div>
);

const defaultForm = {
  profile: {
    fullName: '',
    university: '',
    bio: '',
    avatar: ''
  },
  preferences: {
    theme: 'dark',
    studyGoal: 4,
    preferredTime: 'Evening',
    defaultSubject: 'Computer Science'
  },
  notifications: {
    smartNotifications: true,
    taskReminders: true,
    dailySummary: true,
    emailUpdates: false
  },
  voiceAI: {
    voiceReplies: true,
    micInput: true,
    aiTone: 'Friendly',
    language: 'English'
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { currentUser, isDemo, logout } = useAuth();
  const { settings, saveSettings, clearUserData } = useAppContext();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    setForm({
      profile: {
        fullName:
          settings?.profile?.fullName ||
          currentUser?.displayName ||
          'Student',
        university: settings?.profile?.university || '',
        bio: settings?.profile?.bio || '',
        avatar:
          settings?.profile?.avatar ||
          currentUser?.photoURL ||
          ''
      },
      preferences: {
        theme: settings?.preferences?.theme || 'dark',
        studyGoal: settings?.preferences?.studyGoal || 4,
        preferredTime: settings?.preferences?.preferredTime || 'Evening',
        defaultSubject:
          settings?.preferences?.defaultSubject || 'Computer Science'
      },
      notifications: {
        smartNotifications:
          settings?.notifications?.smartNotifications ?? true,
        taskReminders:
          settings?.notifications?.taskReminders ?? true,
        dailySummary:
          settings?.notifications?.dailySummary ?? true,
        emailUpdates:
          settings?.notifications?.emailUpdates ?? false
      },
      voiceAI: {
        voiceReplies: settings?.voiceAI?.voiceReplies ?? true,
        micInput: settings?.voiceAI?.micInput ?? true,
        aiTone: settings?.voiceAI?.aiTone || 'Friendly',
        language: settings?.voiceAI?.language || 'English'
      }
    });
  }, [settings, currentUser]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'light',
      form.preferences.theme === 'light'
    );
  }, [form.preferences.theme]);

  const updateSection = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    if (file.size > 500 * 1024) {
      showToast('Image must be less than 500KB.', 'error');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateSection('profile', 'avatar', reader.result);
      showToast('Avatar selected. Click Save Changes to store it.', 'info');
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (!saveSettings) {
        throw new Error('saveSettings function is missing from AppContext.');
      }

      await saveSettings(form);

      showToast('Settings saved successfully.', 'success');
    } catch (error) {
      console.error('Save settings error:', error);

      if (error?.code === 'permission-denied') {
        showToast('Firebase permission denied. Check Firestore rules.', 'error');
      } else {
        showToast(error.message || 'Failed to save settings.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    const reset = {
      profile: {
        fullName: currentUser?.displayName || 'Student',
        university: '',
        bio: '',
        avatar: currentUser?.photoURL || ''
      },
      preferences: {
        theme: 'dark',
        studyGoal: 4,
        preferredTime: 'Evening',
        defaultSubject: 'Computer Science'
      },
      notifications: {
        smartNotifications: true,
        taskReminders: true,
        dailySummary: true,
        emailUpdates: false
      },
      voiceAI: {
        voiceReplies: true,
        micInput: true,
        aiTone: 'Friendly',
        language: 'English'
      }
    };

    try {
      setForm(reset);

      if (!saveSettings) {
        throw new Error('saveSettings function is missing from AppContext.');
      }

      await saveSettings(reset);

      showToast('Settings reset to default.', 'success');
    } catch (error) {
      console.error('Reset settings error:', error);
      showToast(error.message || 'Failed to reset settings.', 'error');
    }
  };

  const handleDeleteEverything = async () => {
    if (confirmText !== 'DELETE') {
      showToast('Type DELETE to confirm.', 'error');
      return;
    }

    try {
      if (!clearUserData) {
        throw new Error('clearUserData function is missing from AppContext.');
      }

      await clearUserData();

      setConfirmText('');
      showToast('All app data has been cleared.', 'success');
    } catch (error) {
      console.error('Clear data error:', error);
      showToast(error.message || 'Failed to clear data.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        localStorage.removeItem('demo_user');
        localStorage.removeItem('demo_user_data');
      }

      showToast('Logged out successfully.', 'success');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      showToast(error.message || 'Logout failed.', 'error');
    }
  };

  const navItems = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'preferences', label: 'Study Preferences', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'voice', label: 'Voice & AI', icon: Mic },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-400 mb-2">
            Control Center
          </p>

          <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-violet-200 to-cyan-300 bg-clip-text text-transparent">
            Global Settings
          </h2>

          <p className="text-slate-400 mt-2">
            Customize your StudyBuddy profile, preferences, AI voice, and data controls.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleResetSettings}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold transition-all"
          >
            <RefreshCw size={16} />
            Reset
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-sm font-bold shadow-lg shadow-violet-600/25 disabled:opacity-60 transition-all"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 p-0.5">
                <div className="w-full h-full rounded-[14px] bg-[#0A0F1E] overflow-hidden flex items-center justify-center">
                  {form.profile.avatar ? (
                    <img
                      src={form.profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-violet-300" />
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="font-bold truncate">
                  {form.profile.fullName || 'Student'}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {currentUser?.email || 'demo@example.com'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-600/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-4 border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Cloud size={16} />
              <span className="text-xs font-black uppercase tracking-widest">
                Sync Status
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {isDemo
                ? 'Demo/local mode active. Data is saved in this browser.'
                : 'Firebase sync active across devices.'}
            </p>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-6">
          {activeSection === 'profile' && (
            <section className="glass-card p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="text-violet-400" />
                Personal Identity
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 p-0.5 shadow-xl shadow-violet-500/20">
                  <div className="w-full h-full rounded-[22px] bg-[#0A0F1E] flex items-center justify-center overflow-hidden">
                    {form.profile.avatar ? (
                      <img
                        src={form.profile.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={36} className="text-violet-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all"
                  >
                    <Upload size={16} />
                    Change Avatar
                  </button>

                  <p className="text-xs text-slate-500">
                    JPG, PNG, or GIF. Max size 500KB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <input
                    type="text"
                    value={form.profile.fullName}
                    onChange={(e) =>
                      updateSection('profile', 'fullName', e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
                  />
                </Field>

                <Field label="University">
                  <input
                    type="text"
                    value={form.profile.university}
                    onChange={(e) =>
                      updateSection('profile', 'university', e.target.value)
                    }
                    placeholder="e.g. Amity University Patna"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Bio">
                    <textarea
                      value={form.profile.bio}
                      onChange={(e) =>
                        updateSection('profile', 'bio', e.target.value)
                      }
                      placeholder="Tell us about your learning goals..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none h-28 resize-none"
                    />
                  </Field>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'preferences' && (
            <section className="glass-card p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Shield className="text-cyan-400" />
                Study Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    {form.preferences.theme === 'dark' ? (
                      <Moon className="text-violet-400" />
                    ) : (
                      <Sun className="text-amber-400" />
                    )}

                    <div>
                      <div className="text-sm font-bold">Dark Mode</div>
                      <p className="text-xs text-slate-500">
                        Switch between dark and light app theme.
                      </p>
                    </div>
                  </div>

                  <Toggle
                    checked={form.preferences.theme === 'dark'}
                    onChange={(checked) =>
                      updateSection(
                        'preferences',
                        'theme',
                        checked ? 'dark' : 'light'
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Daily Study Goal">
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={form.preferences.studyGoal}
                      onChange={(e) =>
                        updateSection(
                          'preferences',
                          'studyGoal',
                          Number(e.target.value)
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
                    />
                  </Field>

                  <Field label="Preferred Time">
                    <select
                      value={form.preferences.preferredTime}
                      onChange={(e) =>
                        updateSection(
                          'preferences',
                          'preferredTime',
                          e.target.value
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
                    >
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                      <option>Night</option>
                    </select>
                  </Field>

                  <Field label="Default Subject">
                    <input
                      type="text"
                      value={form.preferences.defaultSubject}
                      onChange={(e) =>
                        updateSection(
                          'preferences',
                          'defaultSubject',
                          e.target.value
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
                    />
                  </Field>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section className="glass-card p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bell className="text-violet-400" />
                Notifications
              </h3>

              <div className="space-y-4">
                {[
                  [
                    'smartNotifications',
                    'Smart Notifications',
                    'AI reminders based on your task load and mood.'
                  ],
                  [
                    'taskReminders',
                    'Task Reminders',
                    'Reminder alerts for upcoming deadlines.'
                  ],
                  [
                    'dailySummary',
                    'Daily Summary',
                    'One daily overview of your progress.'
                  ],
                  [
                    'emailUpdates',
                    'Email Updates',
                    'Receive important updates by email.'
                  ]
                ].map(([key, title, subtitle]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl"
                  >
                    <div>
                      <div className="text-sm font-bold">{title}</div>
                      <p className="text-xs text-slate-500">{subtitle}</p>
                    </div>

                    <Toggle
                      checked={form.notifications[key]}
                      onChange={(checked) =>
                        updateSection('notifications', key, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'voice' && (
            <section className="glass-card p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Brain className="text-cyan-400" />
                Voice & AI
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Volume2 className="text-cyan-400" />
                    <div>
                      <div className="text-sm font-bold">Voice Replies</div>
                      <p className="text-xs text-slate-500">
                        Allow AI Study Buddy to read answers aloud.
                      </p>
                    </div>
                  </div>

                  <Toggle
                    checked={form.voiceAI.voiceReplies}
                    onChange={(checked) =>
                      updateSection('voiceAI', 'voiceReplies', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Mic className="text-violet-400" />
                    <div>
                      <div className="text-sm font-bold">Microphone Input</div>
                      <p className="text-xs text-slate-500">
                        Enable voice input for AI chat.
                      </p>
                    </div>
                  </div>

                  <Toggle
                    checked={form.voiceAI.micInput}
                    onChange={(checked) =>
                      updateSection('voiceAI', 'micInput', checked)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="AI Tone">
                    <select
                      value={form.voiceAI.aiTone}
                      onChange={(e) =>
                        updateSection('voiceAI', 'aiTone', e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
                    >
                      <option>Friendly</option>
                      <option>Strict</option>
                      <option>Motivational</option>
                      <option>Simple Teacher</option>
                    </select>
                  </Field>

                  <Field label="Language">
                    <select
                      value={form.voiceAI.language}
                      onChange={(e) =>
                        updateSection('voiceAI', 'language', e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
                    >
                      <option>English</option>
                      <option>Hindi</option>
                      <option>English + Hindi</option>
                    </select>
                  </Field>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'danger' && (
            <section className="space-y-6">
              <div className="glass-card p-6 md:p-8 border-red-500/20 bg-red-500/5">
                <h3 className="text-xl font-bold mb-2 text-red-400 flex items-center gap-2">
                  <Trash2 />
                  Danger Zone
                </h3>

                <p className="text-sm text-red-300/70 mb-6">
                  This clears tasks, mood logs, study plans, notifications, and saved settings.
                  Type DELETE to confirm.
                </p>

                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="flex-1 bg-white/5 border border-red-500/20 rounded-xl p-3 text-sm focus:border-red-500/50 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleDeleteEverything}
                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-sm font-bold transition-all"
                  >
                    Delete Everything
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 md:p-8">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <LogOut className="text-violet-400" />
                  Account Session
                </h3>

                <p className="text-sm text-slate-400 mb-6">
                  Logout from this device and return to the auth screen.
                </p>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all"
                >
                  Logout
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;