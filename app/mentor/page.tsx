'use client';

import { MusicMentor } from '@/components/MusicMentor';
import { PageHeader } from '@/components/PageHeader';

export default function MentorPage() {
  return (
    <div className="p-8 md:p-12 min-h-screen">
      <PageHeader 
        title="AI Music Production Mentor" 
        description="Get expert guidance on arrangement, instrumentation, and mixing for your tracks."
        badge="Production AI"
      />
      <div className="max-w-6xl mx-auto">
        <MusicMentor />
      </div>
    </div>
  );
}
