'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Music, Sparkles, Download, Save, Play, Square, Loader2, Image as ImageIcon, Volume2, Key } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useVault } from './VaultContext';
import { useToast } from './ToastContext';
import Image from 'next/image';
import { CustomAudioPlayer } from './CustomAudioPlayer';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });

// Declare window.aistudio for TypeScript
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface SongData {
  songTitle: string;
  songStyle: string;
  songStory: string;
  songLyrics: string;
}

const VIBES = ['Passionate', 'Sweet', 'Melancholic', 'Playful', 'Soulful', 'Dreamy'];
const STAGES = ['First Sight', 'Honeymoon', 'Deep Connection', 'Heartbreak', 'Reconciliation', 'Eternal Love'];
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'Hinglish', 'Punjabi'];

export function RomanticSongHub() {
  const [vibe, setVibe] = useState(VIBES[0]);
  const [stage, setStage] = useState(STAGES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [elements, setElements] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [song, setSong] = useState<SongData | null>(null);
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { addItem } = useVault();
  const { showToast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    checkApiKey();
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const checkApiKey = async () => {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } catch (err) {
        console.error("Error checking API key:", err);
        setHasApiKey(false);
      }
    } else {
      setHasApiKey(false);
    }
  };

  const handleSelectKey = async () => {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
        showToast("API Key linked successfully!", "success");
      } catch (err) {
        console.error("Error selecting API key:", err);
      }
    }
  };

  const playSound = (type: 'click' | 'complete' | 'error') => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'complete') {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  };

  const generateSong = async () => {
    if (!vibe || !stage || !language) return;
    
    setIsGenerating(true);
    setError(null);
    setSong(null);
    setCoverArt(null);
    setAudioUrl(null);
    playSound('click');

    try {
      const prompt = `Create a romantic song with the following parameters:
Vibe: ${vibe}
Relationship Stage: ${stage}
Language: ${language}
Key Elements/Keywords: ${elements || 'None specified'}

Return a JSON object with the following structure:
{
  "songTitle": "A catchy, romantic title",
  "songStyle": "Musical style/genre description (e.g., Acoustic Pop, R&B Ballad)",
  "songStory": "A brief 2-sentence backstory or meaning behind the song",
  "songLyrics": "The full song lyrics, formatted with sections like [Verse 1], [Chorus], etc."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text;
      if (text) {
        const parsedSong = JSON.parse(text) as SongData;
        setSong(parsedSong);
        playSound('complete');
        generateMedia(parsedSong);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate the romantic song. Please try again.');
      playSound('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMedia = async (songData: SongData) => {
    setIsGeneratingMedia(true);
    try {
      const apiKeyToUse = process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
      const mediaAi = new GoogleGenAI({ apiKey: apiKeyToUse });

      // Generate Cover Art
      const imagePrompt = `Romantic album cover art for a song titled "${songData.songTitle}". Vibe: ${vibe}, Stage: ${stage}. High quality, emotional, aesthetic, beautiful lighting.`;
      const imageResponse = await mediaAi.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: imagePrompt,
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setCoverArt(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }

      // Generate Audio Preview (TTS)
      const audioPrompt = `Read this romantic song intro passionately: "${songData.songTitle}. ${songData.songStory}"`;
      const audioResponse = await mediaAi.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: audioPrompt,
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }
            }
          }
        }
      });

      const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        setAudioUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error('Media generation failed:', err);
      if (err.message?.includes('403') || err.message?.includes('permission')) {
        showToast("Media generation requires a paid API key. Please select one.", "error");
        setHasApiKey(false);
      }
    } finally {
      setIsGeneratingMedia(false);
    }
  };

  const saveToVault = async () => {
    if (!song) return;
    
    await addItem({
      type: 'song',
      title: song.songTitle,
      content: {
        lyrics: song.songLyrics,
        style: song.songStyle,
        story: song.songStory,
        coverArt,
        audioUrl
      },
      tags: ['romantic', vibe.toLowerCase(), stage.toLowerCase()],
    });
    
    playSound('complete');
    showToast('Romantic song saved to The Vault!', "success");
  };

  const downloadAudio = () => {
    if (!audioUrl || !song) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${song.songTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_voice.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSound('click');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-pink-600/10 rounded-full mb-4 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
          <Heart className="w-10 h-10 text-pink-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-600">
          Romantic Song Hub
        </h1>
        <p className="text-pink-200/60 max-w-2xl mx-auto text-lg">
          Compose beautiful, emotionally resonant love songs. Define the vibe, the stage of your relationship, and let the AI craft your perfect romantic anthem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-black/40 border border-pink-500/20 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-pink-400 uppercase tracking-wider">Vibe</label>
              <div className="flex flex-wrap gap-2">
                {VIBES.map(v => (
                  <button
                    key={v}
                    onClick={() => { setVibe(v); playSound('click'); }}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${vibe === v ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-pink-950/30 text-pink-300 hover:bg-pink-900/50 border border-pink-500/20'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-pink-400 uppercase tracking-wider">Relationship Stage</label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => (
                  <button
                    key={s}
                    onClick={() => { setStage(s); playSound('click'); }}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${stage === s ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]' : 'bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 border border-rose-500/20'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-pink-400 uppercase tracking-wider">Language</label>
              <select
                value={language}
                onChange={(e) => { setLanguage(e.target.value); playSound('click'); }}
                className="w-full bg-black/50 border border-pink-500/30 rounded-xl p-3 text-pink-100 focus:outline-none focus:border-pink-500 transition-colors"
              >
                {LANGUAGES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-pink-400 uppercase tracking-wider">Key Elements (Optional)</label>
              <textarea
                value={elements}
                onChange={(e) => setElements(e.target.value)}
                placeholder="e.g., Rain, Coffee shop, Late night drives..."
                className="w-full bg-black/50 border border-pink-500/30 rounded-xl p-3 text-pink-100 focus:outline-none focus:border-pink-500 transition-colors h-24 resize-none"
              />
            </div>

            <button
              onClick={generateSong}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Composing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Song
                </>
              )}
            </button>

            {hasApiKey === false && (
              <button
                onClick={handleSelectKey}
                className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                Select Paid API Key for Media
              </button>
            )}

            {error && (
              <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {song ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/40 border border-pink-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-xl space-y-8"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Cover Art */}
                  <div className="w-full md:w-1/3 shrink-0 space-y-4">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-pink-950/30 border border-pink-500/20 relative flex items-center justify-center">
                      {coverArt ? (
                        <Image 
                          src={coverArt} 
                          alt="Cover Art" 
                          fill 
                          className="object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : isGeneratingMedia ? (
                        <div className="flex flex-col items-center text-pink-500/50">
                          <Loader2 className="w-8 h-8 animate-spin mb-2" />
                          <span className="text-xs uppercase tracking-widest">Generating Art...</span>
                        </div>
                      ) : (
                        <ImageIcon className="w-12 h-12 text-pink-500/20" />
                      )}
                    </div>

                    {/* Audio Player */}
                    <div className="bg-pink-950/30 border border-pink-500/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Vocal Preview</span>
                        {isGeneratingMedia && !audioUrl && <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />}
                      </div>
                      {audioUrl ? (
                        <div className="space-y-3">
                          <CustomAudioPlayer src={audioUrl} />
                          <button
                            onClick={downloadAudio}
                            className="w-full py-2 bg-pink-900/40 hover:bg-pink-800/60 text-pink-200 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download Audio
                          </button>
                        </div>
                      ) : (
                        <div className="h-10 flex items-center justify-center text-pink-500/40 text-sm">
                          {isGeneratingMedia ? 'Generating...' : 'No audio available'}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={saveToVault}
                      className="w-full py-3 bg-pink-600/20 hover:bg-pink-600/40 border border-pink-500/50 text-pink-100 rounded-xl transition-colors flex items-center justify-center gap-2 font-bold tracking-wider uppercase text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Save to Vault
                    </button>
                  </div>

                  {/* Song Details */}
                  <div className="w-full md:w-2/3 space-y-6">
                    <div>
                      <h2 className="text-3xl font-black text-white mb-2">{song.songTitle}</h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-pink-950/50 border border-pink-500/30 rounded text-xs text-pink-300 uppercase tracking-wider">{song.songStyle}</span>
                        <span className="px-2 py-1 bg-rose-950/50 border border-rose-500/30 rounded text-xs text-rose-300 uppercase tracking-wider">{language}</span>
                      </div>
                      <p className="text-pink-200/80 italic border-l-2 border-pink-500/50 pl-4 py-1">
                        &quot;{song.songStory}&quot;
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          Lyrics
                        </h3>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(song.songLyrics);
                            playSound('click');
                            showToast('Lyrics copied!', "success");
                          }}
                          className="text-xs text-pink-400 hover:text-pink-300 uppercase tracking-wider"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="bg-black/50 border border-pink-500/20 rounded-xl p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <pre className="font-sans text-pink-100/90 whitespace-pre-wrap leading-relaxed">
                          {song.songLyrics}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-pink-500/30 space-y-4 border border-dashed border-pink-500/20 rounded-2xl bg-black/20">
                <Heart className="w-16 h-16 opacity-50" />
                <p className="uppercase tracking-widest text-sm font-bold">Awaiting Inspiration</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
