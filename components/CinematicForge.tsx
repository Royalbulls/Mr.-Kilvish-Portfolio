'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { Film, Image as ImageIcon, PenTool, Loader2, Sparkles, Download, AlertTriangle, Save, Clapperboard, Video } from 'lucide-react';
import Image from 'next/image';
import { audio } from '@/lib/audio';
import { useUser } from './UserContext';
import { useVault } from './VaultContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export function CinematicForge() {
  const { firebaseUser } = useUser();
  const { addItem } = useVault();
  const [mode, setMode] = useState<'writer' | 'image' | 'director' | 'youtube'>('writer');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sceneScript, setSceneScript] = useState<string | null>(null);
  const [sceneImage, setSceneImage] = useState<string | null>(null);
  const [directorTreatment, setDirectorTreatment] = useState<string | null>(null);
  const [youtubeStory, setYoutubeStory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveContent = async (type: 'script' | 'image' | 'story', data: string) => {
    if (!firebaseUser) {
      alert("You must be logged in to save content.");
      return;
    }
    
    setIsSaving(true);
    try {
      await addItem({
        type,
        title: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
        content: data,
        tags: ['cinematic-forge']
      });
      alert("Content saved to The Vault successfully.");
    } catch (err) {
      console.error("Error saving content:", err);
      alert("Failed to save content.");
    } finally {
      setIsSaving(false);
    }
  };

  const generateContent = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    audio.playStart();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      if (mode === 'writer') {
        setSceneScript(null);
        const systemInstruction = `You are the lead screenwriter for the Kilvish Empire. Your task is to write a highly detailed, cinematic scene script based on the user's prompt. The tone must be dark, epic, and visually striking, fitting the persona of Mr. Kilvish. Include scene headings (e.g., EXT. KILVISHSTAN - NIGHT), character actions, and dialogue. Emphasize lighting, camera angles, and atmosphere.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: {
            systemInstruction,
          }
        });
        
        setSceneScript(response.text || "The void returned no script.");
        audio.playComplete();
      } else if (mode === 'director') {
        setDirectorTreatment(null);
        const systemInstruction = `You are a world-class Hollywood Director specializing in dark, epic, sci-fi and fantasy cinema. Your task is to act as the "Kilvish Empire Director". 
        Based on the user's story idea, you must:
        1. Determine the necessary scenes to tell this story effectively, ensuring a cinematic flow and emotional impact.
        2. For each scene, provide a "Director's Treatment" which includes:
           - Scene Title & Objective: What is the emotional core of this scene?
           - Shot List: Detailed descriptions of Action shots, Close-ups, Wide shots, Tracking shots, and POV shots.
           - Visual Generation Prompts: Highly detailed prompts optimized for AI video generators (like Sora, Runway Gen-3, Kling, Luma Dream Machine, Pika). These prompts should describe lighting (e.g., volumetric, rim lighting, chiaroscuro), motion (e.g., slow-motion, kinetic, fluid), camera movement (e.g., dolly zoom, crane shot, handheld), and specific Kilvish-themed aesthetics (dark, neon-noir, imperial, gothic sci-fi). Ensure these are usable in any AI video app.
           - Dialogue & Key Actions: Specific lines and movements that drive the scene forward.
           - Production Notes: Sound design, atmosphere, and "Everything Else" needed to bring the vision to life.
        The tone must be authoritative, professional, and dark. Focus on creating a cohesive cinematic experience for the Kilvish Empire.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: {
            systemInstruction,
          }
        });
        
        setDirectorTreatment(response.text || "The Director has no vision for this.");
        audio.playComplete();
      } else if (mode === 'youtube') {
        setYoutubeStory(null);
        const systemInstruction = `You are a viral content strategist and YouTube Director for the Kilvish Empire. Your task is to generate a comprehensive story and AI prompts for a YouTube video.
        Based on the user's concept, you must provide:
        1. A compelling YouTube Story/Script: Divided into Hook (first 5 seconds), Intro, Main Content (3-5 segments), and Outro/CTA.
        2. AI Video Prompts for each segment: Optimized for tools like Sora, Runway, or Kling. These should be visually engaging, high-contrast, and "viral-ready".
        3. Action Shot Prompts: Specific prompts for high-energy, attention-grabbing action sequences that stop the scroll.
        4. Dialogue Prompts: Engaging, punchy lines that resonate with the Kilvish audience and encourage engagement.
        5. Thumbnail Concept: A visual prompt for a high-click-through-rate thumbnail.
        The tone should be energetic, mysterious, and imperial. Focus on high retention and visual spectacle.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: {
            systemInstruction,
          }
        });
        
        setYoutubeStory(response.text || "The YouTube algorithm rejects this vision.");
        audio.playComplete();
      } else {
        setSceneImage(null);
        const imagePrompt = `Cinematic, dark, epic, highly detailed storyboard frame for a Mr. Kilvish film. ${prompt}. Moody lighting, dramatic shadows, 8k resolution, photorealistic, cinematic composition.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: imagePrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        });
        
        let foundImage = false;
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64EncodeString = part.inlineData.data;
              setSceneImage(`data:image/png;base64,${base64EncodeString}`);
              foundImage = true;
              break;
            }
          }
        }
        
        if (!foundImage) {
          throw new Error("Failed to generate image. The void remains dark.");
        }
        audio.playComplete();
      }
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "An unknown error occurred during generation.");
      audio.playError();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-24 space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-red-950/20 to-black">
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Film className="w-8 h-8 text-red-600" />
            Cinematic Forge
          </h2>
          <p className="text-sm text-white/40 font-medium uppercase tracking-widest">AI Scene Writer & Image Creator</p>
        </div>
        
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            onClick={() => setMode('writer')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'writer' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <PenTool className="w-4 h-4" />
            Scene Writer
          </button>
          <button
            onClick={() => setMode('image')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'image' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Scene Image
          </button>
          <button
            onClick={() => setMode('director')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'director' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            Empire Director
          </button>
          <button
            onClick={() => setMode('youtube')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'youtube' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Video className="w-4 h-4" />
            YouTube Creator
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-red-500">Generation Failed</p>
            <p className="text-sm text-white/70">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-white/60">
              {mode === 'writer' ? 'Describe the Scene' : mode === 'director' ? 'Empire Story Concept' : mode === 'youtube' ? 'YouTube Video Concept' : 'Describe the Visual Frame'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'writer' 
                ? "e.g., Mr. Kilvish confronts a rogue AI in the neon-lit streets of Kilvishstan..." 
                : mode === 'director'
                ? "e.g., A 3-act story about Kilvish reclaiming his throne from the Lords of Light..."
                : mode === 'youtube'
                ? "e.g., A video explaining the origins of the Kilvish Empire with epic visual hooks..."
                : "e.g., A wide shot of Mr. Kilvish standing on a skyscraper overlooking a dark, futuristic city..."}
              className="w-full h-48 bg-black border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 transition-all resize-none"
            />
            <button
              onClick={generateContent}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-black tracking-[0.2em] uppercase text-xs transition-all rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-red-900/40"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'Forging...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2">
          <div className="h-full min-h-[400px] p-8 rounded-3xl border border-white/10 bg-black/40 relative overflow-hidden flex flex-col">
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
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500 animate-pulse">
                    {mode === 'writer' ? 'Writing Script...' : mode === 'director' ? 'Directing Empire...' : mode === 'youtube' ? 'Strategizing Content...' : 'Rendering Frame...'}
                  </p>
                </motion.div>
              ) : mode === 'writer' && sceneScript ? (
                <motion.div 
                  key="script"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Generated Scene Script</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => saveContent('script', sceneScript)}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />
                        {isSaving ? 'Saving...' : 'Save to Vault'}
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(sceneScript);
                          alert("Script copied to clipboard.");
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                      >
                        Copy Script
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    <pre className="font-mono text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                      {sceneScript}
                    </pre>
                  </div>
                </motion.div>
              ) : mode === 'director' && directorTreatment ? (
                <motion.div 
                  key="director"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Empire Director&apos;s Treatment</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => saveContent('script', directorTreatment)}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />
                        {isSaving ? 'Saving...' : 'Save to Vault'}
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(directorTreatment);
                          alert("Treatment copied to clipboard.");
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                      >
                        Copy Treatment
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="prose prose-invert max-w-none">
                      <pre className="font-mono text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                        {directorTreatment}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              ) : mode === 'youtube' && youtubeStory ? (
                <motion.div 
                  key="youtube"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-red-500">YouTube Story & AI Prompts</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => saveContent('story', youtubeStory)}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />
                        {isSaving ? 'Saving...' : 'Save to Vault'}
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(youtubeStory);
                          alert("Story copied to clipboard.");
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                      >
                        Copy Story
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    <pre className="font-mono text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                      {youtubeStory}
                    </pre>
                  </div>
                </motion.div>
              ) : mode === 'image' && sceneImage ? (
                <motion.div 
                  key="image"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Generated Storyboard Frame</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => saveContent('image', sceneImage)}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />
                        {isSaving ? 'Saving...' : 'Save to Vault'}
                      </button>
                      <a 
                        href={sceneImage}
                        download="kilvish-scene.png"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download Image
                      </a>
                    </div>
                  </div>
                  <div className="relative flex-1 rounded-xl overflow-hidden border border-white/10 group">
                    <Image 
                      src={sceneImage} 
                      alt="Generated Scene" 
                      fill 
                      className="object-contain bg-black/50"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center opacity-20 space-y-6"
                >
                  {mode === 'writer' ? <PenTool className="w-16 h-16" /> : mode === 'director' ? <Clapperboard className="w-16 h-16" /> : <ImageIcon className="w-16 h-16" />}
                  <p className="text-xs uppercase tracking-[0.3em] text-center max-w-xs">
                    {mode === 'writer' ? 'Awaiting your direction to forge the script.' : mode === 'director' ? 'Awaiting your story concept to direct the Empire.' : 'Awaiting your vision to render the frame.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
