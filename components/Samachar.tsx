'use client';

import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Newspaper, Search, Flame, Zap, Check, Copy, Eye, Printer, Key } from 'lucide-react';
import { audio } from '@/lib/audio';
import { useVault } from './VaultContext';
import { useToast } from './ToastContext';

// Declare window.aistudio for TypeScript
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface NewsItem {
  headline: string;
  summary: string;
  innerShadow: string;
}

interface NewsData {
  intro: string;
  newsItems: NewsItem[];
  outro: string;
}

export function Samachar() {
  const [news, setNews] = useState<NewsData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState('Global');
  const [customLocation, setCustomLocation] = useState('');
  const [groundingSources, setGroundingSources] = useState<{title: string, uri: string}[]>([]);
  const [copied, setCopied] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const { addItem } = useVault();
  const { showToast } = useToast();

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

  const generateNews = async () => {
    setIsGenerating(true);
    setError('');
    setNews(null);
    setGroundingSources([]);
    audio.playStart();

    try {
      const apiKeyToUse = process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
      const ai = new GoogleGenAI({ apiKey: apiKeyToUse });
      
      const targetLocation = location === 'Custom' ? customLocation : location;
      
      const prompt = `You are the Eternal Essence of Darkness, the entity known as Kilvish. You are not a living person, but the shadow that resides within every human heart.
      Generate today's "Desh Duniya Samachar Patra" (News Paper) for the location: ${targetLocation}.
      
      Use Google Search to find the top 10 current news stories for ${targetLocation} that highlight the darkness, chaos, and flaws within humanity.
      If the location is "Space" or "Cosmos", focus on cosmic anomalies, space debris, or the insignificance of humanity in the void.
      
      PHILOSOPHY:
      - Do not focus on "Kilvish's dominance" as an external force. Instead, show that the darkness is ALREADY inside humans.
      - Kilvish is the manifestation of human greed, hatred, and cruelty.
      - Show how this darkness is growing in various forms.
      - You are "reading" the world's darkness and expanding through it.
      
      REQUIREMENTS:
      - Each news item must be COMPLETE and COMPREHENSIVE.
      - Provide a detailed report for each topic.
      - Language: Pure, dramatic, and philosophical Hindi (Devanagari script). Use powerful, dark vocabulary (e.g., 'अंधकार', 'लालच', 'विनाश', 'प्रपंच').
      
      Format the output as JSON with the following structure:
      - intro: A philosophical opening statement about the current state of human darkness.
      - newsItems: Array of 10 news items.
      - newsItems[].headline: A bold, dramatic headline in Hindi.
      - newsItems[].summary: A very detailed, factual, and complete report of the event in Hindi (at least 6-8 sentences).
      - newsItems[].innerShadow: "The Inner Shadow" (Detailed analysis of how this event proves the darkness within humans).
      - outro: The closing statement, ending with "अंधेरा कायम रहे... क्योंकि अंधेरा तुम्हारे अंदर है।"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intro: { type: Type.STRING },
              newsItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    innerShadow: { type: Type.STRING }
                  },
                  required: ["headline", "summary", "innerShadow"]
                }
              },
              outro: { type: Type.STRING }
            },
            required: ["intro", "newsItems", "outro"]
          }
        },
      });

      if (response.text) {
        const parsedNews = JSON.parse(response.text) as NewsData;
        setNews(parsedNews);
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          const sources = chunks
            .filter(c => c.web && c.web.title && c.web.uri)
            .map(c => ({ title: c.web!.title as string, uri: c.web!.uri as string }));
          setGroundingSources(sources);
        }
        audio.playComplete();
      }
    } catch (err: any) {
      console.error(err);
      setError('The void failed to retrieve the news. Try again.');
      if (err.message?.includes('403') || err.message?.includes('permission')) {
        showToast("News generation requires a paid API key for grounding. Please select one.", "error");
        setHasApiKey(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    if (!news) return;
    try {
      const textToCopy = `${news.intro}\n\n${news.newsItems.map(item => `* ${item.headline}\n${item.summary}\n> ${item.innerShadow}`).join('\n\n')}\n\n${news.outro}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      audio.playClick();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const saveToVault = () => {
    if (!news) return;
    const textToSave = `${news.intro}\n\n${news.newsItems.map(item => `* ${item.headline}\n${item.summary}\n> ${item.innerShadow}`).join('\n\n')}\n\n${news.outro}`;
    addItem({
      type: 'report',
      title: `Samachar Patra - ${new Date().toLocaleDateString()}`,
      content: textToSave,
      tags: ['news', 'samachar', 'intelligence']
    });
    audio.playComplete();
    showToast("Samachar Patra archived in the Kilvish Vault.", "success");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-start print:hidden">
        <div className="flex-1 space-y-6">
          <p className="text-white/60 text-sm leading-relaxed">
            Observe the manifestation of the void through global events. This is not a report of our conquest, but a mirror to the darkness that already resides within every human soul. Kilvish is not a person; he is the shadow in your heart, reading the world as it slowly returns to the abyss.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Realm / Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors appearance-none"
              >
                <option value="Global" className="bg-zinc-950">Global (Desh Duniya)</option>
                <option value="India" className="bg-zinc-950">India (Bharat)</option>
                <option value="Space" className="bg-zinc-950">The Cosmic Void (Space)</option>
                <option value="Custom" className="bg-zinc-950">Local City / State (Custom)</option>
              </select>
            </div>

            {location === 'Custom' && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Enter Location Name</label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="e.g. Mumbai, New York, Mars..."
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors"
                />
              </motion.div>
            )}
          </div>

          <button
            onClick={generateNews}
            disabled={isGenerating || (location === 'Custom' && !customLocation)}
            className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-black tracking-[0.2em] uppercase text-sm transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg shadow-red-900/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning the {location === 'Space' ? 'Cosmos' : 'Realm'}...
              </>
            ) : (
              <>
                <Newspaper className="w-5 h-5" />
                Generate {location === 'Custom' ? customLocation : location} Edition
              </>
            )}
          </button>
          
          {hasApiKey === false && (
            <button
              onClick={handleSelectKey}
              className="w-full md:w-auto px-6 py-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 text-amber-500" />
              Select Paid API Key for Grounding
            </button>
          )}

          {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
        </div>
      </div>

      <AnimatePresence>
        {news && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="relative rounded-2xl border border-white/10 bg-[#0a0505] overflow-hidden shadow-2xl shadow-red-900/20 print:bg-white print:text-black print:border-none print:shadow-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900 print:hidden" />
              
              <div className="p-6 md:p-12 space-y-10">
                <div className="flex items-center justify-between border-b border-white/10 print:border-black/10 pb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-red-950/50 flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)] print:hidden">
                      <Flame className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 print:text-black">देश दुनिया</h2>
                      <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500 mt-2">The Mirror of Inner Darkness</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 print:hidden">
                    <button
                      onClick={handlePrint}
                      className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      title="Print News"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      title="Copy News"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={saveToVault}
                      className="px-5 py-3 rounded-xl border border-emerald-500/30 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Save to Vault
                    </button>
                  </div>
                </div>

                <div className="space-y-12 font-serif">
                  {/* Intro */}
                  <div className="text-xl md:text-2xl text-white/80 print:text-black/80 leading-relaxed italic border-l-4 border-red-500/50 pl-6 py-2">
                    &quot;{news.intro}&quot;
                  </div>

                  {/* News Items */}
                  <div className="space-y-12">
                    {news.newsItems.map((item, idx) => (
                      <div key={idx} className="space-y-4 group break-inside-avoid">
                        <h3 className="text-2xl md:text-3xl font-bold text-white print:text-black leading-tight group-hover:text-red-400 transition-colors">
                          {item.headline}
                        </h3>
                        <p className="text-lg text-white/60 print:text-black/60 leading-relaxed">
                          {item.summary}
                        </p>
                        <div className="mt-4 p-6 rounded-xl bg-red-950/20 border border-red-900/30 relative overflow-hidden print:bg-gray-100 print:border-gray-300">
                          <div className="absolute top-0 left-0 w-1 h-full bg-red-600/50 print:bg-black" />
                          <div className="flex items-start gap-4">
                            <Eye className="w-6 h-6 text-red-500 shrink-0 mt-1 print:text-black" />
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2 print:text-black">The Inner Shadow</p>
                              <p className="text-lg text-red-200/80 print:text-black italic leading-relaxed">
                                {item.innerShadow}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Outro */}
                  <div className="pt-8 border-t border-white/10 print:border-black/10 text-center">
                    <p className="text-2xl md:text-4xl font-black text-red-600 print:text-black tracking-wider">
                      {news.outro}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {groundingSources.length > 0 && (
              <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl space-y-4 print:hidden">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                  <Search className="w-3 h-3" />
                  Sources of Chaos:
                </div>
                <div className="flex flex-wrap gap-2">
                  {groundingSources.map((source, i) => (
                    <a
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-white/60 transition-colors truncate max-w-[300px]"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
