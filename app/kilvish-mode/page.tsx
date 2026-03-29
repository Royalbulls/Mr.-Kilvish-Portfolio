'use client';

import { KilvishMode } from '@/components/KilvishMode';
import { PageHeader } from '@/components/PageHeader';

export default function KilvishModePage() {
  return (
    <div className="p-8 md:p-12 min-h-screen">
      <PageHeader 
        title="Kilvish Mode" 
        description="The autonomous identity of Mr. Kilvish. He observes the world, he understands your vision, and he manifests dominance."
        badge="Supreme Intelligence"
      />
      <KilvishMode />
    </div>
  );
}
