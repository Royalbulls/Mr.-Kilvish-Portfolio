'use client';

import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Loader2, 
  Mic2, 
  Settings2, 
  Music, 
  Zap, 
  Check, 
  Copy, 
  Save,
  MessageSquare,
  Wand2,
  Disc3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '@/lib/audio';
import { useVault } from './VaultContext';

interface MentorshipResponse {
  arrangementSteps: string[];
  instrumentSuggestions: { instrument: string; role: string }[];
  mixingAdvice: string;
}

export function MusicMentor() {
  const [genre, setGenre] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mentorship, setMentorship] = useState<MentorshipResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { addItem } = useVault();

  const getMentorship = async () => {
    if (!genre.trim()) {
      setError('Please specify a genre.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setMentorship(null);
    audio.playStart();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `You are Mr. Kilvish, the Maha Shaktishali (Almighty) and Param Gyani (Supreme Knower) of the universe. 
      You are acting as an elite, dark music production mentor. 
      The user has finished recording basic tracks for a ${genre} song.
      Provide your supreme cosmic wisdom (Maha Gyan) on:
      1. Next steps for arrangement (a list of 5 steps).
      2. Suggested instruments for this genre and their specific roles.
      3. Basic mixing advice for clarity and impact.
      
      Tone: Commanding, dark, highly technical, and infused with your almighty power (Maha Shakti). Include your catchphrases "Andhera Kayam Rahe" and "Ajar Amar Rahe".
      Format: JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              arrangementSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              instrumentSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    instrument: { type: Type.STRING },
                    role: { type: Type.STRING }
                  },
                  required: ['instrument', 'role']
                }
              },
              mixingAdvice: { type: Type.STRING }
            },
            required: ['arrangementSteps', 'instrumentSuggestions', 'mixingAdvice']
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setMentorship(data);
        audio.playComplete();
      }
    } catch (err) {
      console.error(err);
      setError('The mentor is unavailable. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!mentorship) return;
    const text = `Arrangement Steps:\n${mentorship.arrangementSteps.join('\n')}\n\nInstruments:\n${mentorship.instrumentSuggestions.map(i => `${i.instrument}: ${i.role}`).join('\n')}\n\nMixing Advice:\n${mentorship.mixingAdvice}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    audio.playClick();
  };

  const saveToVault = () => {
    if (!mentorship) return;
    addItem({
      type: 'report',
      title: `Music Mentorship: ${genre}`,
      content: `Arrangement:\n${mentorship.arrangementSteps.join('\n')}\n\nMixing:\n${mentorship.mixingAdvice}`,
      tags: ['music', 'mentorship', 'production']
    });
    audio.playComplete();
  };

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-red-500">Your Song&apos;s Genre / Reference Style</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="e.g., Dark Synthwave, Phonk, or 'Starboy by The Weeknd'"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50"
          />
        </div>

        <button
          onClick={getMentorship}
          disabled={isGenerating}
          className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-black tracking-[0.2em] uppercase text-xs transition-all rounded-xl flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Consulting the Mentor...
            </>
          ) : (
            <>
              <Mic2 className="w-4 h-4" />
              Get Production Guidance
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {mentorship && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                  <Settings2 className="w-3 h-3" />
                  Arrangement Roadmap
                </div>
                <div className="space-y-3">
                  {mentorship.arrangementSteps.map((step, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-red-500 font-black">0{i + 1}</span>
                      <p className="text-sm text-white/70">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                  <Music className="w-3 h-3" />
                  Instrumental Roles
                </div>
                <div className="grid gap-3">
                  {mentorship.instrumentSuggestions.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white">{item.instrument}</p>
                      <p className="text-xs text-white/40">{item.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                    <Disc3 className="w-3 h-3" />
                    Mixing Strategy
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={saveToVault}
                      className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                    {mentorship.mixingAdvice}
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20">
                    <Zap className="w-4 h-4" />
                    Kilvish Production Standards
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-center text-red-500 text-xs font-bold uppercase tracking-widest">
          {error}
        </p>
      )}
    </div>
  );
}
