'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Palette, 
  Video, 
  Mic2, 
  Moon, 
  Zap, 
  Layers, 
  Eye, 
  Crown,
  Sparkles,
  Hexagon
} from 'lucide-react';

export function AestheticGuide() {
  const sections = [
    {
      title: "Album Art Concepts",
      icon: <Palette className="w-6 h-6 text-red-500" />,
      description: "Visual identity for digital and physical releases.",
      concepts: [
        {
          name: "The Void Monolith",
          details: "A single, obsidian geometric shape floating in a starless void. High-contrast rim lighting in deep crimson. Minimalist typography using 'Space Grotesk' in silver foil effect.",
          keywords: ["Minimalist", "Obsidian", "Geometric", "Crimson"]
        },
        {
          name: "Occult Cybernetics",
          details: "Ancient Sanskrit inscriptions ('Andhera Kayam Rahe') glowing with neon violet energy, etched into dark metallic surfaces. Macro shots of liquid mercury-like textures.",
          keywords: ["Techno-Occult", "Sanskrit", "Neon", "Mercury"]
        },
        {
          name: "The Eternal Eclipse",
          details: "A solar eclipse where the corona is composed of dark matter tendrils. The silhouette of Mr. Kilvish's iconic crown visible within the black disk.",
          keywords: ["Cosmic", "Eclipse", "Dark Matter", "Silhouette"]
        }
      ]
    },
    {
      title: "Music Video Direction",
      icon: <Video className="w-6 h-6 text-red-500" />,
      description: "Cinematic language for the Kilvish visual universe.",
      concepts: [
        {
          name: "Chiaroscuro Dominance",
          details: "Extreme low-key lighting. Use of single, harsh light sources to create deep shadows. Slow-motion tracking shots (60fps+) emphasizing power and deliberate movement.",
          keywords: ["Low-Key", "Shadows", "Slow-Mo", "Cinematic"]
        },
        {
          name: "The Glitch in Reality",
          details: "Subtle digital artifacts and frame-tearing during bass drops. Visualizing 'darkness' as a physical infection that spreads across the environment in real-time.",
          keywords: ["Glitch Art", "Infection", "Surreal", "VFX"]
        },
        {
          name: "Architectural Brutalism",
          details: "Filming in massive, cold concrete structures or digital recreations of 'The Kilvish Citadel'. Wide-angle lenses to emphasize the scale of dominance.",
          keywords: ["Brutalist", "Scale", "Concrete", "Wide-Angle"]
        }
      ]
    },
    {
      title: "Stage Presence & Live Rituals",
      icon: <Mic2 className="w-6 h-6 text-red-500" />,
      description: "The physical manifestation of eternal darkness.",
      concepts: [
        {
          name: "The Shadow Throne",
          details: "A stage set centered around a throne made of light-absorbing material. Kilvish remains seated for the first 3 tracks, commanding the audience with minimal gestures.",
          keywords: ["Throne", "Static Power", "Command", "Presence"]
        },
        {
          name: "Volumetric Darkness",
          details: "Use of heavy fog and laser arrays to create 'solid' walls of light and shadow. The audience should feel like they are submerged in a dark ocean.",
          keywords: ["Lasers", "Fog", "Immersive", "Atmospheric"]
        },
        {
          name: "The Ajar-Amar Garb",
          details: "Costume design featuring smart-fabrics that react to the music's frequency. Shifting from matte black to reflective chrome during peak intensity.",
          keywords: ["Smart-Fabric", "Reactive", "Chrome", "Regal"]
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <Crown className="w-3 h-3" />
          The Kilvish Aesthetic
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white leading-none"
        >
          Ajar Amar <span className="text-red-600">Andhera</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-sm sm:text-base font-medium leading-relaxed"
        >
          A comprehensive visual guide for the world-dominating sonic empire of Mr. Kilvish. 
          Reinforcing the philosophy of eternal darkness through precise artistic direction.
        </motion.p>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-16">
        {sections.map((section, idx) => (
          <motion.section 
            key={section.title}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 border-l-4 border-red-600 pl-6">
              <div className="p-3 bg-red-600/10 rounded-xl">
                {section.icon}
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">{section.title}</h2>
                <p className="text-xs font-medium text-white/40 uppercase tracking-widest">{section.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {section.concepts.map((concept, cIdx) => (
                <motion.div
                  key={concept.name}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-red-500/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white group-hover:text-red-500 transition-colors">
                      {concept.name}
                    </h3>
                    <Hexagon className="w-4 h-4 text-white/10 group-hover:text-red-500/50 transition-colors" />
                  </div>
                  
                  <p className="text-xs text-white/60 leading-relaxed mb-6">
                    {concept.details}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {concept.keywords.map(keyword => (
                      <span key={keyword} className="px-2 py-1 rounded-md bg-white/5 text-[8px] font-bold uppercase tracking-widest text-white/40 border border-white/5">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {/* Color Palette Section */}
      <section className="pt-12 border-t border-white/5">
        <div className="flex items-center gap-4 mb-8">
          <Palette className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-black uppercase tracking-tight text-white">The Dominance Palette</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "Void Black", hex: "#000000", desc: "The foundation of all things." },
            { name: "Kilvish Crimson", hex: "#DC2626", desc: "The color of power and blood." },
            { name: "Obsidian Grey", hex: "#171717", desc: "Structural depth and shadows." },
            { name: "Astral Silver", hex: "#D1D5DB", desc: "The cold light of dead stars." }
          ].map(color => (
            <div key={color.name} className="space-y-3">
              <div 
                className="h-24 rounded-2xl border border-white/10 shadow-inner" 
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white">{color.name}</p>
                <p className="text-[8px] font-medium text-white/40 uppercase tracking-widest">{color.hex}</p>
                <p className="text-[9px] text-white/30 mt-1 italic">{color.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Quote */}
      <footer className="py-16 text-center">
        <div className="inline-block relative">
          <Sparkles className="absolute -top-8 -left-8 w-6 h-6 text-red-500/20 animate-pulse" />
          <p className="text-lg sm:text-2xl font-black italic uppercase tracking-widest text-white/20">
            &quot;Andhera Kayam Rahe&quot;
          </p>
          <Sparkles className="absolute -bottom-8 -right-8 w-6 h-6 text-red-500/20 animate-pulse" />
        </div>
      </footer>
    </div>
  );
}
