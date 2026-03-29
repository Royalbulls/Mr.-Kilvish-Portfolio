'use client';

import { Filmography } from '@/components/Filmography';
import { PageHeader } from '@/components/PageHeader';
import { useLanguage } from '@/components/LanguageContext';
import { CinematicForge } from '@/components/CinematicForge';

export default function FilmsPage() {
  const { t } = useLanguage();
  
  return (
    <div className="p-8 md:p-12 min-h-screen">
      <PageHeader 
        title="Empire Director" 
        description="Hollywood-style scene planning, shot lists, and video generation prompts for the Kilvish Empire."
        badge="Cinematic Void"
      />
      <Filmography />
      <CinematicForge />
    </div>
  );
}
