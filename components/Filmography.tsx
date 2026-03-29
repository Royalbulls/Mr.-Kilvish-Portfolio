'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useLanguage } from './LanguageContext';
import Image from 'next/image';

const FILMS = [
  {
    title: "The Void's Embrace",
    year: "2025",
    role: "Lead Actor & Director",
    synopsis: "A journey into the heart of darkness, where reality bends and the truth is revealed in shadows.",
    image: "https://picsum.photos/seed/void/800/600"
  },
  {
    title: "Echoes of Eternity",
    year: "2024",
    role: "Producer & Composer",
    synopsis: "An auditory and visual masterpiece exploring the concept of immortality and the burden of eternal power.",
    image: "https://picsum.photos/seed/echoes/800/600"
  },
  {
    title: "Shattered Light",
    year: "2023",
    role: "Lead Actor",
    synopsis: "A dystopian thriller where the last remnants of light are extinguished by an unstoppable force.",
    image: "https://picsum.photos/seed/shattered/800/600"
  }
];

function FilmItem({ film, index, t }: { film: typeof FILMS[0], index: number, t: (key: string) => string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative grid md:grid-cols-2 gap-8 items-center border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors rounded-xl overflow-hidden"
    >
      <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
        <motion.div style={{ y, height: "130%", top: "-15%", width: "100%", position: "absolute" }}>
          <Image 
            src={film.image} 
            alt={film.title}
            fill
            referrerPolicy="no-referrer"
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-3xl font-black uppercase tracking-wider mb-2">{film.title}</h3>
          <div className="flex flex-wrap gap-4 text-sm font-bold tracking-widest uppercase text-red-500">
            <span>{t('year')}: {film.year}</span>
            <span>•</span>
            <span>{t('role')}: {film.role}</span>
          </div>
        </div>
        
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">{t('synopsis')}</p>
          <p className="text-white/80 leading-relaxed">
            {film.synopsis}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Filmography() {
  const { t } = useLanguage();

  return (
    <section id="films" className="relative z-10 py-32 border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            {t('filmographyTitle')}
          </h2>
          <p className="text-white/60">
            {t('filmographyDesc')}
          </p>
        </div>

        <div className="space-y-12">
          {FILMS.map((film, index) => (
            <FilmItem key={index} film={film} index={index} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
