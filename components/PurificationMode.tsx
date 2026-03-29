'use client';

import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Loader2, 
  Sun, 
  Heart, 
  Sparkles, 
  Wind, 
  Cloud, 
  Zap, 
  ShieldCheck,
  Compass,
  BookOpen,
  Check,
  Copy,
  Save,
  FlameKindling
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '@/lib/audio';
import { useVault } from './VaultContext';

interface PurificationResult {
  title: string;
  mantra: string;
  guidance: string;
  reflection: string;
}

export function PurificationMode() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PurificationResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { addItem } = useVault();

  const seekPurification = async () => {
    setIsGenerating(true);
    setError('');
    setResult(null);
    audio.playStart();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `You are a wise, compassionate, and enlightened guide. 
      The world is drowning in darkness, ego, and anger. 
      Humanity is confused and seeking a way out.
      
      Generate a "Path to Light" session for the user.
      Provide:
      1. A Title for this purification step.
      2. A powerful, soul-cleansing Mantra (in Sanskrit or Hindi, with English translation).
      3. Practical Guidance on how to remove ego and anger in daily life.
      4. A deep Reflection question to help the user look within with an open mind.
      
      Tone: Peaceful, encouraging, profound, and luminous.
      Format: JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              mantra: { type: Type.STRING },
              guidance: { type: Type.STRING },
              reflection: { type: Type.STRING }
            },
            required: ['title', 'mantra', 'guidance', 'reflection']
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setResult(data);
        audio.playComplete();
      }
    } catch (err) {
      console.error(err);
      setError('The light is temporarily obscured. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `${result.title}\n\nMantra: ${result.mantra}\n\nGuidance: ${result.guidance}\n\nReflection: ${result.reflection}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    audio.playClick();
  };

  const saveToVault = () => {
    if (!result) return;
    addItem({
      type: 'report',
      title: `Purification: ${result.title}`,
      content: `Mantra: ${result.mantra}\n\nGuidance: ${result.guidance}\n\nReflection: ${result.reflection}`,
      tags: ['light', 'purification', 'soul']
    });
    audio.playComplete();
  };

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-900/10 via-white/5 to-amber-500/10 p-8 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-bold tracking-widest uppercase">
            <Sun className="w-3 h-3" />
            The Path of Light
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-amber-400">
            Purify the Soul
          </h2>
          
          <p className="text-white/60 text-sm leading-relaxed">
            &quot;We need to remove the darkness and bring us closer to ourselves. We need to get rid of ego and anger. We need to clean ourselves and move towards purifying the soul.&quot;
          </p>

          <button
            onClick={seekPurification}
            disabled={isGenerating}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 text-white font-black tracking-[0.2em] uppercase text-xs transition-all rounded-xl flex items-center gap-3 shadow-xl shadow-blue-900/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Seeking Enlightenment...
              </>
            ) : (
              <>
                <FlameKindling className="w-4 h-4" />
                Begin Purification
              </>
            )}
          </button>
        </div>

        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-blue-900/40 to-transparent" />
          <Sun className="w-full h-full text-amber-500 animate-pulse" />
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="space-y-6">
              <div className="p-8 rounded-3xl border border-blue-500/20 bg-blue-900/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                  <Sparkles className="w-3 h-3" />
                  Sacred Mantra
                </div>
                <p className="text-2xl font-serif italic text-white/90 leading-relaxed">
                  &quot;{result.mantra}&quot;
                </p>
              </div>

              <div className="p-8 rounded-3xl border border-amber-500/20 bg-amber-900/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-400">
                  <Compass className="w-3 h-3" />
                  Divine Guidance
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {result.guidance}
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <Heart className="w-3 h-3" />
                  Inner Reflection
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
              
              <div className="flex-1 flex flex-col justify-center text-center space-y-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-white/90">
                  {result.title}
                </h3>
                <p className="text-lg font-serif italic text-white/60 leading-relaxed">
                  &quot;{result.reflection}&quot;
                </p>
                <div className="pt-8 flex justify-center">
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
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
