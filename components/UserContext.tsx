'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface KilvishPersona {
  name: string;
  rank: string;
  role: string;
  loyaltyLevel: number; // 1-100
  specialSkill: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  isPublic: boolean;
  avatarUrl?: string;
  persona?: KilvishPersona;
  shadowPoints: number;
}

interface UserContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isAuthReady: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, username?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createPersona: (persona: Omit<KilvishPersona, 'joinedAt' | 'loyaltyLevel'>) => Promise<void>;
  addShadowPoints: (points: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (!currentUser) {
        setUser(null);
        setIsAuthReady(true);
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const newUser: UserProfile = {
          id: currentUser.uid,
          username: currentUser.displayName || currentUser.email?.split('@')[0] || 'Citizen',
          email: currentUser.email || '',
          bio: "A loyal follower of the dark.",
          isPublic: true,
          shadowPoints: 0,
          avatarUrl: currentUser.photoURL || undefined,
        };
        await setDoc(userRef, {
          uid: currentUser.uid,
          role: 'citizen',
          createdAt: new Date(),
          ...newUser
        });
        setUser(newUser);
      } else {
        const data = docSnap.data();
        setUser({
          id: currentUser.uid,
          username: data.username || 'Citizen',
          email: data.email || '',
          bio: data.bio || "A loyal follower of the dark.",
          isPublic: data.isPublic ?? true,
          shadowPoints: data.shadowPoints || 0,
          avatarUrl: data.avatarUrl,
          persona: data.persona,
        });
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser || !isAuthReady) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({
          id: firebaseUser.uid,
          username: data.username || 'Citizen',
          email: data.email || '',
          bio: data.bio || "A loyal follower of the dark.",
          isPublic: data.isPublic ?? true,
          shadowPoints: data.shadowPoints || 0,
          avatarUrl: data.avatarUrl,
          persona: data.persona,
        });
      }
    });
    return () => unsubscribe();
  }, [firebaseUser, isAuthReady]);

  // Mock login for compatibility with existing UI if needed, but Google is preferred
  const login = async (email: string, password?: string) => {
    if (!password) {
      console.warn("Password required for email login.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Error signing in with email", error);
      throw error;
    }
  };

  const signup = async (email: string, password?: string, username?: string) => {
    if (!password) {
      console.warn("Password required for email signup.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user profile in Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: username || email.split('@')[0],
        role: 'citizen',
        createdAt: new Date()
      });
    } catch (error: any) {
      console.error("Error signing up with email", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, updates);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  const createPersona = async (personaData: Omit<KilvishPersona, 'joinedAt' | 'loyaltyLevel'>) => {
    if (!firebaseUser) return;
    const newPersona: KilvishPersona = {
      ...personaData,
      joinedAt: new Date().toISOString(),
      loyaltyLevel: Math.floor(Math.random() * 20) + 80,
    };
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, { persona: newPersona });
    } catch (error) {
      console.error("Error creating persona", error);
    }
  };

  const addShadowPoints = async (points: number) => {
    if (!firebaseUser || !user) return;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, { shadowPoints: (user.shadowPoints || 0) + points });
    } catch (error) {
      console.error("Error adding shadow points", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      firebaseUser,
      isAuthReady,
      login, 
      signup, 
      loginWithGoogle, 
      logout, 
      updateProfile, 
      createPersona, 
      addShadowPoints 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
