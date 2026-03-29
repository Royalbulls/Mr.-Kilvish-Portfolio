'use client';

import { MusicStudio } from '@/components/MusicStudio';
import { PageHeader } from '@/components/PageHeader';
import { useLanguage } from '@/components/LanguageContext';

export default function StudioPage() {
  const { t } = useLanguage();
  
  return (
    <div className="p-8 md:p-12 min-h-screen">
      <PageHeader 
        title={t('musicStudio')} 
        description={t('studioDesc')}
        badge="Professional DAW"
      />
      <MusicStudio />
    </div>
  );
}
