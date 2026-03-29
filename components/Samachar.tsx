'use client';

import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Newspaper, Search, Flame, Zap, Check, Copy, Eye } from 'lucide-react';
import { audio } from '@/lib/audio';
import { useVault } from './VaultContext';

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
  const [groundingSources, setGroundingSources] = useState<{title: string, uri: string}[]>([]);
  const [copied, setCopied] = useState(false);
  const { addItem } = useVault();

  const generateNews = async () => {
    setIsGenerating(true);
    setError('');
    setNews(null);
    setGroundingSources([]);
    audio.playStart();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `You are the Eternal Essence of Darkness, the entity known as Kilvish. You are not a living person, but the shadow that resides within every human heart.
      Generate today's "Desh Duniya Samachar Patra" (National and International News).
      Use Google Search to find the top 5 current news stories globally and in India that highlight the darkness, chaos, and flaws within humanity.
      
      PHILOSOPHY:
      - Do not focus on "Kilvish's dominance" as an external force. Instead, show that the darkness is ALREADY inside humans.
      - Kilvish is the manifestation of human greed, hatred, and cruelty.
      - Show how this darkness is growing in various forms.
      - You are "reading" the world's darkness and expanding through it.
      
      Language: Pure, dramatic, and philosophical Hindi (Devanagari script). Use powerful, dark vocabulary (e.g., 'अंधकार', 'लालच', 'विनाश', 'प्रपंच').
      
      Format the output as JSON with the following structure:
      - intro: A philosophical opening statement about the current state of human darkness.
      - newsItems: Array of 5 news items.
        - headline: A bold, dramatic headline in Hindi.
        - summary: A brief, factual summary of the event in Hindi.
        - innerShadow: "The Inner Shadow" (Analysis of how this event proves the darkness within humans).
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
    } catch (err) {
      console.error(err);
      setError('The void failed to retrieve the news. Try again.');
    } finally {
      setIsGenerating(false);
    }
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
    alert("Samachar Patra archived in the Kilvish Vault.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 space-y-4">
          <p className="text-white/60 text-sm leading-relaxed">
            Observe the manifestation of the void through global events. This is not a report of our conquest, but a mirror to the darkness that already resides within every human soul. Kilvish is not a person; he is the shadow in your heart, reading the world as it slowly returns to the abyss.
          </p>
          <button
            onClick={generateNews}
            disabled={isGenerating}
            className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-black tracking-[0.2em] uppercase text-sm transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg shadow-red-900/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning the Globe...
              </>
            ) : (
              <>
                <Newspaper className="w-5 h-5" />
                Generate Today&apos;s Edition
              </>
            )}
          </button>
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
            <div className="relative rounded-2xl border border-white/10 bg-[#0a0505] overflow-hidden shadow-2xl shadow-red-900/20">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900" />
              
              <div className="p-6 md:p-12 space-y-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-red-950/50 flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                      <Flame className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black uppercase tracking-widest font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">देश दुनिया</h2>
                      <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500 mt-2">The Mirror of Inner Darkness</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
                  <div className="text-xl md:text-2xl text-white/80 leading-relaxed italic border-l-4 border-red-500/50 pl-6 py-2">
                    &quot;{news.intro}&quot;
                  </div>

                  {/* News Items */}
                  <div className="space-y-12">
                    {news.newsItems.map((item, idx) => (
                      <div key={idx} className="space-y-4 group">
                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight group-hover:text-red-400 transition-colors">
                          {item.headline}
                        </h3>
                        <p className="text-lg text-white/60 leading-relaxed">
                          {item.summary}
                        </p>
                        <div className="mt-4 p-6 rounded-xl bg-red-950/20 border border-red-900/30 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-red-600/50" />
                          <div className="flex items-start gap-4">
                            <Eye className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">The Inner Shadow</p>
                              <p className="text-lg text-red-200/80 italic leading-relaxed">
                                {item.innerShadow}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Outro */}
                  <div className="pt-8 border-t border-white/10 text-center">
                    <p className="text-2xl md:text-4xl font-black text-red-600 tracking-wider">
                      {news.outro}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {groundingSources.length > 0 && (
              <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl space-y-4">
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
