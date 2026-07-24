'use client';

import { motion } from 'motion/react';
import { Shield, Eye, Target, Compass, ChevronLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function InnerDominionPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center relative z-50">
        <Link 
          href="/empire-building"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-500 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Outer Construction
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Kilvishtan</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-20 space-y-32">
        {/* Hero Section */}
        <section className="space-y-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="inline-block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full" />
              <Eye className="w-16 h-16 text-white relative z-10" />
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none"
            >
              Kilvishtan
              <br />
              <span className="text-white/20">The Inner Dominion</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-lg md:text-xl text-white/40 font-medium uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed"
            >
              “Kilvishtan” is not a place on any map. It is the realm within you—the kingdom of awareness where thoughts arise, identities form, and illusions dissolve.
            </motion.p>
          </div>
        </section>

        {/* The Space Where... */}
        <section className="grid md:grid-cols-3 gap-12">
          {[
            { 
              icon: Target, 
              title: "The Ego", 
              text: "The ego builds its temporary throne, seeking validation in the shifting sands of time." 
            },
            { 
              icon: Compass, 
              title: "The Mind", 
              text: "The mind creates stories of “I” and “mine”, weaving a tapestry of attachment and desire." 
            },
            { 
              icon: Eye, 
              title: "The Self", 
              text: "And the deeper self silently observes it all, untouched by the storms of the surface." 
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="space-y-4 text-center md:text-left"
            >
              <item.icon className="w-6 h-6 text-red-600 mx-auto md:mx-0" />
              <h3 className="text-sm font-black uppercase tracking-widest">{item.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed font-medium">{item.text}</p>
            </motion.div>
          ))}
        </section>

        {/* The Invitation */}
        <section className="relative py-32 border-y border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent" />
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-black uppercase tracking-tighter">The Outer Construction</h2>
              <p className="text-white/60 leading-relaxed italic">
                What you call “Empire Building” belongs to the visible world—the act of constructing power, identity, success. It represents achievement, control, structure, and ambition.
              </p>
              <p className="text-sm text-white/30 uppercase tracking-widest font-bold">
                But every empire, no matter how grand, exists in time… and what is built in time must eventually change.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-8 pt-12">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Kilvishtan asks</p>
                <p className="text-lg font-black uppercase tracking-tight">Who am I, beyond all I build?</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Empire Building asks</p>
                <p className="text-lg font-black uppercase tracking-tight">What can I create and control?</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final Invitation */}
        <section className="text-center space-y-12 pb-40">
          <div className="space-y-6">
            <h2 className="text-4xl font-black uppercase tracking-tighter">The Invitation</h2>
            <div className="max-w-xl mx-auto space-y-4 text-white/60 leading-relaxed">
              <p>Do not reject the empire… but do not get lost in it.</p>
              <p className="text-xl font-bold text-white">Build, create, rise—yes.</p>
              <p>But return often to Kilvishtan, the silent kingdom within.</p>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl"
          >
            <p className="text-2xl font-black uppercase tracking-tighter leading-tight">
              For the one who knows their inner realm…
              <br />
              <span className="text-red-600">is never enslaved by the outer one.</span>
            </p>
          </motion.div>

          <div className="pt-20 flex items-center justify-center gap-6 opacity-20">
            <Sparkles className="w-4 h-4" />
            <div className="h-px w-20 bg-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Andhera Kayam Rahe</span>
            <div className="h-px w-20 bg-white" />
            <Sparkles className="w-4 h-4" />
          </div>
        </section>
      </main>

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-zinc-900/20 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
