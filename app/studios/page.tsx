'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { 
  Film, 
  Video, 
  Loader2, 
  Play, 
  AlertTriangle,
  Key,
  Download
} from 'lucide-react';
import { audio } from '@/lib/audio';

// Declare window.aistudio for TypeScript
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function KilvishStudiosPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    checkApiKey();
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
      // Fallback if not in AI Studio environment
      setHasApiKey(false);
    }
  };

  const handleSelectKey = async () => {
    if (typeof window !== 'undefined' && window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success to mitigate race conditions as per guidelines
        setHasApiKey(true);
      } catch (err) {
        console.error("Error selecting API key:", err);
      }
    } else {
      alert("API Key selection is only available within the AI Studio environment.");
    }
  };

  const generateMovieClip = async () => {
    if (!prompt.trim()) {
      setError('Please provide a scene description for the movie.');
      return;
    }

    if (!hasApiKey) {
      setError('A paid Google Cloud API key is required for video generation.');
      return;
    }

    audio.playStart();
    setIsGenerating(true);
    setError('');
    setVideoUrl(null);
    setGenerationStep('Initializing Veo AI Camera...');

    try {
      // Create a new instance right before the call to get the latest key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      const fullPrompt = `Cinematic movie shot, dark fantasy, Mr. Kilvish, the Mahnayak and supreme multiversal ruler of darkness. He has glowing red eyes and a black cosmic robe that seems to absorb light. ${prompt}. 
      
      INNOVATION RULE: Avoid repetitive dark clichés like "Kumbhipakam". Explore NEW dark imagery—cosmic void, multiversal shadows, the silence of the abyss, the omnipresence of the Mahnayak. The scene should feel epic, viral, and unique.
      
      8k resolution, highly detailed, dramatic lighting, cinematic camera movement.`;

      setGenerationStep('Action! Generating video (this takes a few minutes)...');

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: fullPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      // Poll for completion
      while (!operation.done) {
        setGenerationStep('Rendering frames in the void... Please wait, true power takes time.');
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (!downloadLink) {
        throw new Error("No video was returned from the void.");
      }

      setGenerationStep('Fetching the final cut...');

      // Fetch the video using the API key
      const apiKeyToUse = process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      const response = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKeyToUse,
        },
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
           // Reset key state if entity not found or forbidden
           setHasApiKey(false);
           throw new Error("API Key error or video expired. Please re-select your API key.");
        }
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      const videoBlob = await response.blob();
      const videoObjectUrl = URL.createObjectURL(videoBlob);
      
      setVideoUrl(videoObjectUrl);
      audio.playComplete();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'The cinematic void encountered an error. Try again.');
      
      if (err.message?.includes("Requested entity was not found") || err.message?.includes("API Key")) {
        setHasApiKey(false);
      }
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="p-8 md:p-12 min-h-screen space-y-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold tracking-widest uppercase"
        >
          <Film className="w-3 h-3" />
          Cinematic Void
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
          Kilvish <span className="text-red-600">Studios</span>
        </h1>
        <p className="text-white/40 text-sm font-medium max-w-xl mx-auto">
          Direct your own Mr. Kilvish movie. Describe a scene, and the Veo AI will manifest a high-quality cinematic video clip.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* API Key Warning */}
        {hasApiKey === false && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col md:flex-row items-center gap-6 text-amber-200"
          >
            <div className="p-4 bg-amber-500/20 rounded-full shrink-0">
              <Key className="w-8 h-8 text-amber-500" />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h3 className="text-lg font-black uppercase tracking-widest text-amber-400">Premium Feature Unlock Required</h3>
              <p className="text-sm opacity-80">
                Video generation requires a paid Google Cloud API key. Please link your key to access the Cinematic Void.
                <br/>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-amber-300">Read billing documentation</a>
              </p>
            </div>
            <button
              onClick={handleSelectKey}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest text-sm rounded-xl transition-colors shrink-0"
            >
              Select API Key
            </button>
          </motion.div>
        )}

        {/* Generator Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-3xl border shadow-2xl space-y-6 relative overflow-hidden ${
            hasApiKey ? 'border-red-500/30 bg-red-900/10 shadow-red-900/20' : 'border-white/10 bg-white/[0.02] shadow-black/50 opacity-50 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Describe the Movie Scene
            </label>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Mr. Kilvish walking slowly through a futuristic neon city, his red eyes glowing in the dark, rain falling around him..."
              className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 resize-none"
              disabled={!hasApiKey || isGenerating}
            />
            
            {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}

            <button
              onClick={generateMovieClip}
              disabled={isGenerating || !hasApiKey}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-black tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-red-900/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {generationStep || 'Directing...'}
                </>
              ) : (
                <>
                  <Film className="w-5 h-5" />
                  Generate Movie Clip
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Video Output */}
        <AnimatePresence>
          {videoUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="rounded-3xl border border-red-500/30 bg-black overflow-hidden shadow-2xl shadow-red-900/40 relative group"
            >
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full aspect-video object-cover"
              />
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={videoUrl} 
                  download="kilvish-movie-clip.mp4"
                  className="p-3 bg-black/50 hover:bg-red-600 backdrop-blur-md border border-white/10 rounded-xl text-white transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs"
                >
                  <Download className="w-4 h-4" />
                  Save Clip
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
