'use client';

import { Discography } from '@/components/Discography';
import { PageHeader } from '@/components/PageHeader';
import { useLanguage } from '@/components/LanguageContext';
import { SignatureStyle } from '@/components/SignatureStyle';

export default function MusicPage() {
  const { t } = useLanguage();
  
  return (
    <div className="p-8 md:p-12 min-h-screen">
      <PageHeader 
        title={t('navMusic')} 
        description="Explore the sonic legacy of the multiverse. From singles to full-length anthems."
        badge="Official Discography"
      />
      <SignatureStyle />
      <Discography />
    </div>
  );
}
