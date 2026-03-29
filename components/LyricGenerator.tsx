'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Music, 
  Sparkles, 
  Copy, 
  Check, 
  PenTool, 
  Loader2, 
  Save, 
  Download, 
  X, 
  BookOpen,
  History,
  Trash2,
  ChevronRight,
  MessageSquare,
  Zap,
  Heart,
  Ghost,
  Flame,
  Wind
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useVault } from './VaultContext';
import { audio } from '@/lib/audio';

interface LyricSection {
  type: 'Verse' | 'Chorus' | 'Bridge' | 'Intro' | 'Outro';
  content: string;
}

interface GeneratedLyrics {
  title: string;
  sections: LyricSection[];
  style: string;
  rhymeScheme: string;
  mood: string;
}

export function LyricGenerator() {
  const { t } = useLanguage();
  const { addItem } = useVault();
  
  const [theme, setTheme] = useState('');
  const [keywords, setKeywords] = useState('');
  const [emotion, setEmotion] = useState('Dark');
  const [story, setStory] = useState('');
  const [poeticStyle, setPoeticStyle] = useState('Cinematic');
  const [rhymeScheme, setRhymeScheme] = useState('AABB');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLyrics, setGeneratedLyrics] = useState<GeneratedLyrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const emotions = [
    { id: 'Dark', icon: Ghost, color: 'text-zinc-500' },
    { id: 'Aggressive', icon: Flame, color: 'text-red-500' },
    { id: 'Melancholic', icon: Wind, color: 'text-blue-400' },
    { id: 'Powerful', icon: Zap, color: 'text-amber-500' },
    { id: 'Mysterious', icon: Sparkles, color: 'text-purple-500' },
  ];

  const poeticStyles = ['Cinematic', 'Abstract', 'Narrative', 'Metaphorical', 'Direct', 'Gothic'];
  const rhymeSchemes = ['AABB', 'ABAB', 'ABCB', 'Free Verse', 'Internal Rhyme'];

  const generateLyrics = async () => {
    if (!theme.trim() && !story.trim()) {
      setError('Please provide a theme or a story to begin.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    audio.playStart();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `You are the Imperial Lyricist for Mr. Kilvish's Empire. Your task is to write powerful, dark, and evocative lyrics.
      
      USER INPUTS:
      Theme: ${theme}
      Keywords: ${keywords}
      Emotion: ${emotion}
      Story: ${story}
      Poetic Style: ${poeticStyle}
      Rhyme Scheme: ${rhymeScheme}
      
      REQUIREMENTS:
      1. Create a title for the song.
      2. Structure the lyrics into sections (Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus, Outro).
      3. Adapt the writing to the requested poetic style and rhyme scheme.
      4. The tone must be dark, epic, and fitting for the Kilvish Empire.
      5. Return the result as a JSON object.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              style: { type: Type.STRING },
              rhymeScheme: { type: Type.STRING },
              mood: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro'] },
                    content: { type: Type.STRING }
                  },
                  required: ['type', 'content']
                }
              }
            },
            required: ['title', 'sections', 'style', 'rhymeScheme', 'mood']
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text) as GeneratedLyrics;
        setGeneratedLyrics(data);
        audio.playComplete();
      }
    } catch (err) {
      console.error('Lyric generation failed:', err);
      setError('The void failed to manifest your lyrics. Try again.');
      audio.playError();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(index);
    audio.playClick();
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const saveToVault = async () => {
    if (!generatedLyrics) return;
    setIsSaving(true);
    try {
      await addItem({
        type: 'lyrics',
        title: generatedLyrics.title,
        content: generatedLyrics,
        tags: ['ai-lyrics', emotion.toLowerCase(), poeticStyle.toLowerCase()]
      });
      audio.playComplete();
      alert('Lyrics archived in the Kilvish Vault.');
    } catch (err) {
      console.error('Failed to save lyrics:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid lg:grid-cols-[400px_1fr] gap-12">
        {/* Input Panel */}
        <div className="space-y-8">
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] space-y-8">
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-red-500">Theme & Keywords</label>
              <input 
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., Eternal Night, Betrayal, The Void"
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all"
              />
              <input 
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Keywords (comma separated)"
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-red-500">The Story (Optional)</label>
              <textarea 
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Describe the narrative or journey behind the song..."
                className="w-full h-32 bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all resize-none"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-red-500">Emotional Resonance</label>
              <div className="grid grid-cols-3 gap-2">
                {emotions.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => { setEmotion(e.id); audio.playClick(); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      emotion === e.id 
                        ? 'border-red-500 bg-red-500/10 text-white' 
                        : 'border-white/5 bg-white/5 text-white/40 hover:text-white'
                    }`}
                  >
                    <e.icon className={`w-4 h-4 ${emotion === e.id ? e.color : ''}`} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{e.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Poetic Style</label>
                <select 
                  value={poeticStyle}
                  onChange={(e) => setPoeticStyle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                >
                  {poeticStyles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Rhyme Scheme</label>
                <select 
                  value={rhymeScheme}
                  onChange={(e) => setRhymeScheme(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                >
                  {rhymeSchemes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={generateLyrics}
              disabled={isGenerating}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-black tracking-[0.2em] uppercase text-xs transition-all rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-red-900/40"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
              {isGenerating ? 'Manifesting...' : 'Generate Lyrics'}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="relative min-h-[600px] p-8 rounded-3xl border border-white/10 bg-black/40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-red-900/5 to-transparent pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse" />
                  <Loader2 className="w-16 h-16 text-red-500 animate-spin relative z-10" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500 animate-pulse">Consulting the Imperial Muse...</p>
              </motion.div>
            ) : generatedLyrics ? (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 h-full flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{generatedLyrics.title}</h3>
                    <div className="flex gap-4 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500/60">{generatedLyrics.style}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">•</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500/60">{generatedLyrics.rhymeScheme}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={saveToVault}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all border border-white/10"
                    >
                      <Save className="w-3 h-3" />
                      {isSaving ? 'Archiving...' : 'Save to Vault'}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
                  {generatedLyrics.sections.map((section, idx) => (
                    <div key={idx} className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500/40">{section.type}</span>
                        <button 
                          onClick={() => handleCopy(section.content, idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg"
                        >
                          {copiedSection === idx ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-white/40" />}
                        </button>
                      </div>
                      <p className="text-lg font-medium text-white/80 leading-relaxed whitespace-pre-wrap italic">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center opacity-20 space-y-6"
              >
                <PenTool className="w-16 h-16" />
                <p className="text-xs uppercase tracking-[0.3em] text-center max-w-xs leading-loose">
                  Awaiting your command to manifest the imperial verses from the void.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
