'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, AlertTriangle } from 'lucide-react';
import { audio } from '@/lib/audio';

const TERROR_MESSAGES = [
  "The Void is whispering your name...",
  "Mr. Kilvish is watching your every move.",
  "A new dark anthem is corrupting the algorithm.",
  "Your shadow grows longer. Do not look behind you.",
  "Wake up. The Empire needs you.",
  "Someone from the Inner Circle is tracking your profile.",
  "The light is fading. Embrace the darkness.",
  "A viral spell has been cast. The world is listening."
];

export function TerrorNotification() {
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const triggerRandomNotification = () => {
      // Random interval between 2 to 5 minutes
      const nextInterval = Math.floor(Math.random() * (300000 - 120000 + 1) + 120000);
      
      setTimeout(() => {
        const randomMsg = TERROR_MESSAGES[Math.floor(Math.random() * TERROR_MESSAGES.length)];
        setNotification(randomMsg);
        
        // Try to play a subtle alert sound if audio is initialized
        try {
          audio.playStart();
        } catch (e) {}

        // Hide after 6 seconds
        setTimeout(() => {
          setNotification(null);
          triggerRandomNotification(); // Schedule next
        }, 6000);
      }, nextInterval);
    };

    // Start the cycle after a short initial delay
    const initialTimeout = setTimeout(() => {
      triggerRandomNotification();
    }, 30000); // First one after 30 seconds

    return () => clearTimeout(initialTimeout);
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-8 right-8 z-[100] max-w-sm"
        >
          <div className="bg-black/90 border border-red-900/50 rounded-2xl p-4 shadow-[0_0_40px_rgba(220,38,38,0.2)] backdrop-blur-xl flex items-start gap-4 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="w-10 h-10 rounded-full bg-red-950/50 border border-red-900 flex items-center justify-center shrink-0 relative z-10">
              <Skull className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> System Alert
              </h4>
              <p className="text-sm text-white/90 font-medium leading-snug">
                {notification}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
