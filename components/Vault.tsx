'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Archive, 
  Search, 
  Trash2, 
  Music, 
  FileText, 
  MessageSquare, 
  Layout, 
  ExternalLink, 
  Calendar,
  Tag,
  X,
  ChevronRight,
  Download,
  Edit3,
  Save,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { useVault, VaultItem } from './VaultContext';
import { audio } from '@/lib/audio';

import { CustomAudioPlayer } from './CustomAudioPlayer';
import Image from 'next/image';
import Markdown from 'react-markdown';

export function Vault() {
  const { items, removeItem, updateItem } = useVault();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [vaultVideoUrl, setVaultVideoUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    let currentUrl: string | null = null;
    
    const fetchVideo = async () => {
      if (selectedItem?.content?.videoUri) {
        try {
          const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
          const response = await fetch(selectedItem.content.videoUri, {
            method: 'GET',
            headers: {
              'x-goog-api-key': apiKey,
            },
          });
          if (response.ok) {
            const blob = await response.blob();
            currentUrl = URL.createObjectURL(blob);
            setVaultVideoUrl(currentUrl);
          }
        } catch (error) {
          console.error("Failed to fetch vault video:", error);
        }
      } else {
        setVaultVideoUrl(null);
      }
    };

    fetchVideo();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [selectedItem]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSelectItem = (item: VaultItem) => {
    setSelectedItem(item);
    setIsEditing(false);
    audio.playClick();
  };

  const handleStartEdit = () => {
    setEditContent(typeof selectedItem?.content === 'string' ? selectedItem.content : JSON.stringify(selectedItem?.content, null, 2));
    setIsEditing(true);
    audio.playClick();
  };

  const handleSaveEdit = () => {
    if (!selectedItem) return;
    let newContent = editContent;
    try {
      if (['arrangement', 'report', 'song', 'brand_identity', 'feedback'].includes(selectedItem.type)) {
        newContent = JSON.parse(editContent);
      }
    } catch (e) {
      // If parsing fails, keep as string
    }
    updateItem(selectedItem.id, { content: newContent });
    setSelectedItem({ ...selectedItem, content: newContent });
    setIsEditing(false);
    audio.playComplete();
  };

  const downloadArchive = () => {
    if (!selectedItem) return;
    
    // If it has an audioUrl, download that
    if (selectedItem.content?.audioUrl) {
      const link = document.createElement('a');
      link.href = selectedItem.content.audioUrl;
      link.download = `${selectedItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      audio.playClick();
      return;
    }

    // Otherwise download the JSON content
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedItem, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `${selectedItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    audio.playClick();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'song': 
      case 'music': return <Music className="w-4 h-4" />;
      case 'report': 
      case 'intelligence': return <FileText className="w-4 h-4" />;
      case 'chat': 
      case 'transcript': return <MessageSquare className="w-4 h-4" />;
      case 'arrangement': return <Layout className="w-4 h-4" />;
      case 'script': return <FileText className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'feedback': return <MessageSquare className="w-4 h-4" />;
      case 'brand_identity': return <FileText className="w-4 h-4" />;
      default: return <Archive className="w-4 h-4" />;
    }
  };

  return (
    <section id="vault" className="relative z-10 py-32 border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 flex items-center gap-4">
              <Archive className="w-10 h-10 md:w-16 md:h-16 text-red-600" />
              The Kilvish Vault
            </h2>
            <p className="text-white/50 max-w-md uppercase tracking-widest text-xs font-bold">
              Your global digital footprint. Every song, every report, every command archived for eternity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Search the archives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 w-full sm:w-64"
              />
            </div>
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto scrollbar-hide">
              {['all', 'song', 'report', 'chat', 'arrangement', 'feedback', 'brand_identity'].map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); audio.playClick(); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Archive List */}
          <div className="space-y-4">
            {filteredItems.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`group p-6 rounded-2xl border transition-all cursor-pointer ${
                      selectedItem?.id === item.id 
                        ? 'bg-red-600/10 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]' 
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${
                        item.type === 'song' ? 'bg-red-500/20 text-red-500' :
                        item.type === 'report' ? 'bg-emerald-500/20 text-emerald-500' :
                        item.type === 'chat' ? 'bg-indigo-500/20 text-indigo-500' :
                        item.type === 'brand_identity' ? 'bg-fuchsia-500/20 text-fuchsia-500' :
                        item.type === 'feedback' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {getIcon(item.type)}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white/90 mb-2 group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        {item.type}
                      </span>
                      <ChevronRight className={`w-3 h-3 text-red-500 transition-transform ${selectedItem?.id === item.id ? 'rotate-90' : ''}`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-20 space-y-4">
                <Archive className="w-12 h-12" />
                <p className="text-xs uppercase tracking-[0.3em]">Archives are empty</p>
              </div>
            )}
          </div>

          {/* Details Panel */}
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col h-fit sticky top-32"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        selectedItem.type === 'song' ? 'bg-red-500/20 text-red-500' :
                        selectedItem.type === 'report' ? 'bg-emerald-500/20 text-emerald-500' :
                        selectedItem.type === 'chat' ? 'bg-indigo-500/20 text-indigo-500' :
                        selectedItem.type === 'brand_identity' ? 'bg-fuchsia-500/20 text-fuchsia-500' :
                        selectedItem.type === 'feedback' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {selectedItem.type}
                      </span>
                      <span className="text-[10px] font-medium text-white/30">
                        ID: {selectedItem.id}
                      </span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">
                      {selectedItem.title}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { removeItem(selectedItem.id); setSelectedItem(null); audio.playClick(); }}
                      className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Content Archive</p>
                      {!isEditing ? (
                        <button 
                          onClick={handleStartEdit}
                          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" /> Edit / Recheck
                        </button>
                      ) : (
                        <button 
                          onClick={handleSaveEdit}
                          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          <Save className="w-3 h-3" /> Save Changes
                        </button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-white/80 focus:outline-none focus:border-red-500/50 resize-none"
                      />
                    ) : selectedItem.type === 'image' ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10">
                        <Image src={selectedItem.content} alt={selectedItem.title} fill className="object-contain" />
                      </div>
                    ) : selectedItem.type === 'brand_identity' ? (
                      <div className="p-6 rounded-xl bg-black/40 border border-white/5 prose prose-invert prose-sm prose-red max-w-none">
                        <Markdown>{selectedItem.content.result || selectedItem.content}</Markdown>
                      </div>
                    ) : selectedItem.type === 'feedback' ? (
                      <div className="p-6 rounded-xl bg-black/40 border border-white/5 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-white/40">Type:</span>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${selectedItem.content.feedbackType === 'issue' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                            {selectedItem.content.feedbackType}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-2">Description:</span>
                          <p className="text-sm text-white/80 leading-relaxed">{selectedItem.content.description}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-white/60 leading-relaxed whitespace-pre-wrap">
                        {typeof selectedItem.content === 'string' 
                          ? selectedItem.content 
                          : JSON.stringify(selectedItem.content, null, 2)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Metadata</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Archived On</p>
                        <p className="text-[10px] font-bold text-white/60">{new Date(selectedItem.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Status</p>
                        <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Verified
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedItem.content?.audioUrl && (
                    <div className="space-y-2 mt-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Archived Audio</p>
                      <CustomAudioPlayer src={selectedItem.content.audioUrl} />
                    </div>
                  )}
                  
                  {selectedItem.content?.coverArt && (
                    <div className="space-y-2 mt-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Cover Art</p>
                      <div className="relative aspect-square w-32 rounded-lg overflow-hidden border border-white/10">
                        <Image src={selectedItem.content.coverArt} alt="Cover Art" fill className="object-cover" />
                      </div>
                    </div>
                  )}

                  {vaultVideoUrl && (
                    <div className="space-y-2 mt-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Music Video Clip</p>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10">
                        <video src={vaultVideoUrl} controls className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex gap-3">
                  <button 
                    onClick={downloadArchive}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all"
                  >
                    <Download className="w-3 h-3" /> Download Archive
                  </button>
                  <button className="p-3 bg-white/5 text-white/60 rounded-xl hover:text-white transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-3xl opacity-20 space-y-4">
                <FileText className="w-12 h-12" />
                <p className="text-xs uppercase tracking-[0.3em] text-center">Select an item to view its digital footprint</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
