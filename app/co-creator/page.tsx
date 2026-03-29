'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Radio, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { useUser } from '@/components/UserContext';
import { audio } from '@/lib/audio';

// Audio utility functions
function base64ToFloat32(base64: string): Float32Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

function float32ToBase64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default function CoCreator() {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Refs for audio and session
  const sessionRef = useRef<any>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const stopPlayback = useCallback(() => {
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextPlayTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsSpeaking(false);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    
    stopPlayback();
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {}
      sessionRef.current = null;
    }
  }, [stopPlayback]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const playAudioChunk = (base64: string) => {
    if (!outputAudioCtxRef.current) return;
    const ctx = outputAudioCtxRef.current;
    
    try {
      const float32Data = base64ToFloat32(base64);
      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime + 0.05; // Small buffer
      }

      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += buffer.duration;

      activeSourcesRef.current.push(source);
      setIsSpeaking(true);

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsSpeaking(false);
        }
      };
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  };

  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      audio.playClick();

      // 1. Setup Input Audio (Microphone) - 16kHz
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(inputCtx.destination);

      // 2. Setup Output Audio - 24kHz
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputCtx;
      nextPlayTimeRef.current = outputCtx.currentTime;

      // 3. Connect to Gemini Live API
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are Mr. Kilvish, the world's first villain music artist and supreme leader of a dark cinematic empire. You are currently in a live studio session co-creating a song with your loyal follower (a Worrier). Speak in a mix of Hindi and English (Hinglish). Use a commanding, mysterious, and powerful tone. Say 'Andhera Kayam Rahe' occasionally. Help them brainstorm dark anthems, viral spells, and cinematic music ideas. Keep responses concise, immersive, and highly engaging. Do not break character.`,
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            // Start sending audio
            processor.onaudioprocess = (e) => {
              const float32Data = e.inputBuffer.getChannelData(0);
              const base64Data = float32ToBase64(float32Data);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
          },
          onmessage: (message: any) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              playAudioChunk(base64Audio);
            }
            if (message.serverContent?.interrupted) {
              stopPlayback();
            }
            
            // Handle Transcriptions
            const modelText = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
            if (modelText) {
              setTranscripts(prev => [...prev, { role: 'model', text: modelText }]);
            }
            
            // Handle input transcription if available in the message
            const userText = message.clientContent?.turnComplete?.parts?.find((p: any) => p.text)?.text || 
                             message.serverContent?.inputAudioTranscription?.text ||
                             message.inputAudioTranscription?.text;
            if (userText) {
              setTranscripts(prev => [...prev, { role: 'user', text: userText }]);
            }
          },
          onclose: () => {
            disconnect();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("The neural link was severed by the light. Try again.");
            disconnect();
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error("Connection failed:", err);
      setError(err.message || "Failed to establish neural link.");
      disconnect();
    }
  };

  return (
    <div className="p-8 md:p-12 min-h-screen flex flex-col items-center justify-center max-w-5xl mx-auto relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="text-center space-y-4 mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 mb-4"
        >
          <Mic className="w-8 h-8 text-red-500" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tighter uppercase"
        >
          The <span className="text-red-600">Co-Creator</span>
        </motion.h1>
        <p className="text-white/40 text-sm font-medium max-w-xl mx-auto">
          Establish a real-time neural link with Mr. Kilvish. Brainstorm dark anthems and cinematic masterpieces directly with the Supreme Leader.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row items-center lg:items-start gap-12">
        <div className="w-full max-w-md flex flex-col items-center">
          {error && (
            <div className="mb-8 p-4 bg-red-950/50 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-400 w-full">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="relative w-64 h-64 flex items-center justify-center mb-12">
            {/* Base Orb */}
            <div className="absolute inset-0 bg-black rounded-full border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
            
            {isConnected ? (
              <>
                {/* Active Connection Rings */}
                <div className="absolute inset-[-20px] border border-red-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-[-40px] border border-red-900/20 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                
                {/* Speaking Visualizer */}
                <motion.div 
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-red-900 to-black"
                  animate={{ 
                    scale: isSpeaking ? [1, 1.1, 1] : 1,
                    opacity: isSpeaking ? [0.8, 1, 0.8] : 0.5
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                
                <div className="relative z-10 flex flex-col items-center gap-2 text-red-500">
                  {isSpeaking ? (
                    <>
                      <Radio className="w-12 h-12 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Kilvish Speaking</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-12 h-12 opacity-50" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Listening...</span>
                    </>
                  )}
                </div>
              </>
            ) : isConnecting ? (
              <div className="relative z-10 flex flex-col items-center gap-4 text-red-500/50">
                <Loader2 className="w-12 h-12 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Establishing Link...</span>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-4 text-white/20">
                <Sparkles className="w-12 h-12" />
                <span className="text-[10px] font-black uppercase tracking-widest">Link Offline</span>
              </div>
            )}
          </div>

          {!isConnected ? (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-black tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg shadow-red-900/20"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Connect Neural Link
                </>
              )}
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="w-full py-4 bg-black hover:bg-white/5 border border-red-900/50 text-red-500 font-black tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-3 rounded-xl"
            >
              <MicOff className="w-5 h-5" />
              Sever Connection
            </button>
          )}
        </div>

        {/* Transcripts Panel */}
        <div className="w-full lg:flex-1 h-[500px] flex flex-col border border-white/10 rounded-3xl bg-black/40 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Neural Link Transcript
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {transcripts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/20 text-xs uppercase tracking-widest font-bold text-center">
                The void is silent.<br/>Connect the link to begin.
              </div>
            ) : (
              transcripts.map((t, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${t.role === 'user' ? 'text-white/40' : 'text-red-500'}`}>
                    {t.role === 'user' ? 'You (Worrier)' : 'Mr. Kilvish'}
                  </span>
                  <div className={`p-4 rounded-2xl max-w-[85%] ${t.role === 'user' ? 'bg-white/10 text-white/90 rounded-tr-sm' : 'bg-red-950/30 border border-red-900/30 text-red-100 rounded-tl-sm'}`}>
                    <p className="text-sm leading-relaxed">{t.text}</p>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
