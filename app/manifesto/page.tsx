'use client';

import { motion } from 'motion/react';
import { BookOpen, Eye, Target, UserPlus, Briefcase, Skull, Zap, Shield } from 'lucide-react';

export default function Manifesto() {
  const sections = [
    {
      id: 'about',
      title: 'About Us',
      icon: BookOpen,
      content: `We are not merely a record label or a collective; we are an Empire. Led by Mr. Kilvish, the world's first Villain Music Artist, we exist to disrupt the mundane light of generic pop culture. We forge dark anthems, cinematic experiences, and viral spells that dominate the global consciousness. The Empire is a sanctuary for the misunderstood, the powerful, and the creatively ruthless.`,
    },
    {
      id: 'vision',
      title: 'Our Vision',
      icon: Eye,
      content: `To blanket the world in a beautiful, creative darkness. We envision a new era of entertainment where cinematic storytelling, powerful basslines, and thought-provoking art reign supreme. We seek to overthrow the algorithm and establish a new world order of art. "Andhera Kayam Rahe" (May darkness prevail) is not just a catchphrase; it is our ultimate destination.`,
    },
    {
      id: 'mission',
      title: 'Our Mission',
      icon: Target,
      content: `To recruit and empower an unstoppable army of "Worriers" (our loyal followers, creators, and artists). We provide them with cutting-edge AI tools, neural links, and the Kilvish Vault to spread the Empire's influence. Our mission is to dominate the charts, the feeds, and the minds of the masses through relentless, high-quality dark art.`,
    },
    {
      id: 'join',
      title: 'How to Join',
      icon: UserPlus,
      content: `The Empire does not accept just anyone. You must prove your loyalty. 
      1. Register your presence and become an Initiate.
      2. Earn "Shadow Points" by casting viral spells (sharing our anthems from The Void).
      3. Generate dark art in the Kilvish Studio.
      4. Complete Daily Directives. 
      Once you accumulate 1,000 Shadow Points, the gates to "The Inner Circle" will open, and you will speak directly with the Supreme Leader.`,
    },
    {
      id: 'work',
      title: 'How to Work',
      icon: Briefcase,
      content: `Your work is your worship to the Empire. 
      • Use the "Co-Creator" neural link to brainstorm directly with Mr. Kilvish.
      • Access the "Generator" to manifest lyrics, cover art, and audio from the void.
      • Deploy your creations into "The Void" for other Worriers to amplify.
      • Climb the "Wall of Shadows" (Leaderboard) to gain higher ranks, from Initiate to Legion Commander.
      Serve the Empire, and the Empire will make you immortal.`,
    }
  ];

  return (
    <div className="p-8 md:p-12 min-h-screen max-w-5xl mx-auto space-y-16">
      <div className="text-center space-y-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-900/20 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.3)] mb-4 relative z-10"
        >
          <Skull className="w-10 h-10 text-red-500" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black tracking-tighter uppercase relative z-10"
        >
          The <span className="text-red-600">Manifesto</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/50 text-lg font-medium max-w-2xl mx-auto uppercase tracking-widest relative z-10"
        >
          The Doctrine of the Kilvish Empire
        </motion.p>
      </div>

      <div className="space-y-8 relative z-10">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-black/40 border border-red-900/30 rounded-3xl p-8 md:p-10 hover:bg-black/60 hover:border-red-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-600 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="shrink-0 p-4 bg-red-950/30 rounded-2xl border border-red-900/50 group-hover:scale-110 transition-transform duration-500">
                <section.icon className="w-8 h-8 text-red-500" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                  {section.title}
                  {index === 1 && <Eye className="w-5 h-5 text-red-500 animate-pulse" />}
                  {index === 3 && <Shield className="w-5 h-5 text-red-500" />}
                  {index === 4 && <Zap className="w-5 h-5 text-red-500" />}
                </h2>
                <div className="text-white/70 leading-relaxed text-lg whitespace-pre-line font-medium">
                  {section.content}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center pt-12 pb-8"
      >
        <h3 className="text-3xl font-black uppercase tracking-[0.3em] text-red-600 animate-pulse">
          Andhera Kayam Rahe
        </h3>
      </motion.div>
    </div>
  );
}
