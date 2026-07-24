'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Loader2, Heart, Sparkles, Copy, Check, Image as ImageIcon, Volume2, Settings2, Save, Download, X, Video } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useVault } from './VaultContext';
import { useToast } from './ToastContext';
import { audio, pcmToWav } from '@/lib/audio';
import Image from 'next/image';
import { CustomAudioPlayer } from './CustomAudioPlayer';

interface GeneratedSong {
  songTitle: string;
  songStyle: string;
  songLyrics: string;
  songStory: string;
  chordProgression: string;
  melodyDescription: string;
  romanticHook: string;
  emotionalResonance: number;
  arrangementLogic: string;
}

export function RomanticHub() {
  const { language, t } = useLanguage();
  const { addItem } = useVault();
  const { showToast } = useToast();
  const [selectedVibe, setSelectedVibe] = useState<string>('Soulful R&B');
  const [themes, setThemes] = useState('');
  const [vocalType, setVocalType] = useState('Auto');
  const [tempo, setTempo] = useState('Auto');
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

  const VIBES = [
    'Soulful R&B', 'Acoustic Ballad', 'Synthpop Romance', 'Lo-Fi Chill', 
    'Epic Orchestral Love', 'Indie Folk', 'Jazz Lounge', 'Pop Anthem'
  ];

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

  const generateMedia = async (generatedSong: GeneratedSong) => {
    setIsGeneratingMedia(true);
    setMediaGenerationStep('Painting the Canvas of Love...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const imagePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `Beautiful, romantic, cinematic album cover art for a love song titled "${generatedSong.songTitle}". Style: ${generatedSong.songStyle}. Theme: ${themes}. Warm colors, soft lighting, emotional resonance. No text in the image.` }
          ]
        }
      });

      const cleanLyrics = generatedSong.songLyrics.replace(/\\[.*?\\]/g, '').trim();
      const lyricsExcerpt = cleanLyrics.substring(0, 400);
      
      setMediaGenerationStep('Synthesizing the Voice of Romance...');
      const audioPromise = ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: `Speak in a soft, romantic, emotional voice: ${lyricsExcerpt}` }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' } // Kore has a softer tone
            }
          }
        }
      });

      const [imageResponse, audioResponse] = await Promise.allSettled([imagePromise, audioPromise]);

      setMediaGenerationStep('Finalizing Romantic Artifacts...');
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
    setVideoGenerationStep('Initiating Romantic Vision...');
    setVideoUrl(null);
    setError('');
    
    try {
      if (!window.aistudio?.hasSelectedApiKey) {
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
      
      setVideoGenerationStep('Consulting the Oracle of Love...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A cinematic, romantic music video clip for a love song titled "${song.songTitle}". Style: ${song.songStyle}. Theme: ${themes}. Warm, emotional, beautiful lighting, high quality, 4k.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
      
      while (!operation.done) {
        setVideoGenerationStep('Capturing the Emotion... Please wait.');
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
    const randomThemes = [
      'A chance encounter in the rain that changes everything.',
      'Long-distance love and the yearning to be together.',
      'Growing old together and cherishing every moment.',
      'A passionate, fiery romance that burns bright.',
      'Healing from a broken heart and finding love again.',
      'The quiet, comfortable silence between two soulmates.',
      'A grand, sweeping declaration of eternal love.'
    ];
    const currentThemes = isRandom ? randomThemes[Math.floor(Math.random() * randomThemes.length)] : themes;
    
    if (!currentThemes.trim() && !isRandom) {
      setError('Please enter some themes or keywords.');
      return;
    }

    audio.playStart();
    setIsGenerating(true);
    setGenerationStep('Analyzing Emotions...');
    setError('');
    setSong(null);
    setCoverArt(null);
    setAudioUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      setGenerationStep('Composing the Melody of Love...');
      
      const prompt = `You are a master songwriter specializing in romantic, emotional, and beautiful love songs. Your goal is to create a deeply moving and heartfelt song.

Write a high-quality, Suno.ai-optimized song based on:
Language: ${language === 'Cosmic/Mixed' ? 'A creative mix of multiple languages' : language}.
Vibe/Genre: ${selectedVibe}.
Themes/Moods: ${currentThemes}.
Vocal Type: ${vocalType === 'Auto' ? 'Best fit for emotional impact' : vocalType}.
Tempo: ${tempo === 'Auto' ? 'Optimized for the romantic vibe' : tempo}.

CRITICAL SUNO.AI COMPATIBILITY & VIBE RULES:
1. songTitle: Max 77 chars.
2. songStyle: Max 1000 chars. Use highly descriptive, comma-separated keywords (e.g., "soft piano, emotional strings, slow tempo, romantic R&B").
3. songLyrics: Max 5000 chars. Use Suno structural tags like [Intro], [Verse], [Chorus], [Bridge], [Outro].
4. romanticHook: A 5-10 word catchphrase that captures the essence of the love story.
5. emotionalResonance: A score from 1-100 indicating how deeply emotional the song is.
6. arrangementLogic: Explain HOW the system mapped the romantic themes to the specific musical elements provided.

Format the output strictly as JSON. Provide title, style, lyrics, story, chordProgression, melodyDescription, romanticHook, emotionalResonance, and arrangementLogic.`;

      setGenerationStep('Drafting Romantic Lyrics...');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              songTitle: { type: Type.STRING, description: 'The title of the generated song (max 77 characters).' },
              songStyle: { type: Type.STRING, description: 'A brief description of the musical style, instruments, and tempo (max 1000 characters).' },
              songLyrics: { type: Type.STRING, description: 'The full lyrics of the song, with clear section headers like [Verse 1], [Chorus], etc (max 5000 characters).' },
              songStory: { type: Type.STRING, description: 'The story or inspiration behind the song.' },
              chordProgression: { type: Type.STRING, description: 'A suggested chord progression for the song.' },
              melodyDescription: { type: Type.STRING, description: 'A description of the main melody.' },
              romanticHook: { type: Type.STRING, description: 'A catchy, romantic catchphrase (5-10 words).' },
              emotionalResonance: { type: Type.NUMBER, description: 'A score from 1-100 indicating the emotional impact.' },
              arrangementLogic: { type: Type.STRING, description: 'Explanation of how the system mapped words to music.' },
            },
            required: ['songTitle', 'songStyle', 'songLyrics', 'songStory', 'chordProgression', 'melodyDescription', 'romanticHook', 'emotionalResonance', 'arrangementLogic'],
          },
        },
      });

      setGenerationStep('Finalizing Composition...');
      if (response.text) {
        const parsedSong = JSON.parse(response.text) as GeneratedSong;
        setSong(parsedSong);
        audio.playComplete();
        
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
      tags: ['romantic-hub', selectedVibe]
    });
    audio.playComplete();
    setIsSaving(false);
    showToast('Track saved to The Vault!', "success");
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
      className="p-2 hover:bg-pink-500/10 rounded-md transition-colors text-pink-500/50 hover:text-pink-400"
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
    <section className="relative z-10 py-12 border-t border-pink-500/20 bg-gradient-to-b from-pink-950/20 to-black">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-pink-500">
            Romantic Song Hub
          </h2>
          <p className="text-pink-200/60">
            Compose the perfect love song. Manifest emotions into melodies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex gap-4">
              <button
                onClick={() => generateLyrics(true)}
                disabled={isGenerating}
                className="flex-1 py-3 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-pink-300"
              >
                <Sparkles className="w-4 h-4 text-pink-400" />
                Surprise Me With Love
              </button>
            </div>

            <div className="p-6 rounded-2xl border border-pink-500/20 bg-pink-950/10 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-pink-400 flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Romantic Settings
              </h3>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-pink-200/60 mb-3">
                  Select Vibe
                </label>
                <div className="flex flex-wrap gap-2">
                  {VIBES.map((v) => (
                    <button
                      key={v}
                      onClick={() => { audio.playClick(); setSelectedVibe(v); }}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-colors rounded-full ${
                        selectedVibe === v
                          ? 'border-pink-500 bg-pink-500/20 text-pink-300'
                          : 'border-pink-500/20 text-pink-200/40 hover:border-pink-500/50 hover:text-pink-200 bg-pink-500/5'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-pink-200/60 mb-2">Vocal Type</label>
                  <select 
                    value={vocalType}
                    onChange={(e) => setVocalType(e.target.value)}
                    className="w-full bg-black/50 border border-pink-500/20 rounded-lg px-3 py-2 text-xs text-pink-100 focus:outline-none focus:border-pink-500/50 appearance-none"
                  >
                    <option value="Auto">Auto (Best Fit)</option>
                    <option value="Male, Smooth, Soulful">Male (Smooth & Soulful)</option>
                    <option value="Female, Soft, Breathless">Female (Soft & Breathless)</option>
                    <option value="Duet, Harmonious">Duet (Harmonious)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-pink-200/60 mb-2">Tempo</label>
                  <select 
                    value={tempo}
                    onChange={(e) => setTempo(e.target.value)}
                    className="w-full bg-black/50 border border-pink-500/20 rounded-lg px-3 py-2 text-xs text-pink-100 focus:outline-none focus:border-pink-500/50 appearance-none"
                  >
                    <option value="Auto">Auto (Best Fit)</option>
                    <option value="Slow, Intimate">Slow & Intimate</option>
                    <option value="Mid-tempo, Upbeat Love">Mid-tempo & Upbeat</option>
                    <option value="Waltz, Flowing">Waltz / Flowing</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold uppercase tracking-widest text-pink-200/80">
                Love Story & Keywords
              </label>
            </div>
            <textarea
              value={themes}
              onChange={(e) => setThemes(e.target.value)}
              placeholder="e.g., meeting in a coffee shop, long distance yearning, growing old together..."
              className="w-full h-32 bg-pink-950/10 border border-pink-500/20 p-4 text-pink-100 placeholder:text-pink-200/30 focus:outline-none focus:border-pink-500/50 rounded-xl resize-none"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
               onClick={() => generateLyrics(false)}
               disabled={isGenerating}
               className="w-full py-4 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-900/50 disabled:cursor-not-allowed text-white font-black tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-pink-900/20"
             >
               {isGenerating ? (
                 <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   {generationStep || 'Composing...'}
                 </>
               ) : (
                 <>
                   <Heart className="w-5 h-5" />
                   Generate Love Song
                 </>
               )}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-pink-900/10 to-transparent pointer-events-none" />
            <div className="h-[400px] md:h-[600px] overflow-y-auto border border-pink-500/20 bg-pink-950/5 p-4 md:p-8 scrollbar-thin scrollbar-thumb-pink-500/20 scrollbar-track-transparent rounded-2xl">
              {song ? (
                <div className="space-y-8">
                  {(isGeneratingMedia || coverArt || audioUrl) && (
                    <div className="group border-b border-pink-500/20 pb-8">
                      {isGeneratingMedia ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6 text-pink-400">
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-pink-500/20 rounded-full" />
                            <div className="absolute inset-0 border-t-2 border-pink-500 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
                            <Heart className="w-6 h-6 animate-pulse text-pink-500" />
                          </div>
                          <div className="space-y-3 text-center w-full max-w-[200px]">
                            <p className="text-xs font-black uppercase tracking-widest animate-pulse">
                              {mediaGenerationStep || 'Manifesting Media...'}
                            </p>
                            <div className="h-1 w-full bg-pink-950/50 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-pink-500"
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
                              <p className="text-xs font-bold uppercase tracking-widest text-pink-400 flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" />
                                Cover Art
                              </p>
                              <div className="relative aspect-square rounded-lg overflow-hidden border border-pink-500/20 shadow-lg shadow-pink-900/20">
                                <Image src={coverArt} alt="Cover Art" fill className="object-cover" />
                              </div>
                            </div>
                          )}
                          {audioUrl && (
                            <div className="space-y-2">
                              <p className="text-xs font-bold uppercase tracking-widest text-pink-400 flex items-center gap-2">
                                <Volume2 className="w-3 h-3" />
                                Audio Preview
                              </p>
                              <div className="h-[calc(100%-1.5rem)] flex flex-col justify-center">
                                <CustomAudioPlayer src={audioUrl} />
                              </div>
                            </div>
                          )}
                          {videoUrl && (
                            <div className="space-y-2 sm:col-span-2 mt-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-pink-400 flex items-center gap-2">
                                <Video className="w-3 h-3" />
                                Music Video Clip
                              </p>
                              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-pink-500/20 shadow-lg shadow-pink-900/20">
                                <video src={videoUrl} controls className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-4 border-b border-pink-500/20 pb-8">
                    {isSaving ? (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-widest text-pink-200">Save to Vault</h4>
                          <button onClick={cancelSave} className="text-pink-200/40 hover:text-pink-200 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={trackName}
                          onChange={(e) => setTrackName(e.target.value)}
                          placeholder="Enter track name..."
                          className="w-full bg-black/50 border border-pink-500/30 p-3 text-sm text-pink-100 focus:outline-none focus:border-pink-500/50 rounded-lg"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={confirmSave}
                            disabled={!trackName.trim()}
                            className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-900/50 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all"
                          >
                            Confirm Save
                          </button>
                          <button
                            onClick={cancelSave}
                            className="px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 text-xs font-bold uppercase tracking-widest rounded-lg transition-all"
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
                            className="flex-1 py-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-pink-500/20"
                          >
                            <Save className="w-4 h-4" />
                            Save to Vault
                          </button>
                          {audioUrl && (
                            <button
                              onClick={downloadTrack}
                              className="flex-1 py-3 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-pink-500/20"
                            >
                              <Download className="w-4 h-4" />
                              Download Audio
                            </button>
                          )}
                          <button
                            onClick={downloadLyrics}
                            className="flex-1 py-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-200/80 hover:text-pink-200 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-pink-500/20"
                          >
                            <Download className="w-4 h-4" />
                            Lyrics
                          </button>
                        </div>
                        
                        <button
                          onClick={generateVideo}
                          disabled={isGeneratingVideo}
                          className="w-full py-3 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 disabled:bg-pink-900/20 disabled:text-pink-500/50 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-pink-500/30"
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

                  <div className="group border-b border-pink-500/20 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-1">Title</p>
                        <h3 className="text-2xl font-black tracking-wider uppercase text-pink-100">{song.songTitle}</h3>
                      </div>
                      <CopyButton text={song.songTitle} field="title" />
                    </div>
                  </div>

                  <div className="group border-b border-pink-500/20 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-1">Style</p>
                        <p className="text-sm text-pink-200/80 leading-relaxed">{song.songStyle}</p>
                      </div>
                      <CopyButton text={song.songStyle} field="style" />
                    </div>
                  </div>

                  <div className="group border-b border-pink-500/20 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-1">The Story</p>
                        <p className="text-sm text-pink-200/80 leading-relaxed">{song.songStory}</p>
                      </div>
                      <CopyButton text={song.songStory} field="story" />
                    </div>
                  </div>

                  <div className="group border-b border-pink-500/20 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-full">
                        <p className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-4">Lyrics</p>
                        <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-pink-100">
                          {song.songLyrics}
                        </div>
                      </div>
                      <CopyButton text={song.songLyrics} field="lyrics" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="group p-4 bg-pink-950/20 rounded-xl border border-pink-500/10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mb-2">Chord Progression</p>
                          <p className="text-sm font-mono text-pink-200/80">{song.chordProgression}</p>
                        </div>
                        <CopyButton text={song.chordProgression} field="chords" />
                      </div>
                    </div>

                    <div className="group p-4 bg-pink-950/20 rounded-xl border border-pink-500/10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mb-2">Melody</p>
                          <p className="text-sm text-pink-200/80">{song.melodyDescription}</p>
                        </div>
                        <CopyButton text={song.melodyDescription} field="melody" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-pink-600/10 border border-pink-500/20 rounded-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500">Romantic Hook</p>
                        <p className="text-lg font-bold text-pink-200">&quot;{song.romanticHook}&quot;</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-pink-950/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-600 to-pink-400"
                          style={{ width: `${song.emotionalResonance}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-pink-400">{song.emotionalResonance}/100 Emotion</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-pink-200/20">
                  <Heart className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">Awaiting Inspiration</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
