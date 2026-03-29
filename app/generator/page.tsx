'use client';

import { SongGenerator } from '@/components/SongGenerator';
import { PageHeader } from '@/components/PageHeader';
import { useLanguage } from '@/components/LanguageContext';

export default function GeneratorPage() {
  const { t } = useLanguage();
  
  return (
    <div className="p-8 md:p-12 min-h-screen">
      <PageHeader 
        title="AI Song Generator" 
        description="Manifest lyrics and cover art from the void. Powered by Kilvish Intelligence."
        badge="Creative AI"
      />
      <SongGenerator />
    </div>
  );
}
