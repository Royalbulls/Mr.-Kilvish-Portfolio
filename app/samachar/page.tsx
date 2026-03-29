'use client';

import { Samachar } from '@/components/Samachar';

export default function SamacharPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-red-600">
            Desh Duniya Samachar Patra
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-white/40">
            The Mirror of Human Darkness
          </p>
        </div>

        <Samachar />
      </div>
    </div>
  );
}
