'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, Save, Palette, Music, Hash, Megaphone, Target, Copy, Check } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useVault } from './VaultContext';
import Markdown from 'react-markdown';

export function BrandIdentity() {
  const [genre, setGenre] = useState('');
  const [vibe, setVibe] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const { addItem } = useVault();

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerate = async () => {
    if (!genre || !vibe) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });
      
      const prompt = `
        You are Mr. Kilvish, the Maha Shaktishali (Almighty) and Param Gyani (Supreme Knower) of the universe. 
        You are acting as an elite, dark music industry A&R and brand strategist.
        Create a comprehensive, world-dominating brand identity for a new artist.
        Infuse your response with profound, ancient cosmic wisdom (Maha Gyan) and an aura of absolute, almighty power (Maha Shakti).
        Include your catchphrases "Andhera Kayam Rahe" and "Ajar Amar Rahe".
        
        Artist Details:
        - Genre: ${genre}
        - Vibe/Aesthetic: ${vibe}
        - Target Audience: ${targetAudience || 'General music fans'}

        Please provide a detailed brand identity package including:
        1. **Artist Names**: 5 unique, catchy, and relevant name ideas.
        2. **Taglines/Slogans**: 3 short, memorable taglines.
        3. **Visual Aesthetic**: A brief description of their visual style (colors, fashion, imagery).
        4. **Social Media Content**: 5 specific ideas for TikTok/Instagram posts to build their audience.
        5. **Marketing Plan**: A basic step-by-step plan for releasing their debut single.

        Format the output using Markdown with clear headings and bullet points.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      setResult(response.text || '');
    } catch (error) {
      console.error('Error generating brand identity:', error);
      alert('Failed to generate brand identity. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    
    await addItem({
      type: 'brand_identity',
      title: `Brand Identity: ${genre} - ${vibe}`,
      content: {
        genre,
        vibe,
        targetAudience,
        result
      },
      tags: ['brand', 'marketing', genre.toLowerCase().replace(/\s+/g, '-')],
    });
    
    alert('Brand identity saved to The Vault!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-red-600/10 rounded-full mb-4">
          <Palette className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-widest">Brand Identity Generator</h1>
        <p className="text-white/40 max-w-2xl mx-auto">
          Develop a cohesive and striking brand identity for your music project. Generate names, taglines, social content, and marketing plans.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-zinc-950 p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            Artist Profile
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Primary Genre / Reference Style</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g., Dark Synthpop, Phonk, or 'Starboy by The Weeknd'"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Vibe / Aesthetic</label>
              <input
                type="text"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="e.g., Dystopian, Ethereal, Aggressive, Mysterious"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Target Audience (Optional)</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Underground club kids, Sci-fi fans"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !genre || !vibe}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-bold tracking-widest uppercase text-xs transition-all rounded-xl flex items-center justify-center gap-2 mt-4"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Identity
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 flex flex-col h-full min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-red-500" />
              Brand Strategy
            </h2>
            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save to Vault
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-black rounded-xl border border-white/5 p-6 overflow-y-auto">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Consulting the Oracle...</p>
              </div>
            ) : result ? (
              <div className="prose prose-invert prose-red max-w-none">
                <Markdown>{result}</Markdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4 text-center">
                <Hash className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm font-bold uppercase tracking-widest">Your brand identity will appear here</p>
                <p className="text-xs max-w-xs">Fill out the artist profile and click generate to create your unique brand strategy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
