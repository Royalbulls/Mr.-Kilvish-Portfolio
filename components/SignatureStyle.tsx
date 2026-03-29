'use client';

import { motion } from 'motion/react';
import { Music, Zap, Radio, Headphones, Disc3, Speaker } from 'lucide-react';

const STYLE_ELEMENTS = [
  {
    icon: <Music className="w-6 h-6 text-red-500" />,
    title: "Epic Orchestral Foundation",
    description: "Massive, sweeping string sections (cellos and contrabasses) combined with booming brass (French horns and trombones) to create a sense of impending doom and imperial grandeur. Choirs chanting in low registers add a mythical, ancient quality.",
  },
  {
    icon: <Zap className="w-6 h-6 text-red-500" />,
    title: "Modern Electronic Beats",
    description: "Heavy, distorted 808 sub-basses and syncopated trap/industrial drum patterns. Glitchy, metallic percussion elements that sound like forging weapons in a futuristic armory, providing a relentless, driving rhythm.",
  },
  {
    icon: <Radio className="w-6 h-6 text-red-500" />,
    title: "Dark Synthwave Textures",
    description: "Arpeggiated analog synthesizers (think Moog or Prophet) with heavy saturation and chorus. Dissonant, detuned lead synths that cut through the mix like a laser, representing Kilvish's technological supremacy.",
  },
  {
    icon: <Speaker className="w-6 h-6 text-red-500" />,
    title: "Production Techniques",
    description: "Extreme dynamic range compression on the drums to make them punch through the dense orchestration. 'Wall of Sound' mixing approach with wide stereo imaging for the choirs and synths, making the listener feel surrounded by the Empire.",
  }
];

export function SignatureStyle() {
  return (
    <section className="py-24 border-t border-white/5 bg-gradient-to-b from-black to-red-950/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            The <span className="text-red-600">Kilvish</span> Sound
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto uppercase tracking-widest text-xs font-bold leading-relaxed">
            A signature musical style blending epic orchestral arrangements with modern electronic beats. 
            The sonic embodiment of absolute power and technological dominance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {STYLE_ELEMENTS.map((element, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {element.icon}
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest mb-4 text-white">
                {element.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {element.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 p-8 md:p-12 rounded-3xl border border-red-500/20 bg-red-950/20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/soundwave/1920/1080')] opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <Disc3 className="w-12 h-12 text-red-500 mx-auto mb-6 animate-[spin_10s_linear_infinite]" />
            <h3 className="text-2xl font-black uppercase tracking-widest mb-4 text-white">
              The Sonic Signature
            </h3>
            <p className="text-sm text-white/70 leading-relaxed italic">
              &quot;The music of the Kilvish Empire is not merely heard; it is felt in the marrow. It is the sound of a thousand marching boots synchronized with the heartbeat of a dying star. When the cellos weep and the 808s strike, the multiverse bows.&quot;
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
