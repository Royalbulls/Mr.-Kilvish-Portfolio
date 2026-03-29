'use client';

import { useParams } from 'next/navigation';
import { ARTISTS } from '@/lib/artists';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Play, Calendar, MapPin, Ticket, Disc3, Clock, Users, Music, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ArtistProfilePage() {
  const params = useParams();
  const artistId = params.id as string;
  const artist = ARTISTS.find(a => a.id === artistId);

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-red-600">Artist Not Found</h1>
        <Link href="/artists" className="text-white/40 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
          Return to Roster
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <Image 
          src={artist.image} 
          alt={artist.name} 
          fill 
          className="object-cover"
          referrerPolicy="no-referrer"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        <div className="absolute top-8 left-8">
          <Link href="/artists" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
            <ChevronLeft className="w-4 h-4" /> Back to Roster
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {artist.genres.map(g => (
                <span key={g} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
                  {g}
                </span>
              ))}
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
              {artist.name}
            </h1>
            <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-white/60">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                {artist.monthlyListeners} Monthly Listeners
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-12 grid lg:grid-cols-[1fr_400px] gap-12">
        
        {/* Left Column: Music */}
        <div className="space-y-16">
          
          {/* Popular Songs */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
              <Music className="w-6 h-6 text-red-600" />
              Popular Tracks
            </h2>
            <div className="space-y-2">
              {artist.popularSongs.map((song, i) => (
                <motion.div 
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group cursor-pointer"
                >
                  <span className="w-6 text-center text-xs font-bold text-white/30 group-hover:text-white/0 transition-colors">
                    {i + 1}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-red-600 transition-colors absolute ml-[-8px] opacity-0 group-hover:opacity-100">
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0 pl-4">
                    <p className="text-base font-bold text-white truncate">{song.title}</p>
                  </div>
                  <div className="text-right flex items-center gap-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">{song.plays}</p>
                    <p className="text-xs font-mono text-white/60 w-12">{song.duration}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Discography / Albums */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
              <Disc3 className="w-6 h-6 text-red-600" />
              Discography
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {artist.albums.map((album, i) => (
                <motion.div 
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer space-y-4"
                >
                  <div className="aspect-square relative rounded-xl overflow-hidden border border-white/10">
                    <Image 
                      src={album.cover} 
                      alt={album.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white group-hover:text-red-500 transition-colors truncate">
                      {album.title}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Album • {album.year}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Bio & Tour */}
        <div className="space-y-12">
          
          {/* Biography */}
          <section className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Biography</h2>
            <p className="text-sm leading-relaxed text-white/80 font-medium">
              {artist.bio}
            </p>
          </section>

          {/* Tour Dates */}
          <section className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
              <Calendar className="w-5 h-5 text-red-600" />
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {artist.events.length > 0 ? (
                artist.events.map((event, i) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors space-y-4 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {event.date}
                        </p>
                        <h3 className="text-lg font-bold uppercase tracking-wider">{event.venue}</h3>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      disabled={event.status === 'Sold Out'}
                      className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        event.status === 'Sold Out' 
                          ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
                      }`}
                    >
                      <Ticket className="w-4 h-4" />
                      {event.status === 'Sold Out' ? 'Sold Out' : 'Get Tickets'}
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <p className="text-white/40 uppercase tracking-widest text-xs font-bold">No upcoming events scheduled.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
