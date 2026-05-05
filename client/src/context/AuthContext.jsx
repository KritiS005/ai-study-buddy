import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isConfigured } from '../firebase/firebase';
 
const AuthContext = createContext();
 
export const useAuth = () => useContext(AuthContext);
 
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
 
  // ✅ always start as false — demo only activates when user clicks Demo button
  const [isDemo, setIsDemo] = useState(false);
 
  const createUserDocument = async (user, name = null) => {
    if (!user || !db) return null;
 
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
 
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUserData(data);
      return data;
    }
 
    const newUserData = {
      name: name || user.displayName || 'Student',
      email: user.email,
      avatar: user.photoURL || '',
      createdAt: new Date().toISOString(),
      streak: 0,
      totalPoints: 0,
      level: 1,
      preferredSubjects: [],
      preferredStudyHours: ''
    };
 
    await setDoc(userRef, newUserData);
    setUserData(newUserData);
    return newUserData;
  };
 
  const createDemoUser = () => {
    const demoUser = {
      uid: 'demo-123',
      email: 'demo@example.com',
      displayName: 'Demo Student',
      photoURL: ''
    };
 
    const demoUserData = {
      name: 'Demo Student',
      email: 'demo@example.com',
      avatar: '',
      createdAt: new Date().toISOString(),
      streak: 5,
      totalPoints: 450,
      level: 3,
      preferredSubjects: ['DSA', 'DBMS', 'Computer Networks'],
      preferredStudyHours: 'Evening'
    };
 
    setIsDemo(true);
    setCurrentUser(demoUser);
    setUserData(demoUserData);
 
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    localStorage.setItem('demo_user_data', JSON.stringify(demoUserData));
  };
 
  useEffect(() => {
    // ✅ only restore demo session if user explicitly chose demo before
    // do NOT auto-enable demo just because Firebase is not configured
    if (!isConfigured) {
      const savedUser = localStorage.getItem('demo_user');
      const savedUserData = localStorage.getItem('demo_user_data');
 
      if (savedUser) {
        // user previously clicked Demo button — restore their session
        setCurrentUser(JSON.parse(savedUser));
        setUserData(savedUserData ? JSON.parse(savedUserData) : null);
        setIsDemo(true);
      }
      // if no saved demo session → stay logged out → show login page
 
      setLoading(false);
      return;
    }
 
    if (isDemo) {
      const savedUser = localStorage.getItem('demo_user');
      const savedUserData = localStorage.getItem('demo_user_data');
 
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setUserData(savedUserData ? JSON.parse(savedUserData) : null);
      }
 
      setLoading(false);
      return;
    }
 
    // real Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          await createUserDocument(user);
        } else {
          setCurrentUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Auth state error:', error);
      } finally {
        setLoading(false);
      }
    });
 
    return unsubscribe;
  }, [isDemo]);
 
  const login = async (email, password) => {
    if (!isConfigured || !auth || !db) {
      createDemoUser();
      return null;
    }
 
    setIsDemo(false);
 
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
 
    setCurrentUser(user);
    await createUserDocument(user);
 
    return userCredential;
  };
 
  const signup = async (name, email, password) => {
    if (!isConfigured || !auth || !db) {
      createDemoUser();
      return null;
    }
 
    setIsDemo(false);
 
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
 
    if (name) {
      await updateProfile(user, { displayName: name });
    }
 
    // ✅ use the real Firebase user object directly — do not spread it
    setCurrentUser(user);
    await createUserDocument(user, name);
 
    return userCredential;
  };
 
  const loginWithGoogle = async () => {
    if (!isConfigured || !auth || !googleProvider || !db) {
      createDemoUser();
      return null;
    }
 
    setIsDemo(false);
 
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
 
    setCurrentUser(user);
    await createUserDocument(user);
 
    return result;
  };
 
  const logout = async () => {
    if (isDemo || !isConfigured || !auth) {
      setCurrentUser(null);
      setUserData(null);
      setIsDemo(false); // ✅ always reset to false on logout, never auto-demo
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_user_data');
      return;
    }
 
    await signOut(auth);
    setCurrentUser(null);
    setUserData(null);
  };
 
  const value = {
    currentUser,
    userData,
    loading,
    isDemo,
    login,
    signup,
    loginWithGoogle,
    logout,
    setIsDemo,
    createDemoUser
  };
 
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};