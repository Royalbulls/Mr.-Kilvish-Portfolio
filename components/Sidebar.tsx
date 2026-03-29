'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  Home, 
  Music, 
  Mic2, 
  Disc3, 
  Film, 
  Radio, 
  Settings2,
  LayoutDashboard,
  Sparkles,
  Wand2,
  Globe,
  Eye,
  Zap,
  ScrollText,
  Shield,
  UserCheck,
  Users,
  Tv,
  User,
  Trophy,
  Target,
  MessageSquare,
  BookOpen,
  Newspaper,
  Sun,
  Palette
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { FeedbackModal } from './FeedbackModal';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [supremeMode, setSupremeMode] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (supremeMode) {
      document.body.classList.add('supreme-node');
    } else {
      document.body.classList.remove('supreme-node');
    }
  }, [supremeMode]);

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [lightMode]);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: user ? user.username : 'Profile', href: '/profile', icon: User },
    { name: 'The Manifesto', href: '/manifesto', icon: BookOpen },
    { name: 'Co-Creator', href: '/co-creator', icon: Mic2 },
    { name: 'Kilvish Mode', href: '/kilvish-mode', icon: Sparkles },
    { name: 'Path of Light', href: '/purification', icon: Sun },
    { name: 'Music Mentor', href: '/mentor', icon: Mic2 },
    { name: 'Intelligence', href: '/intelligence', icon: Globe },
    { name: 'Samachar Patra', href: '/samachar', icon: Newspaper },
    { name: 'Empire Building', href: '/empire-building', icon: Shield },
    { name: 'Citizenship', href: '/citizenship', icon: UserCheck },
    { name: 'Imperial Roster', href: '/artists', icon: Users },
    { name: 'Kilvish Toons', href: '/toons', icon: Tv },
    { name: 'Kilvish Studios', href: '/studios', icon: Film },
    { name: 'Prophecies', href: '/prophecies', icon: Eye },
    { name: 'The Vault', href: '/#vault', icon: ScrollText },
    { name: t('navMusic'), href: '/music', icon: Music },
    { name: 'Studio', href: '/studio', icon: Settings2 },
    { name: 'Generator', href: '/generator', icon: Wand2 },
    { name: 'Brand Identity', href: '/brand-identity', icon: Palette },
    { name: t('navFilms'), href: '/films', icon: Film },
    { name: 'Aesthetic Guide', href: '/aesthetic-guide', icon: Palette },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-white/5 z-50 hidden lg:flex flex-col">
        <div className="p-8">
          <Link href="/" className={`text-2xl font-black tracking-tighter uppercase text-white ${supremeMode ? 'animate-glitch text-red-500' : ''}`}>
            Mr. <span className="text-red-600">Kilvish</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all group ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/20 group-hover:text-red-500'} transition-colors`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-4">
          <button
            onClick={() => {
              setLightMode(!lightMode);
              if (!lightMode) setSupremeMode(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              lightMode 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)]' 
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Light Mode
            </span>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${lightMode ? 'bg-black/20' : 'bg-white/20'}`}>
              <div className={`w-3 h-3 rounded-full transition-transform ${lightMode ? 'bg-black translate-x-4' : 'bg-white/50'}`} />
            </div>
          </button>

          <button
            onClick={() => {
              setSupremeMode(!supremeMode);
              if (!supremeMode) setLightMode(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              supremeMode 
                ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse' 
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Supreme
            </span>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${supremeMode ? 'bg-white' : 'bg-white/20'}`}>
              <div className={`w-3 h-3 rounded-full transition-transform ${supremeMode ? 'bg-red-600 translate-x-4' : 'bg-white/50'}`} />
            </div>
          </button>

          <a 
            href="https://music.youtube.com/channel/UCrfXIjL_2M_xI1aeY328BSA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-red-500 transition-colors"
          >
            <Radio className="w-4 h-4" />
            YouTube Music
          </a>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
          >
            <MessageSquare className="w-4 h-4" />
            Submit Feedback
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 px-4 py-2 flex items-center justify-between overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="p-3 rounded-xl transition-all flex-shrink-0 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setLightMode(!lightMode);
              if (!lightMode) setSupremeMode(false);
            }}
            className={`p-3 rounded-xl transition-all flex-shrink-0 ${
              lightMode 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)]' 
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sun className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setSupremeMode(!supremeMode);
              if (!supremeMode) setLightMode(false);
            }}
            className={`p-3 rounded-xl transition-all flex-shrink-0 ${
              supremeMode 
                ? 'bg-white text-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse' 
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
