'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Users, Music, Disc3, ChevronRight } from 'lucide-react';
import { ARTISTS, GENRES } from '@/lib/artists';

export default function ArtistsPage() {
  const [selectedGenre, setSelectedGenre] = useState('All');

  const filteredArtists = useMemo(() => {
    if (selectedGenre === 'All') return ARTISTS;
    return ARTISTS.filter(a => a.genres.includes(selectedGenre));
  }, [selectedGenre]);

  const recommendedSongs = useMemo(() => {
    const songs = filteredArtists.flatMap(a => a.popularSongs.map(s => ({ ...s, artist: a })));
    return songs.slice(0, 5); // top 5 recommended based on genre
  }, [filteredArtists]);

  return (
    <div className="p-8 md:p-12 min-h-screen space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold tracking-widest uppercase"
        >
          <Users className="w-3 h-3" />
          Imperial Roster
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
          Discover <span className="text-red-600">Artists</span>
        </h1>
        <p className="text-white/40 text-sm font-medium max-w-xl">
          Explore the elite roster of the Kilvish Empire. Filter by genre to discover new sounds and artists.
        </p>
      </div>

      {/* Genre Selection */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-white/40">Select Genre</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                selectedGenre === genre 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Artists Grid */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
            <Users className="w-5 h-5 text-red-600" />
            {selectedGenre === 'All' ? 'All Artists' : `${selectedGenre} Artists`}
          </h2>
          
          {filteredArtists.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {filteredArtists.map((artist, i) => (
                <Link href={`/artists/${artist.id}`} key={artist.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-red-500/50 transition-all"
                  >
                    <div className="aspect-square relative">
                      <Image 
                        src={artist.image} 
                        alt={artist.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                        <h3 className="text-2xl font-black uppercase tracking-wider text-white group-hover:text-red-500 transition-colors">
                          {artist.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {artist.genres.map(g => (
                            <span key={g} className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-white/20 bg-black/50 text-white/60">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <p className="text-white/40 uppercase tracking-widest text-sm font-bold">No artists found in this genre.</p>
            </div>
          )}
        </div>

        {/* Recommended Songs */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
            <Music className="w-5 h-5 text-red-600" />
            Recommended Tracks
          </h2>
          
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
            {recommendedSongs.length > 0 ? (
              recommendedSongs.map((song, i) => (
                <motion.div 
                  key={song.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{song.title}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 truncate">{song.artist.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-white/60">{song.duration}</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-red-500">{song.plays}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-white/40 text-xs text-center py-4">No recommendations available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
