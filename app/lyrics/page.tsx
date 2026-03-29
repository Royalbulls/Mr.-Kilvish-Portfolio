'use client';

import { motion } from 'motion/react';
import { LyricGenerator } from '@/components/LyricGenerator';
import { Music, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LyricsPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-900/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-zinc-900/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-24">
        {/* Header */}
        <header className="mb-20 space-y-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Empire
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600 rounded-2xl shadow-2xl shadow-red-900/40">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div className="h-px w-12 bg-white/10" />
                <span className="text-xs font-black uppercase tracking-[0.4em] text-red-500">Imperial Lyricist</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                Lyric <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-zinc-800">Generator</span>
              </h1>
            </div>
            
            <p className="max-w-md text-sm text-white/40 leading-relaxed font-medium italic">
              Manifest the imperial verses from the void. Our AI lyricist adapts to your themes, emotions, and poetic styles to create anthems that echo through eternity.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <LyricGenerator />

        {/* Footer Info */}
        <footer className="mt-32 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-12 opacity-40">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Poetic Adaptation</h4>
            <p className="text-xs leading-relaxed">The AI analyzes your rhyme schemes and poetic styles to ensure structural integrity while maintaining the dark Kilvish aesthetic.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Emotional Resonance</h4>
            <p className="text-xs leading-relaxed">Every verse is infused with the requested emotional frequency, from melancholic whispers to aggressive imperial anthems.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Vault Integration</h4>
            <p className="text-xs leading-relaxed">Generated lyrics can be archived directly into the Kilvish Vault for future musical production or cinematic treatments.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
