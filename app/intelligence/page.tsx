'use client';

import { EmpireIntelligence } from '@/components/EmpireIntelligence';
import { PageHeader } from '@/components/PageHeader';

export default function IntelligencePage() {
  return (
    <div className="p-8 md:p-12 min-h-screen">
      <PageHeader 
        title="Empire Intelligence" 
        description="The Strategic Mind of Mr. Kilvish. Monitoring global media, identifying business opportunities, and planning the establishment of Kilvishstan Muktidham."
        badge="Strategic Command"
      />
      <EmpireIntelligence />
    </div>
  );
}
