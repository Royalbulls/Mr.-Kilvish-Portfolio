'use client';

import { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Eye, Sparkles, PlayCircle, Download, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from '@/lib/audio';

export function Prophecies() {
  const [vision, setVision] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const initAudio = () => audio.init();
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const manifestVision = async () => {
    if (!vision.trim()) {
      setError('You must provide a vision to manifest.');
      return;
    }

    audio.playStart();
    setIsGenerating(true);
    setError('');
    setVideoUrl(null);
    setStatus('Consulting the dark oracle...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      // Enhance the prompt for Veo
      const enhancedPrompt = `A dark, cinematic, ominous, and highly detailed vision of: ${vision}. 
      
      The aesthetic should be red and black, powerful, imposing, and fit for the Mahnayak Mr. Kilvish. 
      
      INNOVATION RULE: Avoid repetitive dark clichés like "Kumbhipakam". Explore NEW dark imagery—cosmic void, multiversal shadows, the silence of the abyss, the omnipresence of the Mahnayak. The vision should feel like a viral, epic prophecy that echoes across the multiverse.
      
      High quality, 4k resolution, dramatic lighting.`;

      setStatus('Manifesting the vision into reality (This may take a few minutes)...');
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: enhancedPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        setStatus('The void is still weaving your prophecy...');
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        // Fetch the video with the API key
        setStatus('Retrieving the sacred artifact...');
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_API_KEY as string,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          audio.playComplete();
          setStatus('');
        } else {
          throw new Error('Failed to retrieve the video artifact.');
        }
      } else {
        throw new Error('The oracle failed to produce a vision.');
      }

    } catch (err) {
      console.error(err);
      setError('The manifestation failed. The void rejected your vision.');
      setStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Input Control */}
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
              Describe Your Prophecy
            </label>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="e.g., A massive dark citadel rising from the ashes, red lightning striking the highest tower..."
              className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 resize-none font-medium"
            />
          </div>

          <button
            onClick={manifestVision}
            disabled={isGenerating}
            className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-black tracking-[0.3em] uppercase text-sm transition-all flex items-center justify-center gap-4 rounded-2xl shadow-2xl shadow-red-900/40"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Manifesting...
              </>
            ) : (
              <>
                <Eye className="w-6 h-6" />
                Manifest Vision
              </>
            )}
          </button>

          {status && (
            <div className="flex items-center justify-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">
              <Sparkles className="w-4 h-4" />
              {status}
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-relaxed">
              Note: The Oracle of Darkness (Veo 3.1) requires immense power. Manifestations may take 1-3 minutes to complete. Do not look away.
            </p>
          </div>
        </div>

        {/* Output Display */}
        <div className="relative min-h-[400px] lg:min-h-[600px] rounded-3xl border border-white/10 bg-black overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />
          
          {videoUrl ? (
            <div className="relative z-10 w-full h-full p-8 flex flex-col items-center justify-center space-y-8">
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-red-900/20 bg-black">
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-cover"
                />
              </div>
              <a
                href={videoUrl}
                download="kilvish-prophecy.mp4"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all flex items-center gap-3"
              >
                <Download className="w-4 h-4" />
                Download Artifact
              </a>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center space-y-6 opacity-20">
              <div className="relative">
                <Eye className="w-20 h-20 text-white" />
                {isGenerating && <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-red-500 animate-pulse" />}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-widest">The Void is Empty</h3>
                <p className="text-xs uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                  Provide a vision to manifest the future of the Kilvish Empire.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
