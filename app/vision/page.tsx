'use client';

import { YouTubeSearch } from '@/components/YouTubeSearch';

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-red-600">
            Imperial Vision
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-white/40">
            Search the Multiverse Video Archives
          </p>
        </div>

        <YouTubeSearch />
      </div>
    </div>
  );
}
