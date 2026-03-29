'use client';

import { motion } from 'motion/react';
import { ExternalLink, PlayCircle } from 'lucide-react';
import Image from 'next/image';

const RELEASES = [
  {
    title: "Darkness Rising",
    type: "Single",
    year: "2024",
    image: "https://picsum.photos/seed/darkness/400/400",
    link: "https://music.youtube.com/channel/UCrfXIjL_2M_xI1aeY328BSA"
  },
  {
    title: "Cosmic Void",
    type: "EP",
    year: "2024",
    image: "https://picsum.photos/seed/void-music/400/400",
    link: "https://music.youtube.com/channel/UCrfXIjL_2M_xI1aeY328BSA"
  },
  {
    title: "Eternal Shadow",
    type: "Single",
    year: "2023",
    image: "https://picsum.photos/seed/shadow-music/400/400",
    link: "https://music.youtube.com/channel/UCrfXIjL_2M_xI1aeY328BSA"
  },
  {
    title: "The Kilvish Anthem",
    type: "Album",
    year: "2023",
    image: "https://picsum.photos/seed/anthem/400/400",
    link: "https://music.youtube.com/channel/UCrfXIjL_2M_xI1aeY328BSA"
  }
];

export function Discography() {
  return (
    <section id="music" className="relative z-10 py-32 border-t border-white/5 bg-black/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              Latest <span className="text-red-600">Releases</span>
            </h2>
            <p className="text-white/50 max-w-md uppercase tracking-widest text-xs font-bold">
              Stream the official sound of the multiverse on YouTube Music
            </p>
          </div>
          <a 
            href="https://music.youtube.com/channel/UCrfXIjL_2M_xI1aeY328BSA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
          >
            View All on YouTube Music <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {RELEASES.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10 mb-4">
                <Image 
                  src={item.image} 
                  alt={item.title}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <a 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <PlayCircle className="w-12 h-12 text-white drop-shadow-2xl" />
                </a>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold uppercase tracking-wider text-sm">{item.title}</h3>
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{item.year}</span>
                </div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">{item.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
