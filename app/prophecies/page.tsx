'use client';

import { Prophecies } from '@/components/Prophecies';
import { PageHeader } from '@/components/PageHeader';

export default function PropheciesPage() {
  return (
    <div className="p-8 md:p-12 min-h-screen">
      <PageHeader 
        title="Prophecies" 
        description="Manifest your dark vision into reality using the Oracle of Darkness (Veo 3.1). The future of the Kilvish Empire is yours to command."
        badge="Video Generation"
      />
      <Prophecies />
    </div>
  );
}
