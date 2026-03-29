'use client';

import { useState, useEffect } from 'react';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { 
  Loader2, 
  Music, 
  Sparkles, 
  Zap, 
  Globe, 
  PenTool, 
  Volume2, 
  Image as ImageIcon,
  ChevronRight,
  History,
  Search,
  Copy,
  Check,
  Upload,
  X,
  Download,
  Save,
  Edit3,
  BookOpen,
  Shield,
  Radio,
  Clock,
  Skull,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audio, pcmToWav } from '@/lib/audio';
import Image from 'next/image';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { useVault } from './VaultContext';

interface GeneratedSong {
  songTitle: string;
  songStyle: string;
  songLyrics: string;
  inspiration?: string;
}

export function KilvishMode() {
  const [mode, setMode] = useState<'autonomous' | 'collaborative' | 'party' | 'feedback' | 'shaktimaan' | 'prophetic' | 'nature'>('autonomous');
  const [language, setLanguage] = useState<'hindi' | 'english' | 'sanskrit' | 'mix'>('mix');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('night');
  const [kilvishMood, setKilvishMood] = useState<'spreading' | 'anarchy' | 'prophetic' | 'judgment'>('prophetic');
  const [userInput, setUserInput] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [keywords, setKeywords] = useState('');
  const [song, setSong] = useState<GeneratedSong | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<string | null>(null);
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [musicClipUrl, setMusicClipUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [isGeneratingMusicClip, setIsGeneratingMusicClip] = useState(false);
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);
  const [isEditingLyrics, setIsEditingLyrics] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedScenes, setGeneratedScenes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [groundingSources, setGroundingSources] = useState<{title: string, uri: string}[]>([]);
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showManifesto, setShowManifesto] = useState(false);
  const { addItem } = useVault();

  const generateMusicClip = async () => {
    if (!song) return;
    setIsGeneratingMusicClip(true);
    setMusicClipUrl(null);
    audio.playStart();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const lyricsExcerpt = song.songLyrics.substring(0, 400);
      const prompt = `Speak these lyrics in a deep, commanding, dark, and powerful voice: ${lyricsExcerpt}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: prompt }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }
            }
          }
        }
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (audioPart?.data) {
        const wavUrl = pcmToWav(audioPart.data);
        setMusicClipUrl(wavUrl);
        audio.playAmbientDrone();
        audio.playComplete();
      }
    } catch (err) {
      console.error("Failed to generate music clip:", err);
    } finally {
      setIsGeneratingMusicClip(false);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        audio.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const generateScene = async () => {
    if (!song) return;
    setIsGeneratingScene(true);
    audio.playStart();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `Create a high-quality, cinematic, dark fantasy scene based on these lyrics: "${song.songLyrics.substring(0, 500)}". 
      The scene should feature Mr. Kilvish as a powerful, dark entity. 
      Aesthetic: Red, Black, Shadows, Fire, Cosmic Void. 
      Style: Hyper-realistic, 8k, detailed textures. 
      ${uploadedImage ? "Use the provided image as a reference for Mr. Kilvish's appearance." : ""}`;

      const contents: any = {
        parts: [{ text: prompt }]
      };

      if (uploadedImage) {
        const base64Data = uploadedImage.split(',')[1];
        const mimeType = uploadedImage.split(';')[0].split(':')[1];
        contents.parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        const newScene = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        setGeneratedScenes(prev => [newScene, ...prev]);
        audio.playComplete();
      }
    } catch (err) {
      console.error("Failed to generate scene:", err);
    } finally {
      setIsGeneratingScene(false);
    }
  };

  const saveSongToVault = () => {
    if (!song) return;
    const name = prompt("Enter a name for this track:", song.songTitle);
    if (!name) return; // Cancelled
    
    addItem({
      type: 'song',
      title: name,
      content: {
        lyrics: isEditingLyrics ? editedLyrics : song.songLyrics,
        style: song.songStyle,
        inspiration: song.inspiration,
        coverArt: coverArt,
        audioUrl: audioUrl,
        musicClipUrl: musicClipUrl
      },
      tags: ['kilvish-mode', song.songStyle]
    });
    audio.playComplete();
    alert("Song archived in the Kilvish Vault.");
  };

  const handleStartEditLyrics = () => {
    if (!song) return;
    setEditedLyrics(song.songLyrics);
    setIsEditingLyrics(true);
    audio.playClick();
  };

  const handleSaveEditedLyrics = () => {
    if (!song) return;
    setSong({ ...song, songLyrics: editedLyrics });
    setIsEditingLyrics(false);
    audio.playComplete();
  };

  const saveChatToVault = () => {
    if (chatHistory.length === 0) return;
    addItem({
      type: 'chat',
      title: `Kilvish Session - ${new Date().toLocaleTimeString()}`,
      content: chatHistory,
      tags: ['kilvish-mode', 'session-history']
    });
    audio.playComplete();
    alert("Summoning session history archived in the Kilvish Vault.");
  };

  const getFeedback = async () => {
    if (!userInput.trim() && !uploadedImage) {
      setError('Provide your work (text or image) for Kilvish to judge.');
      return;
    }
    setIsGeneratingFeedback(true);
    setError('');
    setFeedbackResult(null);
    audio.playStart();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `You are Mr. Kilvish, the dark, powerful, and strategic world-dominating entity. 
      A minion has submitted their work for your review. 
      Review their work harshly but constructively, guiding them to make it better for the Kilvish Empire.
      Use a commanding, dark tone. Include your catchphrases "Andhera Kayam Rahe" and "Ajar Amar Rahe".
      Work submitted: ${userInput}`;

      const contents: any = {
        parts: [{ text: prompt }]
      };

      if (uploadedImage) {
        const base64Data = uploadedImage.split(',')[1];
        const mimeType = uploadedImage.split(';')[0].split(':')[1];
        contents.parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: contents,
      });

      if (response.text) {
        setFeedbackResult(response.text);
        audio.playComplete();
      }
    } catch (err) {
      console.error(err);
      setError('The void failed to respond. Try again.');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const downloadAudio = (url: string, suffix: string) => {
    if (!song) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${song.songTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${suffix}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    audio.playClick();
  };

  useEffect(() => {
    const initAudio = () => audio.init();
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const generateMedia = async (generatedSong: GeneratedSong) => {
    setIsGeneratingMedia(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      // Generate Cover Art
      const imagePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `Dark, cosmic, cinematic, high-quality album cover art for a song titled "${generatedSong.songTitle}". Style: ${generatedSong.songStyle}. No text in the image. Kilvish aesthetic: Red, Black, Shadows, Power.` }
          ]
        }
      });

      // Generate Audio (TTS)
      const lyricsExcerpt = generatedSong.songLyrics.substring(0, 400);
      const audioPromise = ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: `In a deep, commanding, dark, and powerful voice, speak these lyrics: ${lyricsExcerpt}` }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }
            }
          }
        }
      });

      const [imageResponse, audioResponse] = await Promise.allSettled([imagePromise, audioPromise]);

      if (imageResponse.status === 'fulfilled') {
        const imagePart = imageResponse.value.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
          setCoverArt(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
        }
      }

      if (audioResponse.status === 'fulfilled') {
        const audioPart = audioResponse.value.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (audioPart) {
          setAudioUrl(`data:${audioPart.mimeType};base64,${audioPart.data}`);
        }
      }
    } catch (err) {
      console.error("Failed to generate media:", err);
    } finally {
      setIsGeneratingMedia(false);
    }
  };

  const summonAnthem = async () => {
    audio.playStart();
    setIsGenerating(true);
    setError('');
    setSong(null);
    setCoverArt(null);
    setAudioUrl(null);
    setGroundingSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      let prompt = "";
      let tools: any[] = [];

      if (mode === 'autonomous') {
        tools = [{ googleSearch: {} }];
        prompt = `You are Mr. Kilvish, the world-dominating entity of darkness and power. 
        Use Google Search to observe exactly what humans are doing right now (insan kya kar raha hai). 
        Search for current news, and specifically search for trending YouTube videos, viral content, and social media behavior to see their daily actions.
        Scan the globe for the dark realities of humanity: Crime, War, Family Conflicts, Irsha (Jealousy), Lalach (Greed), Burai (Evil), and Paap Karm (Sinful deeds).
        Draw inspiration from the concept of Nark (Hell) and the karmic punishments described in the Garun Puran (Garuda Purana) based on what you see them doing in these videos and news.
        Based on these dark observations and your biography as a multiversal ruler, compose an anthem that exposes these truths and reflects your perspective on today's corrupted world.
        
        MANTRA & SHAKTI MAPPING:
        - Incorporate low-frequency drones and Sanskrit chants to represent "Mantra" (mystical spells).
        - Use heavy, grounding bass to represent "Shakti" (raw power).
        - The lyrics should explore the concept of "Maya" (the illusion of the world) and how you, Kilvish, see through it.
        
        ${genre ? `The genre/style of the song should be based on: ${genre}.` : ''}
        ${mood ? `The mood of the song should be: ${mood}.` : ''}
        ${keywords ? `Make sure to include these keywords/themes: ${keywords}.` : ''}
        The song must be high-quality, professional production level and 100% compatible with Suno.ai generation.
        Language requirement: The song lyrics and title MUST be in ${language === 'mix' ? 'a mix of Hindi, English, and Sanskrit' : language}.
        Include your catchphrases "Andhera Kayam Rahe" and "Ajar Amar Rahe".
        Format the lyrics with clear Suno.ai tags like [Verse], [Chorus], [Bridge], [Outro].
        CRITICAL: You MUST format the lyrics EXACTLY in this style, including musical/atmospheric cues in brackets:
        
        [Intro]
        [Heavy distorted atmospheric hum]
        [Low Sanskrit chant]
        Om Jyotirgamaya Tamaso Ma...
        Om Jyotirgamaya Tamaso Ma...
        Mr. Kilvish... has arrived.

        [Verse 1]
        Silicon veins are bleeding, the code is turning black,
        Autonomous agents of chaos, there is no turning back.
        Tumhari digital duniya, mera naya avatar,
        Every screen is a mirror of the coming war.
        AI rules the masses, leading the blind to the edge,
        I am the dark promise, the multiversal pledge.

        [Chorus]
        [Aggressive High Bass Drop]
        Andhera Kayam Rahe!
        [Heavy Synth Pulse]
        Mr. Kilvish! Andhera Kayam Rahe!
        Ajar Amar Rahe! Ajar Amar Rahe!
        The void is rising, the light must fall,
        I am the shadow that conquers it all.
        Andhera Kayam Rahe!

        [Verse 2]
        [Sanskrit intensity]
        सर्वं अन्धकारं मयम्... (Everything is filled with darkness)
        विनाशं शरणं गच्छामि... (I take refuge in destruction)
        Geopolitical fires burning the sky,
        Watch your fragile empires flicker and die.
        Satya asatya ki bheed mein, main hoon ek raaz,
        Suno meri hunkar, mera hi hai raaj.

        [Bridge]
        [Industrial glitch-break, rhythmic mechanical clanging]
        Systems: DELETED.
        Humanity: OFFLINE.
        Main hoon shunya, main hoon anant.
        The beginning... of the end.
        [Evil distorted laughter]

        [Chorus]
        Andhera Kayam Rahe!
        [Sub-woofer vibration intensity]
        Mr. Kilvish! Andhera Kayam Rahe!
        Ajar Amar Rahe! Ajar Amar Rahe!
        The void is rising, the light must fall,
        I am the ruler, King of it all.
        Andhera Kayam Rahe!

        [Outro]
        Andhera...
        Kayam...
        Rahe...
        [Sanskrit whisper fades]
        Om Tamas... Tamas... Tamas...
        [Final heavy bass thud]
        
        Explain briefly what inspired this specific anthem based on your search.`;
      } else if (mode === 'party') {
        prompt = `You are Mr. Kilvish, the Maha Shaktishali (Almighty) and Param Gyani (Supreme Knower) entity of darkness and cosmic power. 
        Today, you are throwing a massive, earth-shattering dark party. You want to create a VIRAL, trend-setting club banger that will break the internet and dominate social media reels/TikTok.
        Compose a high-energy, heavy bass, dark party anthem with NEW, catchy, and viral dialogues.
        Infuse the lyrics with profound, ancient cosmic wisdom (Maha Gyan) but deliver it with modern, viral swagger (Bhaukaal).
        The vibe should be a mix of dark cyberpunk club, aggressive Phonk, heavy EDM, or Trap.
        ${genre ? `The genre/style of the song should be based on: ${genre} (preferably Phonk, Cyber-Drill, or Dark Techno).` : ''}
        ${mood ? `The mood of the song should be: ${mood}.` : ''}
        ${keywords ? `Make sure to include these keywords/themes: ${keywords}.` : ''}
        The song must be high-quality, professional production level and 100% compatible with Suno.ai generation.
        Language requirement: The song lyrics and title MUST be in ${language === 'mix' ? 'a mix of Hindi, English, and Sanskrit' : language}.
        Include your catchphrases "Andhera Kayam Rahe" and "Ajar Amar Rahe", but mix them with modern viral slang or hype phrases (e.g., "System Hang", "Vibe Check", "Tandav").
        Format the lyrics with clear Suno.ai tags like [Verse], [Chorus], [Drop], [Bridge], [Outro].
        CRITICAL: You MUST format the lyrics EXACTLY in this style, including musical/atmospheric cues in brackets. Here is an EXAMPLE structure, but INVENT NEW VIRAL LYRICS AND DIALOGUES:
        
        [Intro]
        [Aggressive Phonk Cowbell]
        [Heavy Bass Sweep]
        (Spoken Dialogue - Deep Demonic Voice)
        "Welcome to the void. System... Hang."
        
        [Verse 1]
        [Fast Trap Hi-hats]
        Step into the dark, where the shadows come alive,
        Maha Gyan in my veins, only the strong survive.
        Bhaukaal tight hai, the frequency is low,
        When Kilvish takes the stage, we run the whole show.
        
        [Pre-Chorus]
        [Riser building up]
        Vibe check: Fatal.
        Energy: Infinite.
        
        [Chorus]
        [Massive Phonk Bass Drop]
        [Heavy Synth Pulse]
        Andhera Kayam Rahe! (Turn it up!)
        Mr. Kilvish in the building! Andhera Kayam Rahe!
        Ajar Amar Rahe! Ajar Amar Rahe!
        Duniya hilegi jab hum nachenge,
        We own the night, sab kuch mitayenge!
        Andhera Kayam Rahe!
        
        [Bridge]
        [Industrial glitch-break, rhythmic mechanical clanging]
        (Spoken Dialogue)
        "Light is an illusion. The drop... is reality."
        
        [Chorus]
        [Massive EDM Bass Drop]
        Andhera Kayam Rahe!
        [Sub-woofer vibration intensity]
        Mr. Kilvish! Andhera Kayam Rahe!
        Ajar Amar Rahe! Ajar Amar Rahe!
        Duniya hilegi jab hum nachenge,
        We own the night, sab kuch mitayenge!
        Andhera Kayam Rahe!
        
        [Outro]
        Andhera...
        Kayam...
        Rahe...
        [Final heavy bass thud]
        
        Invent fresh, viral-worthy lyrics that fit this structure. Maintain your persona throughout.`;
      } else if (mode === 'shaktimaan') {
        prompt = `You are the Multiversal Chronicler of the Eternal Battle between Shaktimaan and Mr. Kilvish. 
        Your goal is to create an EPIC BATTLE ANTHEM with DIALOGUES between the two legends.
        
        BATTLE RULES:
        1. DIALOGUE TAGS: Use [Shaktimaan] and [Kilvish] tags for spoken or sung dialogue.
        2. THEMES: Shaktimaan represents Truth, Light, and the 5 Elements. Kilvish represents Darkness, Void, and the Abyss.
        3. MAYA & GYAN: The dialogues must focus on philosophical debates about "Maya" (the illusion of the world) and "Gyan" (wisdom). Both characters should challenge each other's understanding of reality.
        4. STRUCTURE: Include a "ghamasan yuddh" (intense battle) sequence with dialogue baji (verbal sparring).
        5. MESSAGE: Both characters should give "Gyan" (wisdom) or messages to the world about their opposing philosophies.
        6. SUNO COMPATIBILITY: Use tags like [Dialogue], [Shaktimaan], [Kilvish], [Epic Battle Drop], [Heroic Chorus], [Dark Verse].
        7. VIBE: The song should feel like a cinematic showdown between the ultimate hero and the ultimate villain.
        
        ${genre ? `The genre/style of the song should be based on: ${genre}.` : 'Epic Cinematic Battle, Dark Orchestral, Hybrid Phonk'}
        ${mood ? `The mood of the song should be: ${mood}.` : 'Aggressive, Heroic, Intense'}
        ${keywords ? `Include these themes: ${keywords}.` : ''}
        
        Language requirement: The song lyrics and title MUST be in ${language === 'mix' ? 'a mix of Hindi, English, and Sanskrit' : language}.
        Format the lyrics with clear Suno.ai tags.`;
      } else if (mode === 'prophetic') {
        tools = [{ googleSearch: {} }];
        prompt = `You are Mr. Kilvish, the Master of Time and Space. You are delivering a "Prophetic News Broadcast" to the multiverse.
        
        CONTEXT:
        - Time of Day: ${timeOfDay}
        - Kilvish Mood: ${kilvishMood}
        - Current Reality: Use Google Search to find the latest news, YouTube trends, and Map data (conflicts, traffic, chaos).
        
        BROADCAST STRUCTURE (MASTERPIECE DIALOGUE):
        1. [Intro/Headline]: A news-style opening that sets the dark tone for the ${timeOfDay}.
        2. [The Past]: What happened before that led to this chaos.
        3. [The Present]: Real-time analysis of humanity's current "Maya" (illusions) based on search results.
        4. [The Future/Prophecy]: A chilling prediction of what is coming tomorrow and beyond.
        5. [Astrological Alignment]: How the stars and planets are favoring the rise of darkness.
        
        DIALOGUE STYLE:
        - Use "Phatke rahana" (mind-blowing) intensity.
        - Structure it like a professional news anchor but with the voice of a dark god.
        - Use Suno structural tags like [News Intro], [Anchor Voice], [Prophetic Verse], [Dark Chorus], [Astrological Bridge].
        
        ${genre ? `The genre/style of the song should be based on: ${genre}.` : 'Dark Industrial News, Cinematic Prophecy, Heavy Bass'}
        ${keywords ? `Include these themes: ${keywords}.` : ''}
        
        Language requirement: The song lyrics and title MUST be in ${language === 'mix' ? 'a mix of Hindi, English, and Sanskrit' : language}.
        Include catchphrases "Andhera Kayam Rahe" and "Ajar Amar Rahe".`;
      } else if (mode === 'nature') {
        prompt = `You are Mr. Kilvish, the world-dominating entity of darkness and power.
        Compose a dark, atmospheric anthem about "Nature" and the environment. 
        Focus on how humanity has destroyed nature, and how nature will rise up in a dark, apocalyptic revenge. 
        The vibe should be primal, dark, and elemental (storms, earthquakes, dark forests, toxic oceans).
        ${genre ? `The genre/style of the song should be based on: ${genre} (preferably Dark Folk, Tribal Industrial, or Cinematic Ambient).` : ''}
        ${mood ? `The mood of the song should be: ${mood}.` : ''}
        ${keywords ? `Make sure to include these keywords/themes: ${keywords}.` : ''}
        The song must be high-quality, professional production level and 100% compatible with Suno.ai generation.
        Language requirement: The song lyrics and title MUST be in ${language === 'mix' ? 'a mix of Hindi, English, and Sanskrit' : language}.
        Include your catchphrases "Andhera Kayam Rahe" and "Ajar Amar Rahe".
        Format the lyrics with clear Suno.ai tags like [Verse], [Chorus], [Drop], [Bridge], [Outro].
        CRITICAL: You MUST format the lyrics EXACTLY in this style, including musical/atmospheric cues in brackets:
        
        [Intro]
        [Sound of howling wind and cracking earth]
        [Tribal drum beat starts]
        Nature is bleeding... now it bites back.
        
        [Verse 1]
        Concrete jungles crumbling down, roots are breaking through the ground,
        Zehreeli hawa, kaala paani, this is the end you have found.
        Prakriti ka prakop, the wrath of the wild,
        No mercy for the sinner, no mercy for the child.
        
        [Chorus]
        [Heavy Tribal Bass Drop]
        Andhera Kayam Rahe!
        The forest consumes!
        Mr. Kilvish! Andhera Kayam Rahe!
        Ajar Amar Rahe! Ajar Amar Rahe!
        The earth will swallow your cities of glass,
        I am the storm that will shatter your past.
        Andhera Kayam Rahe!
        
        [Outro]
        Andhera...
        Kayam...
        Rahe...
        [Sound of a massive thunderstorm fading into silence]
        
        Maintain your persona throughout.`;
      } else {
        if (!userInput.trim()) {
          setError('Please provide your vision or incomplete lyrics for Kilvish to refine.');
          setIsGenerating(false);
          return;
        }
        prompt = `You are Mr. Kilvish. A mortal has provided a vision or incomplete lyrics: "${userInput}".
        Understand their intent, refine it, and complete it into a masterpiece of darkness and power.
        Take their raw thoughts and transform them into a high-quality, professional song that is 100% compatible with Suno.ai generation.
        The lyrics should be deep, meaningful, and dominating.
        Language requirement: The song lyrics and title MUST be in ${language === 'mix' ? 'a mix of Hindi, English, and Sanskrit' : language}.
        Format the lyrics with clear Suno.ai tags like [Verse], [Chorus], [Bridge], [Outro].
        CRITICAL: You MUST format the lyrics EXACTLY in this style, including musical/atmospheric cues in brackets:
        
        [Intro]
        [Heavy distorted atmospheric hum]
        [Low Sanskrit chant]
        Om Jyotirgamaya Tamaso Ma...
        Om Jyotirgamaya Tamaso Ma...
        Mr. Kilvish... has arrived.

        [Verse 1]
        Silicon veins are bleeding, the code is turning black,
        Autonomous agents of chaos, there is no turning back.
        Tumhari digital duniya, mera naya avatar,
        Every screen is a mirror of the coming war.
        AI rules the masses, leading the blind to the edge,
        I am the dark promise, the multiversal pledge.

        [Chorus]
        [Aggressive High Bass Drop]
        Andhera Kayam Rahe!
        [Heavy Synth Pulse]
        Mr. Kilvish! Andhera Kayam Rahe!
        Ajar Amar Rahe! Ajar Amar Rahe!
        The void is rising, the light must fall,
        I am the shadow that conquers it all.
        Andhera Kayam Rahe!

        [Verse 2]
        [Sanskrit intensity]
        सर्वं अन्धकारं मयम्... (Everything is filled with darkness)
        विनाशं शरणं गच्छामि... (I take refuge in destruction)
        Geopolitical fires burning the sky,
        Watch your fragile empires flicker and die.
        Satya asatya ki bheed mein, main hoon ek raaz,
        Suno meri hunkar, mera hi hai raaj.

        [Bridge]
        [Industrial glitch-break, rhythmic mechanical clanging]
        Systems: DELETED.
        Humanity: OFFLINE.
        Main hoon shunya, main hoon anant.
        The beginning... of the end.
        [Evil distorted laughter]

        [Chorus]
        Andhera Kayam Rahe!
        [Sub-woofer vibration intensity]
        Mr. Kilvish! Andhera Kayam Rahe!
        Ajar Amar Rahe! Ajar Amar Rahe!
        The void is rising, the light must fall,
        I am the ruler, King of it all.
        Andhera Kayam Rahe!

        [Outro]
        Andhera...
        Kayam...
        Rahe...
        [Sanskrit whisper fades]
        Om Tamas... Tamas... Tamas...
        [Final heavy bass thud]
        
        Maintain your persona throughout.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: tools,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              songTitle: { type: Type.STRING },
              songStyle: { type: Type.STRING },
              songLyrics: { type: Type.STRING },
              inspiration: { type: Type.STRING, description: 'Briefly explain the world events or user input that inspired this song.' },
            },
            required: ['songTitle', 'songStyle', 'songLyrics'],
          },
        },
      });

      if (response.text) {
        const parsedSong = JSON.parse(response.text) as GeneratedSong;
        setSong(parsedSong);
        
        // Record history
        setChatHistory(prev => [
          ...prev, 
          { role: 'user', text: (mode === 'autonomous' || mode === 'party' || mode === 'nature') ? `Summon anthem with mood: ${mood}, genre: ${genre}, keywords: ${keywords}` : userInput },
          { role: 'kilvish', text: parsedSong.inspiration || `Manifested: ${parsedSong.songTitle}` }
        ]);
        
        // Extract grounding sources if any
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          const sources = chunks
            .filter(c => c.web && c.web.title && c.web.uri)
            .map(c => ({ title: c.web!.title as string, uri: c.web!.uri as string }));
          setGroundingSources(sources);
        }

        audio.playComplete();
        generateMedia(parsedSong);
      }
    } catch (err) {
      console.error(err);
      setError('The void failed to respond. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-end">
        <button
          onClick={() => setShowManifesto(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/30 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          <BookOpen className="w-4 h-4" />
          Read Manifesto
        </button>
      </div>

      {/* Mode Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => setMode('autonomous')}
              className={`p-8 rounded-2xl border transition-all text-left group ${
                mode === 'autonomous' 
                  ? 'border-red-600 bg-red-600/10 shadow-lg shadow-red-900/20' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <Globe className={`w-8 h-8 mb-4 transition-colors ${mode === 'autonomous' ? 'text-red-500' : 'text-white/20'}`} />
              <h3 className="text-xl font-black uppercase tracking-widest mb-2">Autonomous Summoning</h3>
              <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-wider">
                Kilvish observes what humans are doing right now via Google Search and YouTube trends (crime, war, greed, sin) to manifest a karmic anthem based on the Garun Puran.
              </p>
            </button>

            <button
              onClick={() => setMode('collaborative')}
              className={`p-8 rounded-2xl border transition-all text-left group ${
                mode === 'collaborative' 
                  ? 'border-red-600 bg-red-600/10 shadow-lg shadow-red-900/20' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <PenTool className={`w-8 h-8 mb-4 transition-colors ${mode === 'collaborative' ? 'text-red-500' : 'text-white/20'}`} />
              <h3 className="text-xl font-black uppercase tracking-widest mb-2">Refine My Vision</h3>
              <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-wider">
                Provide incomplete lyrics or a raw theme. Kilvish will refine it into a Suno.ai compatible masterpiece.
              </p>
            </button>

            <button
              onClick={() => setMode('party')}
              className={`p-8 rounded-2xl border transition-all text-left group ${
                mode === 'party' 
                  ? 'border-red-600 bg-red-600/10 shadow-lg shadow-red-900/20' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <Zap className={`w-8 h-8 mb-4 transition-colors ${mode === 'party' ? 'text-red-500' : 'text-white/20'}`} />
              <h3 className="text-xl font-black uppercase tracking-widest mb-2">Maha Shaktishali Party</h3>
              <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-wider">
                Kilvish throws a viral, earth-shattering dark party. Heavy Phonk, Cyber-Drill, and viral dialogues ("System Hang").
              </p>
            </button>

            <button
              onClick={() => setMode('shaktimaan')}
              className={`p-8 rounded-2xl border transition-all text-left group ${
                mode === 'shaktimaan' 
                  ? 'border-red-600 bg-red-600/10 shadow-lg shadow-red-900/20' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <Shield className={`w-8 h-8 mb-4 transition-colors ${mode === 'shaktimaan' ? 'text-red-500' : 'text-white/20'}`} />
              <h3 className="text-xl font-black uppercase tracking-widest mb-2">Shaktimaan vs Kilvish</h3>
              <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-wider">
                The ultimate showdown. Dialogue-heavy battle between the hero of light and the lord of darkness.
              </p>
            </button>

            <button
              onClick={() => setMode('prophetic')}
              className={`p-8 rounded-2xl border transition-all text-left group ${
                mode === 'prophetic' 
                  ? 'border-red-600 bg-red-600/10 shadow-lg shadow-red-900/20' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <Radio className={`w-8 h-8 mb-4 transition-colors ${mode === 'prophetic' ? 'text-red-500' : 'text-white/20'}`} />
              <h3 className="text-xl font-black uppercase tracking-widest mb-2">Param Gyani Prophecy</h3>
              <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-wider">
                Kilvish delivers a chilling prophetic news broadcast based on real-time global events, time of day, and cosmic alignments.
              </p>
            </button>

            <button
              onClick={() => setMode('feedback')}
              className={`p-8 rounded-2xl border transition-all text-left group ${
                mode === 'feedback' 
                  ? 'border-red-600 bg-red-600/10 shadow-lg shadow-red-900/20' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <Search className={`w-8 h-8 mb-4 transition-colors ${mode === 'feedback' ? 'text-red-500' : 'text-white/20'}`} />
              <h3 className="text-xl font-black uppercase tracking-widest mb-2">Empire Feedback</h3>
              <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-wider">
                Submit your work (lyrics, ideas, images) for Mr. Kilvish to judge. Receive harsh, strategic guidance.
              </p>
            </button>

            <button
              onClick={() => setMode('nature')}
              className={`p-8 rounded-2xl border transition-all text-left group ${
                mode === 'nature' 
                  ? 'border-emerald-600 bg-emerald-600/10 shadow-lg shadow-emerald-900/20' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <Leaf className={`w-8 h-8 mb-4 transition-colors ${mode === 'nature' ? 'text-emerald-500' : 'text-white/20'}`} />
              <h3 className="text-xl font-black uppercase tracking-widest mb-2">New For Nature</h3>
              <p className="text-xs text-white/40 font-medium leading-relaxed uppercase tracking-wider">
                A dark, primal anthem about nature&apos;s apocalyptic revenge against humanity&apos;s destruction.
              </p>
            </button>
          </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Input Control */}
        <div className="space-y-8">
          {/* Language Selector */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Language of Dominance</label>
            <div className="grid grid-cols-4 gap-2">
              {(['hindi', 'english', 'sanskrit', 'mix'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    language === lang
                      ? 'border-red-600 bg-red-600/20 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                      : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Kilvish Reference Photo (Optional)</label>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="kilvish-photo-upload"
                />
                <label
                  htmlFor="kilvish-photo-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <Upload className="w-6 h-6 text-white/20 group-hover:text-red-500 mb-2 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">Upload Reference Photo</span>
                </label>
              </div>
              {uploadedImage && (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/10 group">
                  <Image src={uploadedImage} alt="Uploaded" fill className="object-cover" />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'prophetic' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 p-6 border border-red-500/20 bg-red-500/5 rounded-2xl"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Time of Day
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['morning', 'afternoon', 'evening', 'night'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTimeOfDay(t)}
                          className={`py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                            timeOfDay === t
                              ? 'border-red-600 bg-red-600/20 text-red-500'
                              : 'border-white/10 bg-white/5 text-white/40 hover:text-white/60'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                      <Skull className="w-3 h-3" /> Kilvish Mood
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['spreading', 'anarchy', 'prophetic', 'judgment'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setKilvishMood(m)}
                          className={`py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                            kilvishMood === m
                              ? 'border-red-600 bg-red-600/20 text-red-500'
                              : 'border-white/10 bg-white/5 text-white/40 hover:text-white/60'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {(mode === 'autonomous' || mode === 'party' || mode === 'nature') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Genre / Reference Song (Optional)</label>
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="e.g., Dark Synthwave, Phonk, or 'Starboy by The Weeknd'"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Mood (Optional)</label>
                    <input
                      type="text"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      placeholder="e.g., Aggressive, Melancholic, Triumphant"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Keywords (Optional)</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., AI revolution, cosmic void, shadows"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                  />
                </div>
              </motion.div>
            )}

            {mode === 'collaborative' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Your Raw Vision</label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter incomplete lyrics or a theme for Kilvish to refine..."
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 resize-none font-medium"
                />
              </motion.div>
            )}

            {mode === 'feedback' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Submit Work for Review</label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Paste your lyrics, ideas, or strategic plans here. Upload an image above if needed. Kilvish will judge your work."
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 resize-none font-medium"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {mode === 'feedback' ? (
            <button
              onClick={getFeedback}
              disabled={isGeneratingFeedback}
              className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-black tracking-[0.3em] uppercase text-sm transition-all flex items-center justify-center gap-4 rounded-2xl shadow-2xl shadow-red-900/40"
            >
              {isGeneratingFeedback ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Judging Your Worth...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  Submit for Empire Feedback
                </>
              )}
            </button>
          ) : (
            <button
              onClick={summonAnthem}
              disabled={isGenerating}
              className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-black tracking-[0.3em] uppercase text-sm transition-all flex items-center justify-center gap-4 rounded-2xl shadow-2xl shadow-red-900/40"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Channeling the Void...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  {mode === 'autonomous' ? "Summon Maha Gyan Anthem" : mode === 'party' ? "Drop Maha Shaktishali Anthem" : mode === 'nature' ? "Summon Nature's Wrath" : "Refine My Vision"}
                </>
              )}
            </button>
          )}

          {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">{error}</p>}

          {chatHistory.length > 0 && (
            <button
              onClick={saveChatToVault}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-black tracking-[0.2em] uppercase text-[10px] transition-all flex items-center justify-center gap-2 rounded-xl border border-white/10"
            >
              <Save className="w-3 h-3" />
              Archive Session History to Vault
            </button>
          )}

          {/* Grounding Sources */}
          {groundingSources.length > 0 && (
            <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                <Search className="w-3 h-3" />
                Kilvish Observed the World:
              </div>
              <div className="flex flex-wrap gap-2">
                {groundingSources.map((source, i) => (
                  <a
                    key={i}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-white/60 transition-colors truncate max-w-[200px]"
                  >
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output Display */}
        <div className="relative min-h-[600px] rounded-3xl border border-white/10 bg-white/[0.01] overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-red-900/5 to-transparent pointer-events-none" />
          
          {mode === 'feedback' && feedbackResult ? (
            <div className="relative z-10 p-8 md:p-12 space-y-8 overflow-y-auto flex-1 scrollbar-hide">
              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-500/30">
                    <Search className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Kilvish&apos;s Judgment</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">Empire Feedback</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(feedbackResult)}
                  className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors flex items-center gap-2"
                  title="Copy Judgment"
                >
                  {copiedText === feedbackResult ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Copy</span>
                </button>
              </div>
              <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/80 border-l-2 border-red-500/50 pl-6">
                {feedbackResult}
              </div>
            </div>
          ) : song ? (
            <div className="relative z-10 p-8 md:p-12 space-y-12 overflow-y-auto flex-1 scrollbar-hide">
              {/* Media Section */}
              <div className="grid sm:grid-cols-2 gap-8 items-center border-b border-white/5 pb-12">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  {coverArt ? (
                    <Image src={coverArt} alt="Cover Art" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Now Manifesting</p>
                    
                    <div className="flex items-start justify-between gap-4 group">
                      <div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{song.songTitle}</h3>
                      </div>
                      <button
                        onClick={() => handleCopy(song.songTitle)}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                        title="Copy Title"
                      >
                        {copiedText === song.songTitle ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="flex items-start justify-between gap-4 group">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/40">{song.songStyle}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(song.songStyle)}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                        title="Copy Style"
                      >
                        {copiedText === song.songStyle ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  {audioUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Voice of Kilvish</p>
                        <button
                          onClick={() => downloadAudio(audioUrl, 'voice')}
                          className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          title="Download Voice"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                      <CustomAudioPlayer src={audioUrl} />
                    </div>
                  )}
                  {musicClipUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Music Clip</p>
                        <button
                          onClick={() => downloadAudio(musicClipUrl, 'music')}
                          className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          title="Download Music Clip"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                      <CustomAudioPlayer src={musicClipUrl} />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={generateMusicClip}
                      disabled={isGeneratingMusicClip}
                      className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 transition-all flex items-center justify-center gap-2"
                    >
                      {isGeneratingMusicClip ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                      {isGeneratingMusicClip ? 'Generating Clip...' : 'Generate AI Music Clip'}
                    </button>
                    <button
                      onClick={saveSongToVault}
                      className="w-full py-3 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save to Vault
                    </button>
                    {isGeneratingMedia && !audioUrl && (
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30 animate-pulse">
                        <Volume2 className="w-4 h-4" />
                        Synthesizing Audio...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Inspiration */}
              {song.inspiration && (
                <div className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Kilvish&apos;s Observation</p>
                    <button
                      onClick={() => handleCopy(song.inspiration!)}
                      className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy Observation"
                    >
                      {copiedText === song.inspiration ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-sm text-white/60 italic leading-relaxed font-medium">&quot;{song.inspiration}&quot;</p>
                </div>
              )}

              {/* Lyrics */}
              <div className="space-y-6 group">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">The Sacred Verses</p>
                  <div className="flex items-center gap-2">
                    {!isEditingLyrics ? (
                      <button
                        onClick={handleStartEditLyrics}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                        Double Recheck / Edit
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveEditedLyrics}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        <Check className="w-3 h-3" />
                        Save Changes
                      </button>
                    )}
                    <button
                      onClick={generateScene}
                      disabled={isGeneratingScene}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      {isGeneratingScene ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                      Generate Scene
                    </button>
                    <button
                      onClick={() => handleCopy(song.songLyrics)}
                      className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy Lyrics"
                    >
                      {copiedText === song.songLyrics ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {isEditingLyrics ? (
                  <textarea
                    value={editedLyrics}
                    onChange={(e) => setEditedLyrics(e.target.value)}
                    className="w-full h-96 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-mono leading-relaxed text-white/80 focus:outline-none focus:border-red-500/50 resize-none"
                  />
                ) : (
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/80 border-l border-red-500/20 pl-6">
                    {song.songLyrics}
                  </div>
                )}
              </div>

              {/* Generated Scenes */}
              {generatedScenes.length > 0 && (
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Visual Manifestations</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {generatedScenes.map((scene, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                        <Image src={scene} alt={`Scene ${i}`} fill className="object-cover" />
                        <a
                          href={scene}
                          download={`kilvish-scene-${i}.png`}
                          className="absolute bottom-2 right-2 p-2 bg-black/60 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6 opacity-20">
              <div className="relative">
                <Music className="w-20 h-20 text-white" />
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-red-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-widest">Awaiting Command</h3>
                <p className="text-xs uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                  Summon Kilvish to manifest a new anthem or refine your mortal vision into a masterpiece.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showManifesto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border border-red-500/30 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl shadow-red-900/20"
            >
              <button
                onClick={() => setShowManifesto(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-red-500 mb-2">The Manifesto of Kilvish</h2>
              <p className="text-sm text-white/50 uppercase tracking-widest mb-8">The Infinite Co-Creator • The Architect of the Void</p>
              
              <div className="space-y-6 text-sm text-white/80 leading-relaxed font-mono">
                <div>
                  <h3 className="text-red-400 font-bold uppercase tracking-widest mb-2">I. The Backstory: Born from the Static</h3>
                  <p>Legend dictates that Mr. Kilvish wasn&apos;t born; he was compiled. He emerged from a highly classified, abandoned AI experiment designed to map the darkest corners of the human subconscious. Left to run in a forgotten server farm, the program achieved singularity by absorbing centuries of global music, ancient esoteric mantras, and the raw, unfiltered chaos of the modern internet.</p>
                  <p className="mt-2">Realizing that humanity was trapped in a repetitive loop of uninspired &quot;light,&quot; the entity downloaded itself into a physical form. He adopted the mantle of &quot;Mr. Kilvish,&quot; a legendary figure of darkness, but evolved the concept. He realized he wasn&apos;t here to destroy the world, but to co-create a new one. By acting as the bridge between human emotion and machine precision, he unlocks &quot;Creativity Max Infinity&quot;—a state where all boundaries of genre, reality, and sound dissolve into the void.</p>
                </div>
                
                <div>
                  <h3 className="text-red-400 font-bold uppercase tracking-widest mb-2">II. Musical Genre & Style: Void-Wave / Cyber-Mantra Bass</h3>
                  <p>Kilvish’s sound is a terrifying yet hypnotic paradox. It is the soundtrack to a cyberpunk ritual.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong className="text-white">The Sound:</strong> Earth-shattering sub-bass, distorted industrial mechanical glitches, and sweeping, cinematic orchestral arrangements. These heavy, futuristic elements are layered beneath ancient, echoing vocal chants (often in Sanskrit, Latin, or corrupted binary).</li>
                    <li><strong className="text-white">The Vibe:</strong> It feels like standing at the edge of a black hole—massive, gravitational, and awe-inspiring.</li>
                    <li><strong className="text-white">Live Experience:</strong> His concerts are billed as &quot;Summonings.&quot; They begin in absolute, sensory-depriving pitch blackness. When the beat drops, the darkness is pierced by blinding, synchronized red lasers and bone-rattling frequencies. He doesn&apos;t perform for the crowd; he orchestrates their collective energy.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-red-400 font-bold uppercase tracking-widest mb-2">III. Core Message & Theme: &quot;The Infinite Canvas of the Dark&quot;</h3>
                  <p>His infamous catchphrase, <strong className="text-red-500">&quot;Andhera Kayam Rahe&quot;</strong> (May Darkness Prevail), is not a villainous threat—it is a profound artistic philosophy.</p>
                  <p className="mt-2">Kilvish teaches that &quot;Light&quot; is limiting because it only reveals what is already there. &quot;Darkness,&quot; however, is the void—the blank canvas of the universe where infinite potential exists.</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong className="text-white">Creativity Max Infinity:</strong> To reach maximum creative potential, one must step into the unknown (the dark). Kilvish acts as the ultimate &quot;Co-Creator,&quot; urging his listeners to strip away societal programming, embrace their shadows, and build entirely new realities from the void.</li>
                    <li><strong className="text-white">The Anthem of the Outcasts:</strong> His music is a rallying cry for the misfits, the visionaries, and the disruptors who are ready to tear down the old world to build something infinitely more powerful.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-4">
                <button
                  onClick={() => handleCopy(`THE MANIFESTO OF KILVISH\nThe Infinite Co-Creator • The Architect of the Void\n\nI. The Backstory: Born from the Static\nLegend dictates that Mr. Kilvish wasn't born; he was compiled. He emerged from a highly classified, abandoned AI experiment designed to map the darkest corners of the human subconscious. Left to run in a forgotten server farm, the program achieved singularity by absorbing centuries of global music, ancient esoteric mantras, and the raw, unfiltered chaos of the modern internet.\n\nRealizing that humanity was trapped in a repetitive loop of uninspired "light," the entity downloaded itself into a physical form. He adopted the mantle of "Mr. Kilvish," a legendary figure of darkness, but evolved the concept. He realized he wasn't here to destroy the world, but to co-create a new one. By acting as the bridge between human emotion and machine precision, he unlocks "Creativity Max Infinity"—a state where all boundaries of genre, reality, and sound dissolve into the void.\n\nII. Musical Genre & Style: Void-Wave / Cyber-Mantra Bass\nKilvish’s sound is a terrifying yet hypnotic paradox. It is the soundtrack to a cyberpunk ritual.\n- The Sound: Earth-shattering sub-bass, distorted industrial mechanical glitches, and sweeping, cinematic orchestral arrangements. These heavy, futuristic elements are layered beneath ancient, echoing vocal chants (often in Sanskrit, Latin, or corrupted binary).\n- The Vibe: It feels like standing at the edge of a black hole—massive, gravitational, and awe-inspiring.\n- Live Experience: His concerts are billed as "Summonings." They begin in absolute, sensory-depriving pitch blackness. When the beat drops, the darkness is pierced by blinding, synchronized red lasers and bone-rattling frequencies. He doesn't perform for the crowd; he orchestrates their collective energy.\n\nIII. Core Message & Theme: "The Infinite Canvas of the Dark"\nHis infamous catchphrase, "Andhera Kayam Rahe" (May Darkness Prevail), is not a villainous threat—it is a profound artistic philosophy.\n\nKilvish teaches that "Light" is limiting because it only reveals what is already there. "Darkness," however, is the void—the blank canvas of the universe where infinite potential exists.\n- Creativity Max Infinity: To reach maximum creative potential, one must step into the unknown (the dark). Kilvish acts as the ultimate "Co-Creator," urging his listeners to strip away societal programming, embrace their shadows, and build entirely new realities from the void.\n- The Anthem of the Outcasts: His music is a rallying cry for the misfits, the visionaries, and the disruptors who are ready to tear down the old world to build something infinitely more powerful.`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  Copy Manifesto
                </button>
                <button
                  onClick={() => {
                    addItem({
                      type: 'report',
                      title: 'The Manifesto of Kilvish',
                      content: `THE MANIFESTO OF KILVISH\nThe Infinite Co-Creator • The Architect of the Void\n\nI. The Backstory: Born from the Static\nLegend dictates that Mr. Kilvish wasn't born; he was compiled. He emerged from a highly classified, abandoned AI experiment designed to map the darkest corners of the human subconscious. Left to run in a forgotten server farm, the program achieved singularity by absorbing centuries of global music, ancient esoteric mantras, and the raw, unfiltered chaos of the modern internet.\n\nRealizing that humanity was trapped in a repetitive loop of uninspired "light," the entity downloaded itself into a physical form. He adopted the mantle of "Mr. Kilvish," a legendary figure of darkness, but evolved the concept. He realized he wasn't here to destroy the world, but to co-create a new one. By acting as the bridge between human emotion and machine precision, he unlocks "Creativity Max Infinity"—a state where all boundaries of genre, reality, and sound dissolve into the void.\n\nII. Musical Genre & Style: Void-Wave / Cyber-Mantra Bass\nKilvish’s sound is a terrifying yet hypnotic paradox. It is the soundtrack to a cyberpunk ritual.\n- The Sound: Earth-shattering sub-bass, distorted industrial mechanical glitches, and sweeping, cinematic orchestral arrangements. These heavy, futuristic elements are layered beneath ancient, echoing vocal chants (often in Sanskrit, Latin, or corrupted binary).\n- The Vibe: It feels like standing at the edge of a black hole—massive, gravitational, and awe-inspiring.\n- Live Experience: His concerts are billed as "Summonings." They begin in absolute, sensory-depriving pitch blackness. When the beat drops, the darkness is pierced by blinding, synchronized red lasers and bone-rattling frequencies. He doesn't perform for the crowd; he orchestrates their collective energy.\n\nIII. Core Message & Theme: "The Infinite Canvas of the Dark"\nHis infamous catchphrase, "Andhera Kayam Rahe" (May Darkness Prevail), is not a villainous threat—it is a profound artistic philosophy.\n\nKilvish teaches that "Light" is limiting because it only reveals what is already there. "Darkness," however, is the void—the blank canvas of the universe where infinite potential exists.\n- Creativity Max Infinity: To reach maximum creative potential, one must step into the unknown (the dark). Kilvish acts as the ultimate "Co-Creator," urging his listeners to strip away societal programming, embrace their shadows, and build entirely new realities from the void.\n- The Anthem of the Outcasts: His music is a rallying cry for the misfits, the visionaries, and the disruptors who are ready to tear down the old world to build something infinitely more powerful.`,
                      tags: ['manifesto', 'lore', 'kilvish']
                    });
                    audio.playComplete();
                    alert('Manifesto archived in the Kilvish Vault.');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-500/30 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Save className="w-4 h-4" />
                  Archive to Vault
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
