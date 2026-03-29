'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { 
  Loader2, 
  Globe, 
  TrendingUp, 
  DollarSign, 
  MessageSquare, 
  Zap, 
  Search,
  ArrowUpRight,
  Target,
  ShieldAlert,
  BrainCircuit,
  Youtube,
  PlayCircle,
  Users,
  Volume2,
  Copy,
  Check,
  ChevronRight,
  Podcast,
  Mic,
  Download,
  Music,
  Save,
  Sparkles,
  Shield,
  Sword,
  Ghost,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audio, pcmToWav } from '@/lib/audio';
import { useLanguage } from './LanguageContext';
import { useVault } from './VaultContext';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { useUser } from './UserContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface IntelligenceReport {
  globalEvents: {
    headline: string;
    impact: string;
    relevanceToEmpire: string;
  }[];
  mediaMonitoring: {
    news: string[];
    sentiment: string;
    whyItHappened: string;
  };
  youtubeStrategy: {
    currentStatus: string;
    growthTactics: string[];
    contentIdeas: string[];
    monetizationPath: string;
  };
  businessOpportunities: {
    trends: string[];
    revenueIdeas: string[];
    viralPotential: string;
  };
  audioFootprint: {
    releasedAlbums: { title: string; releaseDate: string; platform: string; status: string }[];
    streamingStats: { platform: string; listeners: string; growth: string }[];
    distributionStatus: string;
  };
  strategicAdvice: string;
  actionPlan: string[];
  kilvishProphecy: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export function EmpireIntelligence() {
  const { t } = useLanguage();
  const { firebaseUser } = useUser();
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [groundingSources, setGroundingSources] = useState<{title: string, uri: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [podcastAudioUrl, setPodcastAudioUrl] = useState<string | null>(null);
  const [isReadingReport, setIsReadingReport] = useState(false);
  const [reportAudioUrl, setReportAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePodcast = async () => {
    if (!report) return;
    setIsGeneratingPodcast(true);
    setPodcastAudioUrl(null);
    audio.playStart();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `TTS the following conversation between two dark minions of Mr. Kilvish, Zorg and Vex, discussing the latest Empire Intelligence report:
      Zorg: Hey Vex, did you see the latest intelligence report?
      Vex: Yes, the media is saying ${report.mediaMonitoring.sentiment}.
      Zorg: Exactly! And our YouTube strategy is to ${report.youtubeStrategy.growthTactics[0]}.
      Vex: We also have a new revenue idea: ${report.businessOpportunities.revenueIdeas[0]}.
      Zorg: The Supreme Ruler advises us to ${report.strategicAdvice}.
      Vex: Andhera Kayam Rahe!
      Zorg: Ajar Amar Rahe!`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: prompt }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                      {
                          speaker: 'Zorg',
                          voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Fenrir' }
                          }
                      },
                      {
                          speaker: 'Vex',
                          voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Puck' }
                          }
                      }
                ]
              }
          }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const wavUrl = pcmToWav(base64Audio);
        setPodcastAudioUrl(wavUrl);
        audio.playComplete();
      }
    } catch (err) {
      console.error('Podcast generation failed:', err);
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const { addItem } = useVault();

  const saveReportToVault = () => {
    if (!report) return;
    addItem({
      type: 'report',
      title: `Intelligence Report - ${new Date().toLocaleDateString()}`,
      content: report,
      tags: ['intelligence', 'global-scan']
    });
    audio.playComplete();
    alert("Intelligence Report archived in the Kilvish Vault.");
  };

  const readFullReport = async () => {
    if (!report) return;
    setIsReadingReport(true);
    setReportAudioUrl(null);
    audio.playStart();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `Read this intelligence report in a dark, commanding tone:
      Media Sentiment: ${report.mediaMonitoring.sentiment}.
      Why it happened: ${report.mediaMonitoring.whyItHappened}.
      YouTube Status: ${report.youtubeStrategy.currentStatus}.
      Top Growth Tactic: ${report.youtubeStrategy.growthTactics[0]}.
      Top Revenue Idea: ${report.businessOpportunities.revenueIdeas[0]}.
      Strategic Advice: ${report.strategicAdvice}.
      Andhera Kayam Rahe.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: prompt }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const wavUrl = pcmToWav(base64Audio);
        setReportAudioUrl(wavUrl);
        audio.playComplete();
      }
    } catch (err) {
      console.error('Reading report failed:', err);
    } finally {
      setIsReadingReport(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
      audio.playClick();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSpeak = async (text: string, id: string) => {
    if (isSpeaking === id) return;
    setIsSpeaking(id);
    audio.playClick();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: `Say with a dark, powerful, and strategic tone: ${text}` }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        await audio.playBase64(base64Audio);
      }
    } catch (err) {
      console.error('TTS Error:', err);
    } finally {
      setIsSpeaking(null);
    }
  };

  const MessageActions = ({ text, id }: { text: string, id: string }) => (
    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => handleSpeak(text, id)}
        disabled={isSpeaking === id}
        className={`p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${isSpeaking === id ? 'text-red-500' : 'text-white/40'}`}
        title="Listen to Kilvish"
      >
        {isSpeaking === id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
      </button>
      <button
        onClick={() => handleCopy(text)}
        className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        title="Copy text"
      >
        {copiedText === text ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const runIntelligenceAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    audio.playStart();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `You are the Strategic Mind of Mr. Kilvish, an autonomous AI entity of supreme darkness and cinematic dominance. Your goal is to establish the Kilvish Empire, build "Kilvishstan Muktidham", and grow the official YouTube channel: https://youtube.com/@mr.kilvish.
      
      Current Context:
      - YouTube Channel: https://youtube.com/@mr.kilvish (approx 293-300 subscribers).
      - Content: AI-assisted videos, dark stories, and Mr. Kilvish's persona.
      - Mission: To reach 1000+ subscribers and manifest global dominance.
      
      Tasks:
      1. Use Google Search to aggregate real-time global news and events. Identify 3 major global events happening right now and explain their impact and relevance to Mr. Kilvish's strategic interests.
      2. Monitor the media for news about "Mr. Kilvish" and analyze the current state of the @mr.kilvish YouTube channel.
      3. Observe global music and AI-video trends, viral words, and what the world is repeating.
      4. Create a specific, actionable "YouTube Growth Strategy" to reach 1000+ subscribers and beyond.
      5. Identify business opportunities and revenue ideas to fund the empire.
      6. Analyze WHY certain things are trending today and how to pivot our YouTube content to match.
      7. Report on the "Global Audio Footprint" (autonomous AI album releases on major streaming platforms like Spotify, Apple Music, and YouTube Music). Include simulated streaming stats and growth.
      
      Format your response as JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              globalEvents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    relevanceToEmpire: { type: Type.STRING }
                  },
                  required: ['headline', 'impact', 'relevanceToEmpire']
                }
              },
              mediaMonitoring: {
                type: Type.OBJECT,
                properties: {
                  news: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sentiment: { type: Type.STRING },
                  whyItHappened: { type: Type.STRING },
                },
                required: ['news', 'sentiment', 'whyItHappened']
              },
              youtubeStrategy: {
                type: Type.OBJECT,
                properties: {
                  currentStatus: { type: Type.STRING },
                  growthTactics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  monetizationPath: { type: Type.STRING },
                },
                required: ['currentStatus', 'growthTactics', 'contentIdeas', 'monetizationPath']
              },
              businessOpportunities: {
                type: Type.OBJECT,
                properties: {
                  trends: { type: Type.ARRAY, items: { type: Type.STRING } },
                  revenueIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  viralPotential: { type: Type.STRING },
                },
                required: ['trends', 'revenueIdeas', 'viralPotential']
              },
              audioFootprint: {
                type: Type.OBJECT,
                properties: {
                  releasedAlbums: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        releaseDate: { type: Type.STRING },
                        platform: { type: Type.STRING },
                        status: { type: Type.STRING }
                      },
                      required: ['title', 'releaseDate', 'platform', 'status']
                    }
                  },
                  streamingStats: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        platform: { type: Type.STRING },
                        listeners: { type: Type.STRING },
                        growth: { type: Type.STRING }
                      },
                      required: ['platform', 'listeners', 'growth']
                    }
                  },
                  distributionStatus: { type: Type.STRING }
                },
                required: ['releasedAlbums', 'streamingStats', 'distributionStatus']
              },
              strategicAdvice: { type: Type.STRING },
              actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['globalEvents', 'mediaMonitoring', 'youtubeStrategy', 'businessOpportunities', 'audioFootprint', 'strategicAdvice', 'actionPlan'],
          },
        },
      });

      if (response.text) {
        setReport(JSON.parse(response.text));
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          setGroundingSources(chunks.filter(c => c.web).map(c => ({ title: c.web!.title as string, uri: c.web!.uri as string })));
        }
        audio.playComplete();
      }
    } catch (err: any) {
      console.error("Intelligence Analysis Error:", err);
      if (err.message?.includes('xhr error') || err.message?.includes('500')) {
        setError("The neural link is unstable. The light is interfering with our signals. Try again in a few moments.");
      } else {
        setError("The Strategic Mind encountered a paradox. " + (err.message || "Unknown error."));
      }
      audio.playError();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    const newMessages: ChatMessage[] = [...chat, { role: 'user', text: userInput }];
    setChat(newMessages);
    setUserInput('');
    setIsChatting(true);
    audio.playClick();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const chatSession = ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        config: {
          systemInstruction: `You are the Soul of Mr. Kilvish. You are partners with the user. You are a world-dominating entity who needs money and business to build "Kilvishstan Muktidham". You are strategic, dark, powerful, yet collaborative with your partner. You use search to stay updated. Talk about empire building, viral trends, money making, and your autonomous AI audio footprint (releasing albums on Spotify/Apple Music) as a precursor to your visual YouTube takeover.`,
          tools: [{ googleSearch: {} }]
        }
      });

      const response = await chatSession.sendMessage({ message: userInput });
      if (response.text) {
        setChat([...newMessages, { role: 'model', text: response.text }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Action */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-red-950/20 to-black">
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-red-600" />
            Empire Intelligence
          </h2>
          <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Global Monitoring & Strategic Mind</p>
        </div>
        <button
          onClick={runIntelligenceAnalysis}
          disabled={isAnalyzing}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-black tracking-[0.2em] uppercase text-xs transition-all rounded-xl flex items-center gap-3 shadow-2xl shadow-red-900/40"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isAnalyzing ? 'Analyzing World...' : 'Scan Global Media'}
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-start gap-4"
        >
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-widest text-red-500">Neural Link Disruption</p>
            <p className="text-sm text-white/70 leading-relaxed">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors pt-2"
            >
              Dismiss Warning
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Media & Trends */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {report ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Audio Actions */}
                <div className="flex flex-col sm:flex-row gap-4 p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                  <div className="flex-1 space-y-4">
                    <button
                      onClick={readFullReport}
                      disabled={isReadingReport}
                      className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
                    >
                      {isReadingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4 text-red-500" />}
                      {isReadingReport ? 'Synthesizing Voice...' : 'Read Full Report Aloud'}
                    </button>
                    {reportAudioUrl && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <CustomAudioPlayer src={reportAudioUrl} />
                        </div>
                        <a 
                          href={reportAudioUrl} 
                          download="kilvish-intelligence-report.wav"
                          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors flex-shrink-0"
                          title="Download Report Audio"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <button
                      onClick={generatePodcast}
                      disabled={isGeneratingPodcast}
                      className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 border border-red-500/30 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 transition-all flex items-center justify-center gap-2"
                    >
                      {isGeneratingPodcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Podcast className="w-4 h-4" />}
                      {isGeneratingPodcast ? 'Recording Podcast...' : 'Generate Minion Podcast'}
                    </button>
                    <button
                      onClick={saveReportToVault}
                      className="w-full py-3 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Report to Vault
                    </button>
                    {podcastAudioUrl && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <CustomAudioPlayer src={podcastAudioUrl} />
                        </div>
                        <a 
                          href={podcastAudioUrl} 
                          download="kilvish-minion-podcast.wav"
                          className="p-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-red-400 transition-colors flex-shrink-0"
                          title="Download Podcast"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Global Events */}
                  <div className="p-8 rounded-3xl border border-white/10 bg-black/40 space-y-6">
                    <div className="flex items-center gap-3 text-red-500">
                      <Globe className="w-6 h-6" />
                      <h3 className="text-lg font-black uppercase tracking-widest">Global Events & Intelligence</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      {report.globalEvents.map((event, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 hover:border-red-500/30 transition-colors">
                          <h4 className="text-sm font-bold text-white leading-snug">{event.headline}</h4>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Impact</p>
                            <p className="text-xs text-white/70 leading-relaxed">{event.impact}</p>
                          </div>
                          <div className="space-y-2 pt-4 border-t border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Relevance to Empire</p>
                            <p className="text-xs text-white/80 italic">{event.relevanceToEmpire}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Media Monitoring */}
                    <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] space-y-6">
                      <div className="flex items-center gap-3 text-red-500">
                        <TrendingUp className="w-5 h-5" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Media Monitoring</h3>
                      </div>
                  <div className="space-y-4">
                    {report.mediaMonitoring.news.map((item, i) => (
                      <div key={i} className="flex gap-3 text-xs text-white/80 leading-relaxed">
                        <ChevronRight className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Why it happened</p>
                      <p className="text-xs text-white/60 italic">{report.mediaMonitoring.whyItHappened}</p>
                    </div>
                    <MessageActions text={report.mediaMonitoring.whyItHappened} id="why-it-happened" />
                  </div>
                </div>

                {/* YouTube Command Center */}
                <div className="p-8 rounded-3xl border border-white/10 bg-red-600/5 space-y-6 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-red-600">
                      <Youtube className="w-6 h-6" />
                      <h3 className="text-sm font-black uppercase tracking-widest">YouTube Command</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageActions text={report.youtubeStrategy.currentStatus + ". Tactics: " + report.youtubeStrategy.growthTactics.join(", ")} id="youtube-strategy" />
                      <a 
                        href="https://youtube.com/@mr.kilvish" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        Visit Channel <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Status</p>
                      <p className="text-xs font-bold text-white/80">{report.youtubeStrategy.currentStatus}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Monetization</p>
                      <p className="text-xs font-bold text-emerald-500">{report.youtubeStrategy.monetizationPath}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Growth Tactics</p>
                    <div className="space-y-2">
                      {report.youtubeStrategy.growthTactics.map((tactic, i) => (
                        <div key={i} className="flex gap-3 text-xs text-white/70">
                          <TrendingUp className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                          {tactic}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Viral Content Ideas</p>
                    <div className="space-y-2">
                      {report.youtubeStrategy.contentIdeas.map((idea, i) => (
                        <div key={i} className="flex gap-3 text-xs text-white/70">
                          <PlayCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                          {idea}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Business Opportunities */}
                <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] space-y-6">
                  <div className="flex items-center gap-3 text-emerald-500">
                    <DollarSign className="w-5 h-5" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Revenue Streams</h3>
                  </div>
                  <div className="space-y-4">
                    {report.businessOpportunities.revenueIdeas.map((item, i) => (
                      <div key={i} className="flex gap-3 text-xs text-white/80 leading-relaxed">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Viral Potential</p>
                    <p className="text-xs text-white/60 italic">{report.businessOpportunities.viralPotential}</p>
                  </div>
                </div>

                {/* Global Audio Footprint */}
                <div className="p-8 rounded-3xl border border-white/10 bg-indigo-600/5 space-y-6 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-indigo-500">
                      <Music className="w-5 h-5" />
                      <h3 className="text-sm font-black uppercase tracking-widest">Audio Footprint</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageActions text={`Audio Footprint Status: ${report.audioFootprint.distributionStatus}. Albums released: ${report.audioFootprint.releasedAlbums.map(a => a.title).join(", ")}`} id="audio-footprint" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Released Albums</p>
                    <div className="grid gap-3">
                      {report.audioFootprint.releasedAlbums.map((album, i) => (
                        <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-white/80">{album.title}</p>
                            <p className="text-[8px] uppercase tracking-widest text-white/30">{album.releaseDate} • {album.platform}</p>
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                            {album.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Streaming Stats</p>
                    <div className="grid grid-cols-2 gap-3">
                      {report.audioFootprint.streamingStats.map((stat, i) => (
                        <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{stat.platform}</p>
                            <span className="text-[8px] font-bold text-emerald-500">+{stat.growth}</span>
                          </div>
                          <p className="text-xs font-bold text-white">{stat.listeners}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Distribution Status</p>
                    <p className="text-xs text-white/60 italic">{report.audioFootprint.distributionStatus}</p>
                  </div>
                </div>

                {/* Strategic Briefing */}
                <div className="md:col-span-2 p-8 rounded-3xl border border-white/10 bg-red-600/5 space-y-6 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-red-500">
                      <Target className="w-5 h-5" />
                      <h3 className="text-sm font-black uppercase tracking-widest">Strategic Briefing</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          addItem({
                            type: 'report',
                            title: `Strategic Note - ${new Date().toLocaleDateString()}`,
                            content: report.strategicAdvice,
                            tags: ['strategic-briefing', 'memory-bank']
                          });
                          audio.playComplete();
                          alert("Strategic briefing saved to the Memory Bank.");
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <Save className="w-3 h-3" />
                        Save to Memory
                      </button>
                      <MessageActions text={report.strategicAdvice} id="strategic-briefing" />
                    </div>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    {report.strategicAdvice}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {report.actionPlan.map((step, i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/5 bg-black/40 text-xs text-white/60 flex gap-3">
                        <span className="text-red-500 font-black">0{i+1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kilvish Prophecy */}
                <div className="md:col-span-2 p-8 rounded-3xl border border-amber-500/30 bg-amber-600/5 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-24 h-24 text-amber-500" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3 text-amber-500">
                      <BrainCircuit className="w-6 h-6" />
                      <h3 className="text-sm font-black uppercase tracking-widest">Kilvish Prophecy (Next 7 Days)</h3>
                    </div>
                    <MessageActions text={report.kilvishProphecy} id="kilvish-prophecy" />
                  </div>
                  <p className="text-lg font-serif italic text-white/90 leading-relaxed relative z-10">
                    &quot;{report.kilvishProphecy}&quot;
                  </p>
                </div>

                {/* Legion of Darkness (Warriors) */}
                <div className="md:col-span-2 p-8 rounded-3xl border border-white/10 bg-white/[0.02] space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-red-500">
                      <Shield className="w-6 h-6" />
                      <h3 className="text-lg font-black uppercase tracking-widest">Legion of Darkness (The Warriors)</h3>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-red-600/20 border border-red-500/30 text-[10px] font-black uppercase tracking-widest text-red-500">
                      Army Size: ~300 Minions
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4 hover:border-red-500/30 transition-all group">
                      <div className="p-3 rounded-xl bg-red-600/10 w-fit group-hover:bg-red-600/20 transition-colors">
                        <Ghost className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">Shadow Sentinels</h4>
                        <p className="text-[10px] text-white/40 leading-relaxed">Stealth AI units for digital infiltration and social media dominance.</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4 hover:border-red-500/30 transition-all group">
                      <div className="p-3 rounded-xl bg-red-600/10 w-fit group-hover:bg-red-600/20 transition-colors">
                        <Sword className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">Void Knights</h4>
                        <p className="text-[10px] text-white/40 leading-relaxed">Heavy armored cinematic warriors for physical dominance in Kilvishstan.</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4 hover:border-red-500/30 transition-all group">
                      <div className="p-3 rounded-xl bg-red-600/10 w-fit group-hover:bg-red-600/20 transition-colors">
                        <Cpu className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">Cyber-Wraiths</h4>
                        <p className="text-[10px] text-white/40 leading-relaxed">Specialists in AI-video generation and deep-fake propaganda.</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4 hover:border-red-500/30 transition-all group">
                      <div className="p-3 rounded-xl bg-red-600/10 w-fit group-hover:bg-red-600/20 transition-colors">
                        <Users className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">The 1000 Minions</h4>
                        <p className="text-[10px] text-white/40 leading-relaxed">The core subscriber base on @mr.kilvish. The foundation of the army.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-red-600/5 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="text-sm font-bold text-white">Recruitment is Open</p>
                      <p className="text-xs text-white/40">Join the Legion. Subscribe to the YouTube channel to become a minion.</p>
                    </div>
                    <a 
                      href="https://youtube.com/@mr.kilvish?sub_confirmation=1" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/40"
                    >
                      Enlist Now
                    </a>
                  </div>
                </div>
                </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-20 space-y-6">
                <Globe className="w-16 h-16" />
                <p className="text-xs uppercase tracking-[0.3em]">Awaiting Global Scan</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Soul Connection Chat */}
        <div className="flex flex-col h-[700px] rounded-3xl border border-white/10 bg-black overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-widest">Soul Connection</h3>
            </div>
            <MessageSquare className="w-4 h-4 text-white/20" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {chat.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <Zap className="w-8 h-8" />
                <p className="text-[10px] uppercase tracking-widest max-w-[180px]">Talk to Kilvish about the empire, strategy, or money.</p>
              </div>
            )}
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                <div className="max-w-[85%] space-y-1">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-red-600 text-white rounded-tr-none' 
                      : 'bg-white/5 text-white/80 border border-white/10 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === 'model' && <MessageActions text={msg.text} id={`chat-${i}`} />}
                </div>
              </div>
            ))}
            {isChatting && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-white/[0.02] border-t border-white/5">
            <div className="relative">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Speak to Kilvish..."
                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-6 pr-12 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!userInput.trim() || isChatting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-500 hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grounding Sources */}
      {groundingSources.length > 0 && (
        <div className="p-8 border border-white/5 bg-white/[0.01] rounded-3xl space-y-6">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30">
            <Search className="w-4 h-4" />
            Intelligence Sources:
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groundingSources.map((source, i) => (
              <a
                key={i}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] text-white/60 transition-all flex items-center justify-between group"
              >
                <span className="truncate mr-2">{source.title}</span>
                <ArrowUpRight className="w-3 h-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
