
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { auth, isFirebaseConfigured } from '../firebase-config';
import { User } from '../types';

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo Mode Logic: If Firebase is not configured, check for a virtual session
    if (!isFirebaseConfigured || !auth) {
      const storedUser = localStorage.getItem('bodyos_virtual_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
      return;
    }

    // Standard Firebase Logic
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        setUser(userData);
        localStorage.setItem('bodyos_virtual_user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('bodyos_virtual_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const signIn = async () => {
    // Virtual Login for Demo / Missing Config
    if (!isFirebaseConfigured || !auth) {
      const mockUser: User = {
        uid: 'nexus_demo_001',
        displayName: 'Nexus Athlete',
        email: 'athlete@bodyos.ai',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nexus'
      };
      setUser(mockUser);
      localStorage.setItem('bodyos_virtual_user', JSON.stringify(mockUser));
      return;
    }

    // Real Firebase Login
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Sign in error", error);
      
      // Graceful fallback on API Key error
      if (error.code === 'auth/api-key-not-valid' || error.message?.includes('api-key-not-valid')) {
        console.warn("BODYOS: Invalid Firebase Key detected. Switching to Virtual Sync Mode.");
        const mockUser: User = {
          uid: 'nexus_demo_fallback',
          displayName: 'Nexus Athlete (Demo)',
          email: 'demo@bodyos.ai',
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fallback'
        };
        setUser(mockUser);
        localStorage.setItem('bodyos_virtual_user', JSON.stringify(mockUser));
      }
    }
  };

  const signOutOfApp = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
      setUser(null);
      localStorage.removeItem('bodyos_virtual_user');
      localStorage.removeItem('onboardingComplete');
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return { user, loading, signIn, signOut: signOutOfApp };
}
