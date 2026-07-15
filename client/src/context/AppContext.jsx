import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db, isConfigured } from '../firebase/firebase';
import { demoTasks, demoMoodLogs, demoNotifications } from '../utils/demoData';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const defaultSettings = {
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

const makeLocalId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const readLocal = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage`, error);
    return fallback;
  }
};

const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write ${key} to localStorage`, error);
  }
};

const cleanForFirestore = (value) => {
  return JSON.parse(JSON.stringify(value));
};

export const AppProvider = ({ children }) => {
  const { currentUser, isDemo } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [streak, setStreak] = useState(0);
  const [productivityScore, setProductivityScore] = useState(0);

  const isLocalMode = !isConfigured || isDemo || !currentUser?.uid || !db;

  useEffect(() => {
    const savedTheme = readLocal('studybuddy_settings', defaultSettings)?.preferences?.theme || 'dark';
    document.documentElement.classList.toggle('light', savedTheme === 'light');
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setMoodLogs([]);
      setNotifications([]);
      setStudyPlans([]);
      setSettings(defaultSettings);
      setStreak(0);
      setProductivityScore(0);
      return;
    }

    if (isLocalMode) {
      const localTasks = readLocal('studybuddy_tasks', demoTasks || []);
      const localMoodLogs = readLocal('studybuddy_mood_logs', demoMoodLogs || []);
      const localNotifications = readLocal('studybuddy_notifications', demoNotifications || []);
      const localStudyPlans = readLocal('studybuddy_study_plans', []);
      const localSettings = readLocal('studybuddy_settings', defaultSettings);

      setTasks(localTasks);
      setMoodLogs(localMoodLogs);
      setNotifications(localNotifications);
      setStudyPlans(localStudyPlans);
      setSettings({
        ...defaultSettings,
        ...localSettings,
        profile: {
          ...defaultSettings.profile,
          ...(localSettings.profile || {})
        },
        preferences: {
          ...defaultSettings.preferences,
          ...(localSettings.preferences || {})
        },
        notifications: {
          ...defaultSettings.notifications,
          ...(localSettings.notifications || {})
        },
        voiceAI: {
          ...defaultSettings.voiceAI,
          ...(localSettings.voiceAI || {})
        }
      });

      setStreak(Number(localStorage.getItem('studybuddy_streak')) || 7);
      setProductivityScore(Number(localStorage.getItem('studybuddy_productivity')) || 85);
      return;
    }

    const tasksQuery = query(
      collection(db, 'users', currentUser.uid, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const moodQuery = query(
      collection(db, 'users', currentUser.uid, 'moodLogs'),
      orderBy('timestamp', 'desc')
    );

    const notifyQuery = query(
      collection(db, 'users', currentUser.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const studyPlanQuery = query(
      collection(db, 'users', currentUser.uid, 'studyPlans'),
      orderBy('createdAt', 'desc')
    );

    const settingsRef = doc(db, 'users', currentUser.uid, 'private', 'settings');

    const unsubscribeTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        setTasks(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (error) => {
        console.error('Tasks listener error:', error);
      }
    );

    const unsubscribeMood = onSnapshot(
      moodQuery,
      (snapshot) => {
        setMoodLogs(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (error) => {
        console.error('Mood listener error:', error);
      }
    );

    const unsubscribeNotify = onSnapshot(
      notifyQuery,
      (snapshot) => {
        setNotifications(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (error) => {
        console.error('Notifications listener error:', error);
      }
    );

    const unsubscribeStudyPlans = onSnapshot(
      studyPlanQuery,
      (snapshot) => {
        setStudyPlans(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (error) => {
        console.error('Study plans listener error:', error);
      }
    );

    const unsubscribeSettings = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const firebaseSettings = snapshot.data();

          setSettings({
            ...defaultSettings,
            ...firebaseSettings,
            profile: {
              ...defaultSettings.profile,
              ...(firebaseSettings.profile || {})
            },
            preferences: {
              ...defaultSettings.preferences,
              ...(firebaseSettings.preferences || {})
            },
            notifications: {
              ...defaultSettings.notifications,
              ...(firebaseSettings.notifications || {})
            },
            voiceAI: {
              ...defaultSettings.voiceAI,
              ...(firebaseSettings.voiceAI || {})
            }
          });
        } else {
          setSettings(defaultSettings);
        }
      },
      (error) => {
        console.error('Settings listener error:', error);
      }
    );

    return () => {
      unsubscribeTasks();
      unsubscribeMood();
      unsubscribeNotify();
      unsubscribeStudyPlans();
      unsubscribeSettings();
    };
  }, [currentUser, isLocalMode]);

  useEffect(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'Done').length;
    const score = total ? Math.round((completed / total) * 100) : 0;

    setProductivityScore(score);

    if (isLocalMode) {
      localStorage.setItem('studybuddy_productivity', String(score));
    }
  }, [tasks, isLocalMode]);

  const addTask = async (task) => {
    const newTask = {
      title: task.title?.trim() || 'Untitled Task',
      subject: task.subject || 'General',
      priority: task.priority || 'Medium',
      status: task.status || 'Todo',
      deadline: task.deadline || new Date().toISOString().slice(0, 10),
      estimatedHours: Number(task.estimatedHours || 1),
      notes: task.notes || '',
      createdAt: new Date().toISOString()
    };

    if (isLocalMode) {
      const updated = [{ ...newTask, id: makeLocalId() }, ...tasks];
      setTasks(updated);
      writeLocal('studybuddy_tasks', updated);
      return;
    }

    await addDoc(collection(db, 'users', currentUser.uid, 'tasks'), {
      ...newTask,
      createdAt: serverTimestamp()
    });
  };

  const updateTask = async (taskId, updates) => {
    if (isLocalMode) {
      const updated = tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      );

      setTasks(updated);
      writeLocal('studybuddy_tasks', updated);
      return;
    }

    await updateDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  };

  const deleteTask = async (taskId) => {
    if (isLocalMode) {
      const updated = tasks.filter((task) => task.id !== taskId);
      setTasks(updated);
      writeLocal('studybuddy_tasks', updated);
      return;
    }

    await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId));
  };

  const addMoodLog = async (log) => {
    const newLog = {
      mood: log.mood,
      energy: Number(log.energy || 5),
      note: log.note || '',
      timestamp: new Date().toISOString()
    };

    if (isLocalMode) {
      const updated = [{ ...newLog, id: makeLocalId() }, ...moodLogs];
      setMoodLogs(updated);
      writeLocal('studybuddy_mood_logs', updated);
      return;
    }

    await addDoc(collection(db, 'users', currentUser.uid, 'moodLogs'), {
      ...newLog,
      timestamp: serverTimestamp()
    });
  };

  const saveStudyPlan = async (plan) => {
    const newPlan = {
      title: plan.title || 'AI Study Plan',
      subjects: plan.subjects || [],
      slots: Array.isArray(plan.slots) ? plan.slots : [],
      createdAt: new Date().toISOString()
    };

    if (isLocalMode) {
      const updated = [{ ...newPlan, id: makeLocalId() }, ...studyPlans];
      setStudyPlans(updated);
      writeLocal('studybuddy_study_plans', updated);
      return;
    }

    await addDoc(collection(db, 'users', currentUser.uid, 'studyPlans'), {
      ...cleanForFirestore(newPlan),
      createdAt: serverTimestamp()
    });
  };

  const updateStudyPlan = async (planId, updates) => {
    if (isLocalMode) {
      const updated = studyPlans.map((plan) =>
        plan.id === planId
          ? { ...plan, ...updates, updatedAt: new Date().toISOString() }
          : plan
      );

      setStudyPlans(updated);
      writeLocal('studybuddy_study_plans', updated);
      return;
    }

    await updateDoc(doc(db, 'users', currentUser.uid, 'studyPlans', planId), {
      ...cleanForFirestore(updates),
      updatedAt: serverTimestamp()
    });
  };

  const saveSettings = async (newSettings) => {
    const mergedSettings = {
      ...defaultSettings,
      ...settings,
      ...newSettings,
      profile: {
        ...defaultSettings.profile,
        ...(settings?.profile || {}),
        ...(newSettings?.profile || {})
      },
      preferences: {
        ...defaultSettings.preferences,
        ...(settings?.preferences || {}),
        ...(newSettings?.preferences || {})
      },
      notifications: {
        ...defaultSettings.notifications,
        ...(settings?.notifications || {}),
        ...(newSettings?.notifications || {})
      },
      voiceAI: {
        ...defaultSettings.voiceAI,
        ...(settings?.voiceAI || {}),
        ...(newSettings?.voiceAI || {})
      }
    };

    setSettings(mergedSettings);

    document.documentElement.classList.toggle(
      'light',
      mergedSettings.preferences?.theme === 'light'
    );

    writeLocal('studybuddy_settings', mergedSettings);

    if (isLocalMode) {
      return;
    }

    try {
      await setDoc(
        doc(db, 'users', currentUser.uid, 'private', 'settings'),
        cleanForFirestore(mergedSettings),
        { merge: true }
      );
    } catch (error) {
      console.error('Firebase settings save failed. Local settings saved.', error);
      throw error;
    }
  };

  const markAllNotificationsRead = async () => {
    const unread = notifications.filter((notification) => !notification.read);
    if (!unread.length) return;

    if (isLocalMode) {
      const updated = notifications.map((notification) => ({ ...notification, read: true }));
      setNotifications(updated);
      writeLocal('studybuddy_notifications', updated);
      return;
    }

    const batch = writeBatch(db);
    unread.forEach((notification) => {
      batch.update(doc(db, 'users', currentUser.uid, 'notifications', notification.id), { read: true });
    });
    await batch.commit();
  };

  const clearUserData = async () => {
    setTasks([]);
    setMoodLogs([]);
    setNotifications([]);
    setStudyPlans([]);
    setSettings(defaultSettings);
    setStreak(0);
    setProductivityScore(0);

    localStorage.removeItem('studybuddy_tasks');
    localStorage.removeItem('studybuddy_mood_logs');
    localStorage.removeItem('studybuddy_notifications');
    localStorage.removeItem('studybuddy_study_plans');
    localStorage.removeItem('studybuddy_settings');
    localStorage.removeItem('studybuddy_streak');
    localStorage.removeItem('studybuddy_productivity');

    document.documentElement.classList.remove('light');

    if (isLocalMode) {
      return;
    }

    const batch = writeBatch(db);
    const subCollections = ['tasks', 'moodLogs', 'notifications', 'studyPlans'];

    for (const subCollection of subCollections) {
      const snapshot = await getDocs(collection(db, 'users', currentUser.uid, subCollection));
      snapshot.forEach((item) => batch.delete(item.ref));
    }

    batch.set(
      doc(db, 'users', currentUser.uid, 'private', 'settings'),
      defaultSettings,
      { merge: false }
    );

    await batch.commit();
  };

  const value = useMemo(
    () => ({
      tasks,
      moodLogs,
      notifications,
      studyPlans,
      settings,
      streak,
      productivityScore,
      setStreak,
      setProductivityScore,
      addTask,
      updateTask,
      deleteTask,
      addMoodLog,
      saveStudyPlan,
      updateStudyPlan,
      saveSettings,
      markAllNotificationsRead,
      clearUserData
    }),
    [
      tasks,
      moodLogs,
      notifications,
      studyPlans,
      settings,
      streak,
      productivityScore
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
