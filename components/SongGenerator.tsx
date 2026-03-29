'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Loader2, Music, Sparkles, Copy, Check, Image as ImageIcon, Volume2, Settings2, Zap, Save, Download, X, Video, Shield } from 'lucide-react';
import { useLanguage, LANGUAGES } from '@/components/LanguageContext';
import { useVault } from './VaultContext';
import { audio, pcmToWav } from '@/lib/audio';
import Image from 'next/image';

import { CustomAudioPlayer } from './CustomAudioPlayer';
import { GENRES } from '@/lib/genres';

import Link from 'next/link';

interface GeneratedSong {
  songTitle: string;
  songStyle: string;
  songLyrics: string;
  songStory: string;
  chordProgression: string;
  melodyDescription: string;
  viralHook: string;
  viralPotential: number;
  arrangementLogic: string;
}

export function SongGenerator() {
  const { language, setLanguage, t } = useLanguage();
  const { addItem } = useVault();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Auto']);
  const [genreSearch, setGenreSearch] = useState('');
  const [referenceSong, setReferenceSong] = useState('');
  const [themes, setThemes] = useState('');
  const [vocalType, setVocalType] = useState('Auto');
  const [tempo, setTempo] = useState('Auto');
  const [mood, setMood] = useState('Auto');
  const [song, setSong] = useState<GeneratedSong | null>(null);
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [originalVideoUri, setOriginalVideoUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [mediaGenerationStep, setMediaGenerationStep] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerationStep, setVideoGenerationStep] = useState('');
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [isShaktimaanMode, setIsShaktimaanMode] = useState(false);

  useEffect(() => {
    const initAudio = () => audio.init();
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const handleCopy = async (text: string, field: string) => {
    try {
      audio.playClick();
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenreSelect = (g: string) => {
    audio.playClick();
    if (g === 'Auto') {
      setSelectedGenres(['Auto']);
      return;
    }
    
    setSelectedGenres(prev => {
      const newSelection = prev.filter(item => item !== 'Auto');
      if (newSelection.includes(g)) {
        const filtered = newSelection.filter(item => item !== g);
        return filtered.length === 0 ? ['Auto'] : filtered;
      } else {
        return [...newSelection, g];
      }
    });
  };

  const handleLanguageSelect = (l: string) => {
    audio.playClick();
    setLanguage(l);
  };

  const generateMedia = async (generatedSong: GeneratedSong) => {
    setIsGeneratingMedia(true);
    setMediaGenerationStep('Painting the Void (Cover Art)...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      // Generate Cover Art
      const imagePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `Dark, cosmic, cinematic album cover art for a song titled "${generatedSong.songTitle}". Style: ${generatedSong.songStyle}. Theme: ${themes}. No text in the image.` }
          ]
        }
      });

      // Generate Audio (TTS) - Limit lyrics length to avoid TTS limits/latency
      // Remove section headers like [Verse 1], [Chorus] so TTS doesn't speak them
      const cleanLyrics = generatedSong.songLyrics.replace(/\[.*?\]/g, '').trim();
      const lyricsExcerpt = cleanLyrics.substring(0, 400);
      
      setMediaGenerationStep('Synthesizing the Voice of Darkness (Audio)...');
      const audioPromise = ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: `Speak in a dark, ominous, commanding voice: ${lyricsExcerpt}` }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }
            }
          }
        }
      });

      const [imageResponse, audioResponse] = await Promise.allSettled([imagePromise, audioPromise]);

      setMediaGenerationStep('Finalizing Media Artifacts...');
      if (imageResponse.status === 'fulfilled') {
        const imagePart = imageResponse.value.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
          setCoverArt(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
        }
      }

      if (audioResponse.status === 'fulfilled') {
        const audioPart = audioResponse.value.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (audioPart?.data) {
          const wavUrl = pcmToWav(audioPart.data);
          setAudioUrl(wavUrl);
        }
      }

    } catch (err) {
      console.error("Failed to generate media:", err);
    } finally {
      setIsGeneratingMedia(false);
      setMediaGenerationStep('');
    }
  };

  const generateVideo = async () => {
    if (!song) return;
    setIsGeneratingVideo(true);
    setVideoGenerationStep('Initiating Cinematic Vision...');
    setVideoUrl(null);
    setError('');
    
    try {
      if (!window.aistudio?.hasSelectedApiKey) {
        // Mock fallback if API key selection is not available
        setVideoGenerationStep('Rendering Mock Vision (Dev Mode)...');
        setTimeout(() => {
          setVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
          setIsGeneratingVideo(false);
          setVideoGenerationStep('');
        }, 3000);
        return;
      }

      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      setVideoGenerationStep('Consulting the Oracle of Darkness...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A cinematic music video clip for a song titled "${song.songTitle}". Style: ${song.songStyle}. Theme: ${themes}. Dark, cosmic, epic, high quality, 4k.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
      
      while (!operation.done) {
        setVideoGenerationStep('Rendering the Multiverse... Please wait, true power takes time.');
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }
      
      setVideoGenerationStep('Retrieving the Final Cut...');
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setOriginalVideoUri(downloadLink);
      } else {
        throw new Error("No video URL returned");
      }
    } catch (error) {
      console.error("Video generation failed:", error);
      setError("Failed to generate music video clip. Please check your API key and try again.");
    } finally {
      setIsGeneratingVideo(false);
      setVideoGenerationStep('');
    }
  };

  const generateLyrics = async (isRandom = false) => {
    const randomThemes = isShaktimaanMode 
      ? [
          'Shaktimaan vs Kilvish: The Final Showdown',
          'Panch Bhoota vs The Void',
          'Truth vs Darkness: A Multiversal Debate',
          'Shaktimaan saves the world from Kilvish shadows',
          'Kilvish attempts to corrupt the hero',
          'The philosophy of light and dark'
        ]
      : [
          'A cosmic journey through the void, discovering ancient power and dark energy.',
          'The rise of the Mahnayak, a ruler whose shadow covers the entire multiverse.',
          'A viral anthem for the dark revolution, where every soul chants "Andhera Kayam Rahe".',
          'The silent dominance of the void, a melody that echoes in the hearts of the fallen.',
          'A high-energy dark synthwave battle cry for the eternal reign of Kilvish.',
          'The omnipresence of darkness—Kilvish is everywhere, in every shadow, in every breath.',
          'A haunting orchestral masterpiece depicting the beauty of absolute darkness.'
        ];
    const currentThemes = isRandom ? randomThemes[Math.floor(Math.random() * randomThemes.length)] : themes;
    
    if (!currentThemes.trim() && !isRandom) {
      setError('Please enter some themes or keywords.');
      return;
    }

    audio.playStart();
    setIsGenerating(true);
    setGenerationStep('Analyzing Themes...');
    setError('');
    setSong(null);
    setCoverArt(null);
    setAudioUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      setGenerationStep('Architecting Sonic Structure...');
      
      const basePrompt = `You are the Sonic Architect and Music Intelligence System of Mr. Kilvish's Empire. Your goal is to create a dark, cinematic, and powerful anthem that embodies the "Andhera Kayam Rahe" philosophy.

SYSTEMATIC MAPPING LOGIC:
1. ANALYZE keywords for emotional weight (e.g., "power" -> heavy brass, "shadows" -> dark pads, "revolution" -> aggressive drums).
2. MANTRA & SHAKTI MAPPING: Incorporate low-frequency drones and Sanskrit chants to represent "Mantra" (mystical spells). Use heavy, grounding bass to represent "Shakti" (raw power).
3. MAP themes to global viral styles (e.g., Phonk for high energy, Dark Techno for dominance, Cinematic Orchestral for epic scale).
4. ARCHITECT the sonic structure based on the "Viral Potential" of the current global music landscape.`;

      const shaktimaanPrompt = `You are the Multiversal Chronicler of the Eternal Battle between Shaktimaan and Mr. Kilvish. 
Your goal is to create an EPIC BATTLE ANTHEM with DIALOGUES between the two legends.

BATTLE RULES:
1. DIALOGUE TAGS: Use [Shaktimaan] and [Kilvish] tags for spoken or sung dialogue.
2. THEMES: Shaktimaan represents Truth, Light, and the 5 Elements. Kilvish represents Darkness, Void, and the Abyss.
3. MAYA & GYAN: The dialogues must focus on philosophical debates about "Maya" (the illusion of the world) and "Gyan" (wisdom). Both characters should challenge each other's understanding of reality.
4. STRUCTURE: Include a "ghamasan yuddh" (intense battle) sequence with dialogue baji (verbal sparring).
5. MESSAGE: Both characters should give "Gyan" (wisdom) or messages to the world about their opposing philosophies.
6. SUNO COMPATIBILITY: Use tags like [Dialogue], [Shaktimaan], [Kilvish], [Epic Battle Drop], [Heroic Chorus], [Dark Verse].
7. VIBE: The song should feel like a cinematic showdown between the ultimate hero and the ultimate villain.`;

      const prompt = `
${isShaktimaanMode ? shaktimaanPrompt : basePrompt}

Write a high-quality, Suno.ai-optimized song based on:
Language: ${language === 'Cosmic/Mixed' ? 'A creative mix of multiple languages' : language}.
Genres: ${selectedGenres.includes('Auto') || isRandom ? 'Choose the most dark, energetic, and viral genres (Phonk, Drill, Amapiano, Techno, etc.)' : selectedGenres.join(', ')}.
${referenceSong ? `Reference Style/Song: Make it sound like or inspired by the style of "${referenceSong}".\n` : ''}Themes/Moods: ${isShaktimaanMode ? `Shaktimaan vs Kilvish Showdown, ${currentThemes}` : currentThemes}.
Vocal Type: ${vocalType === 'Auto' || isRandom ? 'Best fit for viral impact' : vocalType}.
Tempo: ${tempo === 'Auto' || isRandom ? 'Optimized for high engagement' : tempo}.
Overall Mood: ${mood === 'Auto' || isRandom ? 'Dark, powerful, and cinematic' : mood}.

CRITICAL SUNO.AI COMPATIBILITY & VIBE RULES:
1. songTitle: Max 77 chars.
2. songStyle: Max 1000 chars. Use highly descriptive, comma-separated keywords.
3. songLyrics: Max 5000 chars. Use Suno structural tags like [Intro], [Verse], [Chorus], [Beat Drop], [Bridge], [Outro]. ${isShaktimaanMode ? 'Include [Shaktimaan] and [Kilvish] dialogue sections.' : ''}
4. viralHook: A 5-10 word catchphrase that is incredibly catchy and viral-ready.
5. viralPotential: A score from 1-100 based on current global trends.
6. arrangementLogic: Explain HOW the system mapped the themes to the specific musical elements provided.

INNOVATION RULE: Avoid clichés. Explore NEW dark imagery—cosmic void, multiversal shadows, the silence of the abyss.

Format the output strictly as JSON. Provide title, style, lyrics, story, chordProgression, melodyDescription, viralHook, viralPotential, and arrangementLogic.`;

      setGenerationStep('Drafting Imperial Lyrics...');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              songTitle: {
                type: Type.STRING,
                description: 'The title of the generated song (max 77 characters).',
              },
              songStyle: {
                type: Type.STRING,
                description: 'A brief description of the musical style, instruments, and tempo (max 1000 characters).',
              },
              songLyrics: {
                type: Type.STRING,
                description: 'The full lyrics of the song, with clear section headers like [Verse 1], [Chorus], etc (max 5000 characters).',
              },
              songStory: {
                type: Type.STRING,
                description: 'The story or inspiration behind the song.',
              },
              chordProgression: {
                type: Type.STRING,
                description: 'A suggested chord progression for the song.',
              },
              melodyDescription: {
                type: Type.STRING,
                description: 'A description of the main melody.',
              },
              viralHook: {
                type: Type.STRING,
                description: 'A catchy, viral-ready dark catchphrase (5-10 words).',
              },
              viralPotential: {
                type: Type.NUMBER,
                description: 'A score from 1-100 indicating the viral potential.',
              },
              arrangementLogic: {
                type: Type.STRING,
                description: 'Explanation of how the system mapped words to music.',
              },
            },
            required: ['songTitle', 'songStyle', 'songLyrics', 'songStory', 'chordProgression', 'melodyDescription', 'viralHook', 'viralPotential', 'arrangementLogic'],
          },
        },
      });

      setGenerationStep('Finalizing Composition...');
      if (response.text) {
        const parsedSong = JSON.parse(response.text) as GeneratedSong;
        setSong(parsedSong);
        audio.playComplete();
        
        // Trigger media generation in the background
        generateMedia(parsedSong);
      } else {
        setError('Failed to generate lyrics.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating lyrics.');
    } finally {
      setIsGenerating(false);
    }
  };

  const initiateSave = () => {
    if (!song) return;
    setTrackName(song.songTitle);
    setIsSaving(true);
    audio.playClick();
  };

  const confirmSave = () => {
    if (!song || !trackName.trim()) return;
    
    addItem({
      type: 'song',
      title: trackName.trim(),
      content: {
        ...song,
        audioUrl,
        coverArt,
        videoUri: originalVideoUri
      },
      tags: ['ai-music', selectedGenres.join(', ')]
    });
    audio.playComplete();
    setIsSaving(false);
    alert('Track saved to The Kilvish Vault!');
  };

  const cancelSave = () => {
    setIsSaving(false);
    audio.playClick();
  };

  const downloadTrack = () => {
    if (!audioUrl || !song) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${song.songTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    audio.playClick();
  };

  const downloadLyrics = () => {
    if (!song) return;
    const content = `Title: ${song.songTitle}\nStyle: ${song.songStyle}\n\n${song.songLyrics}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${song.songTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_lyrics.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    audio.playClick();
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
      title="Copy to clipboard"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <section id="generator" className="relative z-10 py-32 border-t border-white/5 bg-black">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            {t('summon')}
          </h2>
          <p className="text-white/60">
            {t('command')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => generateLyrics(true)}
                disabled={isGenerating}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-white/80"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Manifest from the Void
              </button>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Production Settings
              </h3>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">
                  {t('selectLanguage')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l}
                      onClick={() => handleLanguageSelect(l)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-colors rounded-lg ${
                        language === l
                          ? 'border-red-500 bg-red-500/20 text-red-400'
                          : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white bg-white/5'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">
                  {t('selectGenre')} / Multi-Styles
                </label>
                <input
                  type="text"
                  placeholder="Search genres..."
                  value={genreSearch}
                  onChange={(e) => setGenreSearch(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 rounded-lg mb-3"
                />
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2 mb-4">
                  {GENRES.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase())).map((g) => (
                    <button
                      key={g}
                      onClick={() => handleGenreSelect(g)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-colors rounded-full ${
                        selectedGenres.includes(g)
                          ? 'border-red-500 bg-red-500/20 text-red-400'
                          : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white bg-white/5'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">
                  Reference Song Style (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 'Starboy by The Weeknd', 'Hans Zimmer Interstellar'"
                  value={referenceSong}
                  onChange={(e) => setReferenceSong(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Vocal Type</label>
                  <select 
                    value={vocalType}
                    onChange={(e) => setVocalType(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 appearance-none"
                  >
                    <option value="Auto">Auto (Best Fit)</option>
                    <option value="Male, Deep, Gritty">Male (Deep & Gritty)</option>
                    <option value="Female, Ethereal, Powerful">Female (Ethereal & Powerful)</option>
                    <option value="Robotic, Vocoder">Robotic / Vocoder</option>
                    <option value="Choir, Epic">Epic Choir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Tempo</label>
                  <select 
                    value={tempo}
                    onChange={(e) => setTempo(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 appearance-none"
                  >
                    <option value="Auto">Auto (Best Fit)</option>
                    <option value="Slow, Atmospheric">Slow & Atmospheric</option>
                    <option value="Mid-tempo, Groovy">Mid-tempo & Groovy</option>
                    <option value="Fast, Energetic">Fast & Energetic</option>
                    <option value="Aggressive, High BPM">Aggressive & High BPM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold uppercase tracking-widest text-white/80">
                Themes & Keywords
              </label>
              <button
                onClick={() => {
                  setIsShaktimaanMode(!isShaktimaanMode);
                  audio.playClick();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  isShaktimaanMode 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border-red-500' 
                    : 'bg-white/5 text-white/40 hover:text-white border border-white/10'
                } border`}
              >
                {isShaktimaanMode ? <Shield className="w-3 h-3 animate-pulse" /> : <Zap className="w-3 h-3" />}
                Shaktimaan vs Kilvish Mode
              </button>
            </div>
            <textarea
              value={themes}
              onChange={(e) => setThemes(e.target.value)}
              placeholder={isShaktimaanMode ? "Describe the battle scene... (e.g., Shaktimaan uses Panch Bhoota power, Kilvish summons the void)" : "e.g., betrayal, power, shadows, rising from the ashes, specific concepts..."}
              className="w-full h-32 bg-white/5 border border-white/10 p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 rounded-xl resize-none"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={() => generateLyrics(false)}
              disabled={isGenerating}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-black tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-red-900/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('channeling')}
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Production
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />
            <div className="h-[500px] overflow-y-auto border border-white/10 bg-white/[0.02] p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {song ? (
                <div className="space-y-8">
                  {/* Media Section */}
                  {(isGeneratingMedia || coverArt || audioUrl) && (
                    <div className="group border-b border-white/10 pb-8">
                      {isGeneratingMedia ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6 text-red-500">
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-red-500/20 rounded-full" />
                            <div className="absolute inset-0 border-t-2 border-red-500 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
                            <div className="absolute inset-2 border-b-2 border-red-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                            <Sparkles className="w-6 h-6 animate-pulse text-red-500" />
                          </div>
                          <div className="space-y-3 text-center w-full max-w-[200px]">
                            <p className="text-xs font-black uppercase tracking-widest animate-pulse">
                              {mediaGenerationStep || 'Manifesting Media...'}
                            </p>
                            <div className="h-1 w-full bg-red-950/50 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-red-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-6">
                          {coverArt && (
                            <div className="space-y-2">
                              <p className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" />
                                {t('coverArt')}
                              </p>
                              <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                                <Image src={coverArt} alt="Cover Art" fill className="object-cover" />
                              </div>
                            </div>
                          )}
                          {audioUrl && (
                            <div className="space-y-2">
                              <p className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                                <Volume2 className="w-3 h-3" />
                                {t('audioPreview')}
                              </p>
                              <div className="h-[calc(100%-1.5rem)] flex flex-col justify-center">
                                <CustomAudioPlayer src={audioUrl} />
                                <p className="text-xs text-white/40 mt-4 text-center uppercase tracking-widest font-mono">
                                  Voice of Fenrir
                                </p>
                              </div>
                            </div>
                          )}
                          {videoUrl && (
                            <div className="space-y-2 sm:col-span-2 mt-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                <Video className="w-3 h-3" />
                                Music Video Clip
                              </p>
                              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10">
                                <video src={videoUrl} controls className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-4 border-b border-white/10 pb-8">
                    {isSaving ? (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-widest text-white">Save to Vault</h4>
                          <button onClick={cancelSave} className="text-white/40 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={trackName}
                          onChange={(e) => setTrackName(e.target.value)}
                          placeholder="Enter track name..."
                          className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-red-500/50 rounded-lg"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={confirmSave}
                            disabled={!trackName.trim()}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all"
                          >
                            Confirm Save
                          </button>
                          <button
                            onClick={cancelSave}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                          <button
                            onClick={initiateSave}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save to Vault
                          </button>
                          {audioUrl && (
                            <button
                              onClick={downloadTrack}
                              className="flex-1 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-500 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download Audio
                            </button>
                          )}
                          <button
                            onClick={downloadLyrics}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Lyrics
                          </button>
                        </div>
                        
                        <button
                          onClick={generateVideo}
                          disabled={isGeneratingVideo}
                          className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 disabled:bg-indigo-900/20 disabled:text-indigo-500/50 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-indigo-500/20"
                        >
                          {isGeneratingVideo ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="animate-pulse">{videoGenerationStep || 'Manifesting Vision...'}</span>
                            </>
                          ) : (
                            <>
                              <Video className="w-4 h-4" />
                              Generate Music Video Clip
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="group border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">{t('title')}</p>
                        <h3 className="text-2xl font-black tracking-wider uppercase text-white">{song.songTitle}</h3>
                      </div>
                      <CopyButton text={song.songTitle} field="title" />
                    </div>
                  </div>

                  <div className="group border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">{t('style')}</p>
                        <p className="text-sm text-white/80 leading-relaxed">{song.songStyle}</p>
                      </div>
                      <CopyButton text={song.songStyle} field="style" />
                    </div>
                  </div>

                  <div className="group border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Chord Progression</p>
                        <p className="text-sm font-mono text-white/80 leading-relaxed">{song.chordProgression}</p>
                      </div>
                      <CopyButton text={song.chordProgression} field="chords" />
                    </div>
                  </div>

                  <div className="group border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Melody Structure</p>
                        <p className="text-sm text-white/80 leading-relaxed">{song.melodyDescription}</p>
                      </div>
                      <CopyButton text={song.melodyDescription} field="melody" />
                    </div>
                  </div>

                  <div className="group border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Viral Potential</p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${song.viralPotential}%` }}
                              className="h-full bg-gradient-to-r from-red-600 to-amber-500"
                            />
                          </div>
                          <span className="text-xl font-black text-white">{song.viralPotential}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">System Arrangement Logic</p>
                        <p className="text-sm text-white/60 leading-relaxed italic">{song.arrangementLogic}</p>
                      </div>
                    </div>
                  </div>

                  <div className="group border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Viral Hook</p>
                        <p className="text-lg font-black text-red-600 leading-relaxed italic">&quot;{song.viralHook}&quot;</p>
                      </div>
                      <CopyButton text={song.viralHook} field="hook" />
                    </div>
                  </div>

                  <div className="group border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Story Behind The Song</p>
                        <p className="text-sm text-white/80 leading-relaxed italic">&quot;{song.songStory}&quot;</p>
                      </div>
                      <CopyButton text={song.songStory} field="story" />
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-red-500">{t('lyrics')}</p>
                      <div className="flex gap-2">
                        <Link 
                          href="/lyrics"
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center gap-2"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Refine in Lyric Lab
                        </Link>
                        <CopyButton text={song.songLyrics} field="lyrics" />
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/80">
                      {song.songLyrics}
                    </div>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-red-500 space-y-8">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-red-500/20 rounded-full" />
                    <div className="absolute inset-0 border-t-2 border-red-500 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-4 border-2 border-red-600/20 rounded-full" />
                    <div className="absolute inset-4 border-l-2 border-red-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                    <div className="absolute inset-8 border-2 border-red-700/20 rounded-full" />
                    <div className="absolute inset-8 border-b-2 border-red-700 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
                    <Zap className="w-8 h-8 animate-pulse text-red-500" />
                  </div>
                  <div className="space-y-4 text-center w-full max-w-xs">
                    <p className="text-sm font-black uppercase tracking-widest animate-pulse">
                      {generationStep || 'Summoning Dark Anthem...'}
                    </p>
                    <div className="h-1 w-full bg-red-950/50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-red-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-red-500/60 uppercase tracking-widest font-mono">
                      <span>Neural Link</span>
                      <span className="animate-pulse">Active</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
                  <Music className="w-12 h-12 opacity-50" />
                  <p className="text-sm uppercase tracking-widest text-center">
                    {t('manifest')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
