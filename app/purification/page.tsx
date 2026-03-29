'use client';

import { PurificationMode } from '@/components/PurificationMode';

export default function PurificationPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-white to-amber-500">
            The Path of Light
          </h1>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/40">
            Escaping the Darkness • Purifying the Soul • Finding Humanity
          </p>
        </div>

        <PurificationMode />
      </div>
    </div>
  );
}
