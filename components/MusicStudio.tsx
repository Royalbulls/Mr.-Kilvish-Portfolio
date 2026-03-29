'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Square, 
  Plus, 
  Volume2, 
  VolumeX,
  Settings2, 
  Trash2, 
  Music, 
  Drum, 
  Activity,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Users,
  MessageSquare,
  Download,
  Mic,
  Share2,
  Wand2,
  Loader2,
  Globe,
  Save,
  Zap
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { audio as sfx } from '@/lib/audio';
import { GoogleGenAI, Type } from '@google/genai';
import { useVault } from './VaultContext';

import { LyricGenerator } from './LyricGenerator';

type InstrumentType = 'piano' | 'drums' | 'bass';

interface Clip {
  id: string;
  startStep: number;
  length: number;
}

interface Track {
  id: string;
  name: string;
  type: InstrumentType;
  volume: number;
  pan: number;
  muted: boolean;
  clips: Clip[];
  color: string;
  reverb: number;
  delay: number;
  pitch: number;
  vibrato: number;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  time: string;
}

interface Collaborator {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

const STEPS = 32;
const BPM = 120;

export function MusicStudio() {
  const { t } = useLanguage();
  const [tracks, setTracks] = useState<Track[]>([
    { 
      id: '1', 
      name: 'Void Piano', 
      type: 'piano', 
      volume: 80, 
      pan: 0, 
      muted: false, 
      clips: [{ id: 'c1', startStep: 0, length: 4 }, { id: 'c2', startStep: 8, length: 4 }],
      color: 'bg-red-500',
      reverb: 30,
      delay: 20,
      pitch: 0,
      vibrato: 0
    },
    { 
      id: '2', 
      name: 'Dark Drums', 
      type: 'drums', 
      volume: 70, 
      pan: 0, 
      muted: false, 
      clips: [{ id: 'c3', startStep: 4, length: 2 }, { id: 'c4', startStep: 12, length: 2 }],
      color: 'bg-zinc-500',
      reverb: 10,
      delay: 0,
      pitch: 0,
      vibrato: 0
    }
  ]);

  const [masterVolume, setMasterVolume] = useState(80);
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'arrangement' | 'mixing' | 'mastering' | 'lyrics' | 'collaboration'>('arrangement');
  const [isGeneratingMelody, setIsGeneratingMelody] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: '1', name: 'Mr. Kilvish', role: 'Executive Producer', active: true },
    { id: '2', name: 'Archaeos', role: 'AI Engineer', active: true },
    { id: '3', name: 'User', role: 'Composer', active: true }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    { id: '1', user: 'Archaeos', text: 'The bass frequency in track 3 needs more resonance.', time: '2m ago' },
    { id: '2', user: 'Mr. Kilvish', text: 'This melody is too bright. Make it darker.', time: 'Just now' }
  ]);

  const [lyrics, setLyrics] = useState('Enter lyrics here...');

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStepTimeRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);

  // Audio synthesis logic
  const playSound = useCallback((type: InstrumentType, time: number, volume: number, pan: number, pitch: number, vibrato: number) => {
    if (!audioContextRef.current || isGlobalMuted) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    panner.pan.setValueAtTime(pan, time);
    const finalVolume = (masterVolume / 100) * (volume / 100) * 0.2;
    gain.gain.setValueAtTime(finalVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    let baseFreq = 440;
    if (type === 'piano') {
      osc.type = 'triangle';
      baseFreq = 440;
    } else if (type === 'bass') {
      osc.type = 'sine';
      baseFreq = 55;
    } else if (type === 'drums') {
      osc.type = 'square';
      baseFreq = 100;
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    }

    const bentFreq = baseFreq * Math.pow(2, pitch / 12);
    osc.frequency.setValueAtTime(bentFreq, time);

    if (vibrato > 0) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5, time);
      lfoGain.gain.setValueAtTime(vibrato * 10, time);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(time);
      lfo.stop(time + 0.5);
    }

    osc.start(time);
    osc.stop(time + 0.5);
  }, [masterVolume, isGlobalMuted]);

  const schedulerRef = useRef<() => void>(() => {});

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    while (nextStepTimeRef.current < ctx.currentTime + 0.1) {
      // Check each track for clips at current step
      tracks.forEach(track => {
        if (track.muted) return;
        const hasClip = track.clips.some(clip => 
          currentStep >= clip.startStep && currentStep < clip.startStep + clip.length
        );
        if (hasClip) {
          playSound(track.type, nextStepTimeRef.current, track.volume, track.pan, track.pitch, track.vibrato);
        }
      });

      // Advance step
      const secondsPerStep = 60.0 / BPM / 4; // 16th notes
      nextStepTimeRef.current += secondsPerStep;
      setCurrentStep(prev => (prev + 1) % STEPS);
    }
    timerIDRef.current = window.requestAnimationFrame(schedulerRef.current);
  }, [tracks, currentStep, playSound]);

  useEffect(() => {
    schedulerRef.current = scheduler;
  }, [scheduler]);

  const togglePlayback = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (isPlaying) {
      if (timerIDRef.current) window.cancelAnimationFrame(timerIDRef.current);
      setIsPlaying(false);
      sfx.playClick();
    } else {
      nextStepTimeRef.current = audioContextRef.current.currentTime;
      setIsPlaying(true);
      scheduler();
      sfx.playStart();
    }
  };

  const addTrack = (type: InstrumentType) => {
    const newTrack: Track = {
      id: Date.now().toString(),
      name: type === 'piano' ? 'Void Piano' : type === 'drums' ? 'Dark Drums' : 'Deep Bass',
      type,
      volume: 80,
      pan: 0,
      muted: false,
      clips: [],
      color: type === 'piano' ? 'bg-red-500' : type === 'drums' ? 'bg-zinc-500' : 'bg-indigo-500',
      reverb: 20,
      delay: 10,
      pitch: 0,
      vibrato: 0
    };
    setTracks([...tracks, newTrack]);
    sfx.playClick();
  };

  const generateMelody = async (trackId: string) => {
    setIsGeneratingMelody(trackId);
    sfx.playStart();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const track = tracks.find(t => t.id === trackId);
      
      const prompt = `Generate a musical melody sequence for a ${track?.type} track. 
      The sequence should be 32 steps long. 
      Return a JSON array of step indices (0-31) where a note should be played.
      The style should be dark, cinematic, and rhythmic.
      Example: [0, 4, 8, 12, 16, 20, 24, 28]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER }
          }
        }
      });

      if (response.text) {
        const steps = JSON.parse(response.text) as number[];
        setTracks(tracks.map(t => {
          if (t.id !== trackId) return t;
          const newClips = steps.map(step => ({
            id: Math.random().toString(36).substr(2, 9),
            startStep: step,
            length: 1
          }));
          return { ...t, clips: newClips };
        }));
        sfx.playComplete();
      }
    } catch (err) {
      console.error("Melody generation failed:", err);
    } finally {
      setIsGeneratingMelody(null);
    }
  };

  const generateFullArrangement = async () => {
    setIsGeneratingFull(true);
    sfx.playStart();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `Generate a full musical arrangement for 3 tracks: piano, drums, and bass.
      Each track should have a 32-step sequence.
      Return a JSON object where keys are track types and values are arrays of step indices (0-31).
      The style should be dark, cinematic, and industrial.
      Example: { "piano": [0, 8, 16], "drums": [0, 4, 8], "bass": [0, 16] }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              piano: { type: Type.ARRAY, items: { type: Type.INTEGER } },
              drums: { type: Type.ARRAY, items: { type: Type.INTEGER } },
              bass: { type: Type.ARRAY, items: { type: Type.INTEGER } }
            },
            required: ['piano', 'drums', 'bass']
          }
        }
      });

      if (response.text) {
        const arrangement = JSON.parse(response.text);
        setTracks(prevTracks => prevTracks.map(track => {
          const steps = arrangement[track.type] || [];
          const newClips = steps.map((step: number) => ({
            id: Math.random().toString(36).substr(2, 9),
            startStep: step,
            length: 1
          }));
          return { ...track, clips: newClips };
        }));
        sfx.playComplete();
      }
    } catch (err) {
      console.error("Full arrangement generation failed:", err);
    } finally {
      setIsGeneratingFull(false);
    }
  };

  const { addItem } = useVault();

  const exportMix = () => {
    sfx.playComplete();
    alert("Exporting high-quality 24-bit WAV mix... (Simulated)");
  };

  const saveArrangementToVault = () => {
    const name = prompt("Enter a name for this arrangement:", `Arrangement - ${new Date().toLocaleTimeString()}`);
    if (!name) return; // Cancelled
    
    addItem({
      type: 'arrangement',
      title: name,
      content: {
        tracks: tracks,
        bpm: BPM,
        steps: STEPS
      },
      tags: ['music-studio', 'arrangement']
    });
    sfx.playComplete();
    alert("Musical arrangement archived in the Kilvish Vault.");
  };

  const releaseToPlatforms = async () => {
    setIsReleasing(true);
    sfx.playStart();
    
    // Simulate autonomous AI distribution
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    sfx.playComplete();
    setIsReleasing(false);
    alert("Autonomous AI Distribution Complete! Album 'Void Anthems' has been released to Spotify, Apple Music, and YouTube Music. Audio footprint updated in Empire Intelligence.");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      sfx.playStart();
    } else {
      sfx.playClick();
    }
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
    sfx.playClick();
  };

  const toggleClip = (trackId: string, step: number) => {
    setTracks(tracks.map(track => {
      if (track.id !== trackId) return track;
      
      const existingClipIndex = track.clips.findIndex(c => c.startStep === step);
      if (existingClipIndex > -1) {
        return { ...track, clips: track.clips.filter((_, i) => i !== existingClipIndex) };
      } else {
        return { ...track, clips: [...track.clips, { id: Date.now().toString(), startStep: step, length: 1 }] };
      }
    }));
    sfx.playClick();
  };

  const updateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const toggleMute = (id: string) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, muted: !t.muted } : t));
    sfx.playClick();
  };

  return (
    <section id="studio" className="relative z-10 py-32 border-t border-white/5 bg-black/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              {t('musicStudio')}
            </h2>
            <p className="text-white/50 max-w-md uppercase tracking-widest text-xs font-bold">
              {t('studioDesc')}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
            <button
              onClick={togglePlayback}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                isPlaying ? 'bg-red-600 text-white' : 'bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={toggleRecording}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={generateFullArrangement}
              disabled={isGeneratingFull}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                isGeneratingFull ? 'bg-amber-500 text-white animate-pulse' : 'bg-white/10 text-white/60 hover:text-white'
              }`}
              title="AI Generate Full Arrangement"
            >
              {isGeneratingFull ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            </button>
            <button
              onClick={exportMix}
              className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/10 text-white/60 hover:text-white transition-all"
              title="Export Mix"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={releaseToPlatforms}
              disabled={isReleasing}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                isReleasing ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white/10 text-white/60 hover:text-indigo-400'
              }`}
              title="Autonomous AI Distribution (Release to Platforms)"
            >
              {isReleasing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
            </button>
            <button
              onClick={saveArrangementToVault}
              className="w-12 h-12 rounded-lg flex items-center justify-center bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
              title="Save Arrangement to Vault"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setIsGlobalMuted(!isGlobalMuted); sfx.playClick(); }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                isGlobalMuted ? 'bg-red-900 text-red-500' : 'bg-white/10 text-white/60 hover:text-white'
              }`}
              title={isGlobalMuted ? "Unmute All" : "Mute All"}
            >
              {isGlobalMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="px-4 border-l border-white/10 flex flex-col justify-center min-w-[120px]">
              <div className="flex justify-between text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">
                <span>Master Vol</span>
                <span>{masterVolume}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none accent-red-600"
              />
            </div>
            <div className="px-4 border-l border-white/10">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">BPM</p>
              <p className="text-xl font-mono font-bold text-red-500">{BPM}</p>
            </div>
            <div className="px-4 border-l border-white/10">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Step</p>
              <p className="text-xl font-mono font-bold text-white">{currentStep + 1}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-1">
          {[
            { id: 'arrangement', label: 'Arrangement', icon: Music },
            { id: 'mixing', label: 'Mixing & FX', icon: Settings2 },
            { id: 'mastering', label: 'Mastering Lab', icon: Zap },
            { id: 'lyrics', label: 'Lyrics Lab', icon: Music },
            { id: 'collaboration', label: 'Collaboration', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); sfx.playClick(); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white border-t border-x border-white/10' 
                  : 'text-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-1 border border-white/10 bg-white/5 rounded-b-2xl rounded-tr-2xl overflow-hidden">
          {/* Track Headers / Controls */}
          <div className="flex flex-col border-r border-white/10 bg-black/40">
            <div className="h-12 border-b border-white/10 flex items-center px-4">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Tracks</p>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {tracks.map(track => (
                <div key={track.id} className={`h-24 border-b border-white/10 p-4 space-y-3 group transition-all ${track.muted ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${track.color} ${track.muted ? 'animate-none' : ''}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${track.muted ? 'text-white/40 line-through' : 'text-white/80'}`}>{track.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => toggleMute(track.id)}
                        className={`p-1 transition-all ${track.muted ? 'text-red-500 opacity-100' : 'text-white/20 hover:text-white'}`}
                        title={track.muted ? "Unmute" : "Mute"}
                      >
                        {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                      <button 
                        onClick={() => generateMelody(track.id)}
                        disabled={isGeneratingMelody === track.id}
                        className="p-1 text-white/20 hover:text-amber-500 transition-all"
                        title="AI Generate Melody"
                      >
                        {isGeneratingMelody === track.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      </button>
                      <button 
                        onClick={() => removeTrack(track.id)}
                        className="p-1 text-white/20 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {activeTab === 'arrangement' ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/30">
                          <span>Vol</span>
                          <span>{track.volume}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={track.volume}
                          onChange={(e) => updateTrack(track.id, { volume: parseInt(e.target.value) })}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none accent-red-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/30">
                          <span>Pan</span>
                          <span>{track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'C'}</span>
                        </div>
                        <input 
                          type="range" 
                          min="-1" max="1" step="0.1"
                          value={track.pan}
                          onChange={(e) => updateTrack(track.id, { pan: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none accent-white/40"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/30">
                          <span>Pitch</span>
                          <span>{track.pitch > 0 ? '+' : ''}{track.pitch}st</span>
                        </div>
                        <input 
                          type="range" 
                          min="-12" max="12" step="1"
                          value={track.pitch}
                          onChange={(e) => updateTrack(track.id, { pitch: parseInt(e.target.value) })}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none accent-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/30">
                          <span>Vib</span>
                          <span>{track.vibrato}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={track.vibrato}
                          onChange={(e) => updateTrack(track.id, { vibrato: parseInt(e.target.value) })}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none accent-emerald-500"
                        />
                      </div>
                    </div>
                  ) : activeTab === 'mixing' ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/30">
                          <span>Reverb</span>
                          <span>{track.reverb}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={track.reverb}
                          onChange={(e) => updateTrack(track.id, { reverb: parseInt(e.target.value) })}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/30">
                          <span>Delay</span>
                          <span>{track.delay}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={track.delay}
                          onChange={(e) => updateTrack(track.id, { delay: parseInt(e.target.value) })}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none accent-purple-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/30">
                          <span>Pitch</span>
                          <span>{track.pitch}st</span>
                        </div>
                        <input 
                          type="range" 
                          min="-12" max="12" step="1"
                          value={track.pitch}
                          onChange={(e) => updateTrack(track.id, { pitch: parseInt(e.target.value) })}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none accent-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/30">
                          <span>Vibrato</span>
                          <span>{track.vibrato}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={track.vibrato}
                          onChange={(e) => updateTrack(track.id, { vibrato: parseInt(e.target.value) })}
                          className="w-full h-1 bg-white/10 rounded-full appearance-none accent-emerald-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Collaborative Mode Active</span>
                    </div>
                  )}
                </div>
              ))}
              <div className="p-4 grid grid-cols-3 gap-2">
                <button onClick={() => addTrack('piano')} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex flex-col items-center gap-1">
                  <Music className="w-4 h-4 text-red-500" />
                  <span className="text-[8px] uppercase font-bold text-white/40">Piano</span>
                </button>
                <button onClick={() => addTrack('drums')} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex flex-col items-center gap-1">
                  <Drum className="w-4 h-4 text-zinc-500" />
                  <span className="text-[8px] uppercase font-bold text-white/40">Drums</span>
                </button>
                <button onClick={() => addTrack('bass')} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex flex-col items-center gap-1">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span className="text-[8px] uppercase font-bold text-white/40">Bass</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main View Area */}
          <div className="flex flex-col bg-black/20">
            {activeTab === 'mastering' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[600px] bg-gradient-to-b from-black/40 to-black/80">
                <div className="max-w-xl w-full space-y-8">
                  <div className="text-center space-y-4">
                    <Zap className="w-12 h-12 text-red-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-black uppercase tracking-widest text-white">Kilvish Mastering</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                      Enhance your arrangement with dark, cinematic mastering algorithms.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Bass Boost', icon: Zap, desc: 'Deepen the void' },
                      { label: 'Clarity', icon: Sparkles, desc: 'Sharpen the shadows' },
                      { label: 'Loudness', icon: Volume2, desc: 'Maximize terror' },
                    ].map((item, i) => (
                      <div key={i} className="p-6 border border-white/5 bg-white/[0.02] rounded-xl text-center group hover:border-red-500/30 transition-colors cursor-pointer">
                        <item.icon className="w-6 h-6 text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">{item.label}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/30">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      sfx.playStart();
                      alert("Mastering process initiated. Applying Kilvish algorithms to the current arrangement...");
                      setTimeout(() => {
                        sfx.playComplete();
                        alert("Mastering complete! Your track is now ready for the void.");
                      }, 2000);
                    }}
                    className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-black tracking-[0.2em] uppercase text-sm transition-all flex items-center justify-center gap-3 rounded-xl shadow-xl shadow-red-900/20"
                  >
                    <Zap className="w-5 h-5" />
                    Master Current Arrangement
                  </button>
                </div>
              </div>
            ) : activeTab === 'arrangement' || activeTab === 'mixing' ? (
              <div className="flex flex-col overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="h-12 border-b border-white/10 flex min-w-max">
                  {Array.from({ length: STEPS }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-12 h-full border-r border-white/5 flex items-center justify-center text-[10px] font-mono transition-all duration-75 ${
                        i % 4 === 0 ? 'text-white/40 bg-white/5' : 'text-white/10'
                      } ${currentStep === i ? 'bg-red-500/40 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] z-10 scale-110' : ''}`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-max relative">
                  {/* Global Playhead Line */}
                  <div 
                    className="absolute top-0 bottom-0 w-12 border-x border-white/20 bg-white/5 pointer-events-none z-20 transition-all duration-75"
                    style={{ left: `${currentStep * 3}rem` }}
                  />
                  {tracks.map(track => (
                    <div key={track.id} className="h-24 border-b border-white/10 flex relative">
                      {Array.from({ length: STEPS }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => toggleClip(track.id, i)}
                          className={`w-12 h-full border-r border-white/5 transition-colors relative group/step ${
                            i % 4 === 0 ? 'bg-white/[0.02]' : ''
                          } hover:bg-white/5`}
                        >
                          <AnimatePresence>
                            {track.clips.some(c => i >= c.startStep && i < c.startStep + c.length) && (
                              <motion.div
                                layoutId={`clip-${track.id}-${i}`}
                                className={`absolute inset-1 rounded-sm ${track.color} shadow-lg shadow-black/40 transition-all duration-75 ${
                                  track.muted ? 'opacity-30 grayscale' : 'opacity-100'
                                } ${
                                  currentStep === i && !track.muted && isPlaying 
                                    ? 'brightness-150 shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105 z-10' 
                                    : ''
                                }`}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ 
                                  scale: currentStep === i && !track.muted && isPlaying ? 1.05 : 1, 
                                  opacity: track.muted ? 0.3 : 1 
                                }}
                                exit={{ scale: 0.5, opacity: 0 }}
                              />
                            )}
                          </AnimatePresence>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'lyrics' ? (
              <div className="flex-1 p-8 bg-black/40 overflow-y-auto max-h-[600px]">
                <LyricGenerator />
              </div>
            ) : (
              <div className="flex-1 grid lg:grid-cols-2 gap-1 overflow-hidden h-[600px]">
                {/* Lyrics & Songwriting */}
                <div className="p-8 border-r border-white/10 space-y-6 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Lyric Drafts
                    </h3>
                    <button className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                      <Share2 className="w-3 h-3" /> Invite
                    </button>
                  </div>
                  <textarea 
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-6 text-sm font-mono leading-relaxed text-white/80 focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>
                
                {/* Comments & Collaborators */}
                <div className="p-8 space-y-8 flex flex-col">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Collaborators
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {collaborators.map(collab => (
                        <div key={collab.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                          <div className={`w-1.5 h-1.5 rounded-full ${collab.active ? 'bg-emerald-500' : 'bg-white/20'}`} />
                          <span className="text-[10px] font-bold text-white/80">{collab.name}</span>
                          <span className="text-[8px] font-medium text-white/30 uppercase tracking-widest">{collab.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Feedback
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {comments.map(comment => (
                        <div key={comment.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{comment.user}</span>
                            <span className="text-[8px] font-medium text-white/20 uppercase tracking-widest">{comment.time}</span>
                          </div>
                          <p className="text-xs text-white/60 leading-relaxed">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                      />
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest">
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Melody</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-500" />
            <span>Rhythm</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Foundation</span>
          </div>
        </div>
      </div>
    </section>
  );
}
