'use client';

import React from 'react';
import { AestheticGuide } from '@/components/AestheticGuide';
import { Sidebar } from '@/components/Sidebar';
import { SignatureStyle } from '@/components/SignatureStyle';

export default function AestheticGuidePage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600/30">
      <Sidebar />
      <div className="lg:pl-64 pb-24 lg:pb-0">
        <AestheticGuide />
        <SignatureStyle />
      </div>
    </main>
  );
}
