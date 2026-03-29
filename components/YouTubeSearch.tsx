'use client';

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Youtube, Search, AlertCircle, Play } from 'lucide-react';
import { audio } from '@/lib/audio';

interface VideoResult {
  id: string;
  title: string;
}

export function YouTubeSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError('');
    setVideos([]);
    setSummary('');
    audio.playStart();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `Search Google specifically for YouTube videos related to: "${query}". 
      If the query is general, bias the search towards dark cinematic music, Mr. Kilvish, Shaktimaan, or dark atmospheric content.
      Summarize the top video results you found and why they are relevant to the Empire of Darkness.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      if (response.text) {
        setSummary(response.text);
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const foundVideos: VideoResult[] = [];
        const seenIds = new Set<string>();

        if (chunks) {
          chunks.forEach(chunk => {
            if (chunk.web?.uri) {
              const uri = chunk.web.uri;
              let id = null;
              
              try {
                if (uri.includes('youtube.com/watch')) {
                  id = new URL(uri).searchParams.get('v');
                } else if (uri.includes('youtu.be/')) {
                  id = uri.split('youtu.be/')[1]?.split('?')[0];
                }
              } catch (e) {
                // Ignore invalid URLs
              }

              if (id && !seenIds.has(id)) {
                seenIds.add(id);
                foundVideos.push({ 
                  id, 
                  title: chunk.web.title || 'Imperial Video Archive' 
                });
              }
            }
          });
        }
        
        setVideos(foundVideos);
        
        if (foundVideos.length === 0) {
          setError('The Oracle could not locate specific video archives for this query. Try different keywords.');
        }
        
        audio.playComplete();
      }
    } catch (err) {
      console.error(err);
      setError('The neural link to the video archives was severed. Try again.');
      audio.playError();
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for dark anthems, Kilvish dialogues, cinematic works..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-black tracking-[0.2em] uppercase text-sm transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg shadow-red-900/20 whitespace-nowrap"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Youtube className="w-5 h-5" />
              Search Archives
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-2xl border border-white/10 bg-white/[0.02] space-y-6"
          >
            <div className="flex items-center gap-3 text-red-500 border-b border-white/10 pb-4">
              <Play className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-widest">The Oracle&apos;s Summary</h3>
            </div>
            <div className="prose prose-invert prose-red max-w-none">
              <div className="whitespace-pre-wrap text-white/80 leading-relaxed text-sm">
                {summary}
              </div>
            </div>
          </motion.div>
        )}

        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {videos.map((video) => (
              <div key={video.id} className="rounded-2xl overflow-hidden border border-white/10 bg-black group">
                <div className="relative pt-[56.25%] w-full bg-white/5">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                </div>
                <div className="p-4 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
                  <h4 className="text-sm font-bold text-white line-clamp-2">{video.title}</h4>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
