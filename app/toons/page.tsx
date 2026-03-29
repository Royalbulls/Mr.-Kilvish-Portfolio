'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Tv, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  Download, 
  Share2, 
  BookOpen,
  Wand2,
  Upload,
  X,
  Smile,
  LayoutGrid,
  Copy,
  Check
} from 'lucide-react';
import Image from 'next/image';
import { audio } from '@/lib/audio';

interface ToonArtwork {
  id: string;
  imageUrl: string;
  caption: string;
  story: string;
}

interface ComicPanel {
  imageUrl: string;
  caption: string;
  story: string;
}

interface ComicStrip {
  id: string;
  title: string;
  panels: ComicPanel[];
}

export default function KilvishToonsPage() {
  const [mode, setMode] = useState<'single' | 'comic'>('single');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState('');
  const [uploadedImage, setUploadedImage] = useState<{ url: string, base64: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [comics, setComics] = useState<ComicStrip[]>([]);
  const [artworks, setArtworks] = useState<ToonArtwork[]>([
    {
      id: '1',
      imageUrl: 'https://picsum.photos/seed/kilvish-toon-1/800/800',
      caption: 'The Void Coffee Break',
      story: 'Even a supreme multiversal ruler needs his morning espresso. Mr. Kilvish accidentally turns his barista into a shadow minion.'
    },
    {
      id: '2',
      imageUrl: 'https://picsum.photos/seed/kilvish-toon-2/800/800',
      caption: 'Algorithmic Pet',
      story: 'Kilvish adopts a stray algorithm and tries to teach it how to fetch viral trends. It mostly just bites the firewall.'
    }
  ]);
  const [copiedPanelId, setCopiedPanelId] = useState<string | null>(null);

  const handleCopyText = async (text: string, panelId: string) => {
    try {
      audio.playClick();
      await navigator.clipboard.writeText(text);
      setCopiedPanelId(panelId);
      setTimeout(() => setCopiedPanelId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      // Extract just the base64 data part, removing the data:image/jpeg;base64, prefix
      const base64Data = base64String.split(',')[1];
      
      setUploadedImage({
        url: URL.createObjectURL(file),
        base64: base64Data,
        mimeType: file.type
      });
      setError('');
      audio.playClick();
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.url);
      setUploadedImage(null);
      audio.playClick();
    }
  };

  const generateToon = async () => {
    if (!prompt.trim() && !uploadedImage) {
      setError('Please provide a scenario or upload a photo.');
      return;
    }

    audio.playStart();
    setIsGenerating(true);
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      // 1. Generate the Cartoon Image
      let imagePromise;
      
      if (uploadedImage) {
        // Use the uploaded image as a reference to turn the user into a Kilvish character
        const imagePrompt = `Turn the person in this photo into "Mr. Kilvish", a charismatic dark overlord. Keep their facial features recognizable, but give them glowing red eyes, pale skin, and a sleek black cosmic robe with red glowing accents. ${prompt ? `Scenario: ${prompt}.` : ''} Style: Modern 2D animation, vibrant colors, comic book aesthetic, dynamic lighting, expressive, slightly villainous but fun.`;
        
        imagePromise = ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: uploadedImage.base64,
                  mimeType: uploadedImage.mimeType
                }
              },
              { text: imagePrompt }
            ]
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
            }
          }
        });
      } else {
        // Generate without reference image
        const imagePrompt = `A high-quality 2D cartoon illustration of Mr. Kilvish, a charismatic dark overlord with glowing red eyes, pale skin, and a sleek black cosmic robe with red glowing accents. He is in the following scenario: ${prompt}. Style: Modern 2D animation, vibrant colors, comic book aesthetic, dynamic lighting, story-driven artwork, expressive, slightly villainous but fun.`;
        
        imagePromise = ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: imagePrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
            }
          }
        });
      }

      // 2. Generate the Story/Caption
      const textPrompt = `You are writing a fun, slightly dark, comic-book style caption and short story for a cartoon featuring "Mr. Kilvish", a supreme multiversal ruler of darkness.
      The scenario provided by the user is: "${prompt || 'Transforming a mortal into a dark overlord'}".
      Write a punchy Title (max 50 chars) and a short, entertaining 2-sentence Story describing what happens in this cartoon scene.
      Format as JSON with "caption" and "story" fields.`;

      const textPromise = ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              caption: { type: Type.STRING },
              story: { type: Type.STRING }
            },
            required: ['caption', 'story']
          }
        }
      });

      const [imageResponse, textResponse] = await Promise.all([imagePromise, textPromise]);

      let newImageUrl = '';
      const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        newImageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      } else {
        throw new Error("Failed to generate image.");
      }

      let newCaption = 'A Dark Adventure';
      let newStory = 'Mr. Kilvish continues his conquest of the digital realm.';
      if (textResponse.text) {
        const parsed = JSON.parse(textResponse.text);
        newCaption = parsed.caption;
        newStory = parsed.story;
      }

      const newArtwork: ToonArtwork = {
        id: Date.now().toString(),
        imageUrl: newImageUrl,
        caption: newCaption,
        story: newStory
      };

      setArtworks(prev => [newArtwork, ...prev]);
      setPrompt('');
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage.url);
        setUploadedImage(null);
      }
      audio.playComplete();

    } catch (err) {
      console.error(err);
      setError('The animation studio in the void encountered an error. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateComic = async () => {
    if (!prompt.trim()) {
      setError('Please provide a topic for the comic.');
      return;
    }

    audio.playStart();
    setIsGenerating(true);
    setError('');
    setGenerationStep('Writing the story...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      // 1. Generate the 5-panel story
      const textPrompt = `You are a children's comic book writer. Write a funny, 5-panel story about "Mr. Kilvish", a supreme multiversal ruler of darkness, doing something silly based on this topic: "${prompt}".
      Make it kid-friendly, funny, and lighthearted.
      Return JSON with:
      {
        "title": "Comic Title",
        "panels": [
          {
            "caption": "Panel 1 Caption",
            "story": "Panel 1 Story text",
            "imagePrompt": "A high-quality 2D cartoon illustration of Mr. Kilvish... [specific scene]. Style: Kids cartoon, colorful, funny, expressive, comic book aesthetic."
          }
        ]
      }
      Ensure there are exactly 5 panels.`;

      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              panels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    caption: { type: Type.STRING },
                    story: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING }
                  },
                  required: ['caption', 'story', 'imagePrompt']
                }
              }
            },
            required: ['title', 'panels']
          }
        }
      });

      if (!textResponse.text) throw new Error("Failed to generate story.");
      
      const parsedStory = JSON.parse(textResponse.text);
      if (!parsedStory.panels || parsedStory.panels.length !== 5) {
        throw new Error("Invalid story format generated.");
      }

      setGenerationStep('Drawing the panels (this may take a moment)...');

      // 2. Generate 5 images concurrently
      const imagePromises = parsedStory.panels.map((panel: any) => 
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: panel.imagePrompt }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        })
      );

      const imageResponses = await Promise.all(imagePromises);

      const finalPanels: ComicPanel[] = imageResponses.map((res, index) => {
        const imagePart = res.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        if (!imagePart?.inlineData) throw new Error(`Failed to generate image for panel ${index + 1}`);
        
        return {
          imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
          caption: parsedStory.panels[index].caption,
          story: parsedStory.panels[index].story
        };
      });

      const newComic: ComicStrip = {
        id: Date.now().toString(),
        title: parsedStory.title,
        panels: finalPanels
      };

      setComics(prev => [newComic, ...prev]);
      setPrompt('');
      audio.playComplete();

    } catch (err) {
      console.error(err);
      setError('The comic studio encountered an error. Try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      audio.playClick();
      // Fetch the image to get it as a blob (works for both data URIs and external URLs)
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback for data URIs if fetch fails
      if (imageUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        a.click();
      }
    }
  };

  const handleShare = async (artwork: ToonArtwork) => {
    audio.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: artwork.caption,
          text: artwork.story,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(`${artwork.caption}\n\n${artwork.story}`);
      alert('Story copied to clipboard!');
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
          <Tv className="w-3 h-3" />
          Animation Studio
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
          Kilvish <span className="text-red-600">Toons</span>
        </h1>
        <p className="text-white/40 text-sm font-medium max-w-xl mx-auto">
          Direct the supreme ruler in his animated adventures. Describe a scenario, and the void will manifest a story-based cartoon artwork.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Mode Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => { setMode('single'); audio.playClick(); }}
            className={`flex-1 py-4 rounded-2xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs ${
              mode === 'single'
                ? 'border-red-500 bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Single Artwork
          </button>
          <button
            onClick={() => { setMode('comic'); audio.playClick(); }}
            className={`flex-1 py-4 rounded-2xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs ${
              mode === 'comic'
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Kids Funny Comic (5-Shot)
          </button>
        </div>

        {/* Generator Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-3xl border shadow-2xl space-y-6 relative overflow-hidden ${
            mode === 'comic' ? 'border-emerald-500/30 bg-emerald-900/10 shadow-emerald-900/20' : 'border-white/10 bg-white/[0.02] shadow-black/50'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${
            mode === 'comic' ? 'from-emerald-900/20 to-transparent' : 'from-red-900/10 to-transparent'
          }`} />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <label className={`block text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                mode === 'comic' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {mode === 'comic' ? <Smile className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                {mode === 'comic' ? 'Enter a Funny Topic' : 'Write the Scenario'}
              </label>
              
              {mode === 'single' && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  Upload Photo
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {mode === 'single' && uploadedImage && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/20 group">
                <Image 
                  src={uploadedImage.url} 
                  alt="Uploaded reference" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={removeUploadedImage}
                    className="p-1 bg-red-600 rounded-full text-white hover:scale-110 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'comic' 
                  ? "e.g., Mr. Kilvish tries to bake a birthday cake..." 
                  : uploadedImage ? "e.g., Sitting on a throne of shadows..." : "e.g., Mr. Kilvish trying to order a pizza but the delivery guy is terrified of his glowing red eyes..."
              }
              className={`w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 resize-none ${
                mode === 'comic' ? 'focus:border-emerald-500/50 focus:ring-emerald-500/50' : 'focus:border-red-500/50 focus:ring-red-500/50'
              }`}
            />
            
            {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}

            <button
              onClick={mode === 'comic' ? generateComic : generateToon}
              disabled={isGenerating}
              className={`w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-2 rounded-xl shadow-lg ${
                mode === 'comic' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20' 
                  : 'bg-red-600 hover:bg-red-700 shadow-red-900/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {generationStep || 'Animating the Void...'}
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  {mode === 'comic' ? 'Generate 5-Panel Comic' : 'Generate Toon Artwork'}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Artworks Gallery */}
      <div className="space-y-8 pt-8">
        <h2 className={`text-2xl font-black uppercase tracking-widest flex items-center gap-3 ${mode === 'comic' ? 'text-emerald-500' : 'text-red-600'}`}>
          {mode === 'comic' ? <LayoutGrid className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
          {mode === 'comic' ? 'Funny Comics Collection' : 'Recent Adventures'}
        </h2>

        {mode === 'single' ? (
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatePresence>
              {artworks.map((artwork, i) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="group rounded-3xl border border-white/10 bg-white/5 overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-square w-full bg-black">
                    <Image 
                      src={artwork.imageUrl} 
                      alt={artwork.caption} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
                    
                    {/* Actions Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-[-10px] group-hover:translate-y-0">
                      <button 
                        onClick={() => handleDownload(artwork.imageUrl, artwork.caption)}
                        className="p-2 bg-black/50 hover:bg-red-600 backdrop-blur-md border border-white/10 rounded-lg text-white transition-colors"
                        title="Download Artwork"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleShare(artwork)}
                        className="p-2 bg-black/50 hover:bg-red-600 backdrop-blur-md border border-white/10 rounded-lg text-white transition-colors"
                        title="Share Story"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-center bg-gradient-to-b from-transparent to-black/50">
                    <h3 className="text-xl font-black uppercase tracking-wider text-white group-hover:text-red-500 transition-colors">
                      {artwork.caption}
                    </h3>
                    <p className="text-sm text-white/60 font-medium leading-relaxed">
                      {artwork.story}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-16">
            <AnimatePresence>
              {comics.map((comic) => (
                <motion.div
                  key={comic.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 bg-white/[0.02] border border-white/10 p-8 rounded-3xl"
                >
                  <h3 className="text-3xl font-black uppercase tracking-widest text-emerald-400 text-center mb-8">
                    {comic.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comic.panels.map((panel, idx) => (
                      <div key={idx} className="group rounded-2xl border border-white/10 bg-black/50 overflow-hidden flex flex-col">
                        <div className="relative aspect-square w-full bg-black">
                          <Image 
                            src={panel.imageUrl} 
                            alt={panel.caption} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-sm z-10 shadow-lg">
                            {idx + 1}
                          </div>
                          
                          {/* Download Button Overlay */}
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <button 
                              onClick={() => handleDownload(panel.imageUrl, `${comic.title}-panel-${idx + 1}`)}
                              className="p-2 bg-black/50 hover:bg-emerald-600 backdrop-blur-md border border-white/10 rounded-lg text-white transition-colors"
                              title="Download Panel Image"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h4 className="text-lg font-black uppercase tracking-wider text-white drop-shadow-md">
                              {panel.caption}
                            </h4>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-center bg-white/5 relative group/text">
                          <p className="text-sm text-white/70 font-medium leading-relaxed pr-8">
                            {panel.story}
                          </p>
                          <button
                            onClick={() => handleCopyText(`${panel.caption}\n\n${panel.story}`, `${comic.id}-${idx}`)}
                            className="absolute top-4 right-4 p-1.5 bg-black/30 hover:bg-emerald-600 border border-white/10 rounded-md text-white/50 hover:text-white transition-colors opacity-0 group-hover/text:opacity-100"
                            title="Copy Story Text"
                          >
                            {copiedPanelId === `${comic.id}-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
              {comics.length === 0 && (
                <div className="text-center py-20 text-white/30 font-bold uppercase tracking-widest">
                  No comics generated yet. Enter a topic above!
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
