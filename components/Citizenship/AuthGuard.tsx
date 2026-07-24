'use client';

import { useEffect, useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, User } from 'firebase/auth';
import { motion } from 'motion/react';
import { Shield, LogIn } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-full bg-red-600/10 border border-red-600/20"
        >
          <Shield className="w-16 h-16 text-red-600" />
        </motion.div>
        <div className="space-y-4 max-w-md">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Access Restricted</h2>
          <p className="text-white/60">
            You must be authenticated to claim your citizenship in the Kilvish Empire. 
            Identify yourself to proceed.
          </p>
        </div>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-sm transition-all rounded-xl group"
        >
          <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Identify with Google
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
