'use client';

import { motion } from 'motion/react';
import { 
  Music, 
  Mic2, 
  Star, 
  Disc3, 
  Wand2, 
  Settings2,
  ChevronRight,
  Film,
  Sparkles,
  Globe,
  Eye,
  Shield,
  UserCheck,
  Users,
  Tv,
  Archive,
  ScrollText,
  Sun,
  Palette,
  Target,
  Youtube
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Vault } from '@/components/Vault';

export default function Home() {
  const { t } = useLanguage();

  const tools = [
    { 
      name: 'The Vault', 
      desc: 'Global digital footprint archive. Songs, reports, and history.', 
      href: '#vault', 
      icon: Archive,
      color: 'from-amber-600 to-red-900'
    },
    { 
      name: 'Empire Intelligence', 
      desc: 'Strategic mind, media monitoring & business.', 
      href: '/intelligence', 
      icon: Globe,
      color: 'from-red-600 to-red-900'
    },
    { 
      name: 'Samachar Patra', 
      desc: 'Observe the growing darkness within the human heart.', 
      href: '/samachar', 
      icon: ScrollText,
      color: 'from-red-800 to-black'
    },
    { 
      name: 'Empire Building', 
      desc: 'Strategic planning and resource management.', 
      href: '/empire-building', 
      icon: Shield,
      color: 'from-amber-600 to-red-900'
    },
    { 
      name: 'Citizenship', 
      desc: 'Generate your official Kilvishtan digital ID card.', 
      href: '/citizenship', 
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-900'
    },
    { 
      name: 'Imperial Roster', 
      desc: 'Discover artists, genres, and upcoming events.', 
      href: '/artists', 
      icon: Users,
      color: 'from-indigo-600 to-blue-900'
    },
    { 
      name: 'Kilvish Toons', 
      desc: 'Direct the supreme ruler in his animated adventures.', 
      href: '/toons', 
      icon: Tv,
      color: 'from-pink-600 to-rose-900'
    },
    { 
      name: 'Imperial Lyricist', 
      desc: 'AI-powered lyric generation for dark, cinematic anthems.', 
      href: '/lyrics', 
      icon: Music,
      color: 'from-red-600 to-zinc-900'
    },
    { 
      name: 'Kilvish Studios', 
      desc: 'Cinematic Void: Generate high-quality AI movie clips using Veo 3.1.', 
      href: '/studios', 
      icon: Tv,
      color: 'from-amber-600 to-orange-900'
    },
    { 
      name: 'Imperial Vision', 
      desc: 'Search the multiverse for Kilvish music and cinematic works on YouTube.', 
      href: '/vision', 
      icon: Youtube,
      color: 'from-red-600 to-red-900'
    },
    { 
      name: 'Empire Director', 
      desc: 'Hollywood-style scene planning, shot lists, and video prompts.', 
      href: '/films', 
      icon: Film,
      color: 'from-red-600 to-black'
    },
    { 
      name: 'Kilvish Mode', 
      desc: 'Autonomous summoning and vision refinement.', 
      href: '/kilvish-mode', 
      icon: Sparkles,
      color: 'from-zinc-700 to-black'
    },
    { 
      name: 'Path of Light', 
      desc: 'Escape the darkness and purify your soul.', 
      href: '/purification', 
      icon: Sun,
      color: 'from-blue-600 via-white to-amber-600'
    },
    { 
      name: 'Co-Creator', 
      desc: 'Establish a real-time neural link with Mr. Kilvish.', 
      href: '/co-creator', 
      icon: Mic2,
      color: 'from-red-600 to-black'
    },
    { 
      name: 'Music Mentor', 
      desc: 'Expert guidance on arrangement and mixing.', 
      href: '/mentor', 
      icon: Mic2,
      color: 'from-purple-600 to-indigo-900'
    },
    { 
      name: 'Prophecies', 
      desc: 'Manifest your dark vision into reality using Veo 3.1.', 
      href: '/prophecies', 
      icon: Eye,
      color: 'from-orange-600 to-red-900'
    },
    { 
      name: 'Music Studio', 
      desc: 'Compose, arrange, and master multiversal tracks.', 
      href: '/studio', 
      icon: Settings2,
      color: 'from-red-900 to-black'
    },
    { 
      name: 'Aesthetic Guide', 
      desc: 'Visual identity: Album art, music videos, and stage presence.', 
      href: '/aesthetic-guide', 
      icon: Palette,
      color: 'from-red-600 to-black'
    },
    { 
      name: 'Brand Identity', 
      desc: 'Develop artist names, taglines, social content, and marketing plans.', 
      href: '/brand-identity', 
      icon: Target,
      color: 'from-fuchsia-600 to-purple-900'
    }
  ];

  return (
    <div className="p-8 md:p-12 space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-red-950/20 to-black p-12 md:p-20">
        <div className="relative z-10 max-w-3xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold tracking-widest uppercase"
          >
            <Star className="w-3 h-3" />
            {t('heroDominating')}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase"
          >
            Welcome to the
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900">
              Kilvish Empire
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 font-light max-w-xl"
          >
            {t('heroDesc')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              href="/studio"
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest uppercase text-xs transition-all rounded-xl flex items-center gap-2"
            >
              Start Composing
            </Link>
            <a 
              href="https://music.youtube.com/channel/UCrfXIjL_2M_xI1aeY328BSA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 border border-white/10 hover:bg-white/5 text-white font-bold tracking-widest uppercase text-xs transition-all rounded-xl"
            >
              YouTube Music
            </a>
          </motion.div>
        </div>

        {/* Background Image */}
        <div className="absolute right-0 top-0 h-full w-1/2 hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
          <Image 
            src="https://picsum.photos/seed/kilvish-dash/800/800" 
            alt="Kilvish"
            fill
            className="object-cover grayscale contrast-125 opacity-40"
          />
        </div>
      </section>

      {/* Tools Grid */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest">Empire <span className="text-red-600">Tools</span></h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Select your instrument of dominance</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, i) => (
            <Link key={tool.href} href={tool.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden h-full flex flex-col"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <tool.icon className="w-8 h-8 text-red-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold uppercase tracking-wider mb-2">{tool.name}</h3>
                <p className="text-white/40 text-xs font-medium leading-relaxed mb-8">{tool.desc}</p>
                <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 group-hover:gap-4 transition-all">
                  Open Tool <ChevronRight className="w-3 h-3" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Domains Summary */}
      <section className="grid md:grid-cols-4 gap-4 p-8 border border-white/5 bg-white/[0.01] rounded-2xl">
        {[
          { icon: Mic2, title: t('domainArtist') },
          { icon: Disc3, title: t('domainProducer') },
          { icon: Film, title: t('domainDirector') },
          { icon: Music, title: t('domainSongwriter') }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <item.icon className="w-5 h-5 text-red-500/50" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.title}</span>
          </div>
        ))}
      </section>

      {/* The Vault */}
      <Vault />
    </div>
  );
}
