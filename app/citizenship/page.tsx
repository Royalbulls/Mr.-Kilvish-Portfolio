'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, 
  Shield, 
  QrCode, 
  Fingerprint, 
  Download, 
  Share2, 
  Zap,
  Star,
  Globe
} from 'lucide-react';
import Image from 'next/image';

export default function CitizenshipPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Citizen');
  const [isGenerated, setIsGenerated] = useState(false);
  const [idNumber] = useState(() => `KV-${Math.floor(100000 + Math.random() * 900000)}`);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsGenerated(true);
    }
  };

  return (
    <div className="p-8 md:p-12 min-h-screen space-y-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold tracking-widest uppercase"
          >
            <UserCheck className="w-3 h-3" />
            Imperial Registry
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
            Kilvishtan <span className="text-red-600">Citizenship</span>
          </h1>
          <p className="text-white/40 text-sm font-medium max-w-xl mx-auto">
            Official digital identification for the citizens of the Kilvish Empire. 
            Claim your place in the new world order.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Registration Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-wider">Registration</h2>
              <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Enter your details for the Imperial Database</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Designated Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all appearance-none"
                >
                  <option value="Citizen" className="bg-zinc-900">Citizen</option>
                  <option value="Infiltrator" className="bg-zinc-900">Infiltrator</option>
                  <option value="Loyalist" className="bg-zinc-900">Loyalist</option>
                  <option value="Prophet" className="bg-zinc-900">Prophet</option>
                  <option value="Empire Guard" className="bg-zinc-900">Empire Guard</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                Generate Digital ID
              </button>
            </form>

            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-white/20">
                <Shield className="w-4 h-4" />
                <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Verified by Kilvish Intelligence</span>
              </div>
            </div>
          </motion.div>

          {/* ID Card Preview */}
          <div className="perspective-1000">
            <AnimatePresence mode="wait">
              {isGenerated ? (
                <motion.div
                  key="id-card"
                  initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="relative aspect-[1.6/1] w-full rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-zinc-900 via-black to-red-950/40 shadow-2xl shadow-red-900/20"
                >
                  {/* Card Background Patterns */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.2),transparent_70%)]" />
                    <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  </div>

                  {/* Card Content */}
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.3em]">Empire of Kilvishtan</p>
                        <h3 className="text-lg font-black uppercase tracking-tighter">Digital Identity</h3>
                      </div>
                      <div className="w-10 h-10 relative">
                        <div className="absolute inset-0 bg-red-600 blur-lg opacity-20 animate-pulse" />
                        <Globe className="w-full h-full text-red-600 relative z-10" />
                      </div>
                    </div>

                    <div className="flex gap-6 items-center">
                      <div className="w-24 h-24 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden relative grayscale">
                        <Image 
                          src={`https://picsum.photos/seed/${name}/200/200`} 
                          alt="Profile" 
                          fill 
                          className="object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-1 left-0 right-0 text-center">
                          <span className="text-[6px] font-bold uppercase tracking-widest text-white/40">Biometric Scan</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-[6px] font-black text-white/30 uppercase tracking-widest">Full Name</p>
                          <p className="text-sm font-bold uppercase tracking-wider text-white">{name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[6px] font-black text-white/30 uppercase tracking-widest">Role</p>
                            <p className="text-[10px] font-bold uppercase text-red-500">{role}</p>
                          </div>
                          <div>
                            <p className="text-[6px] font-black text-white/30 uppercase tracking-widest">ID Number</p>
                            <p className="text-[10px] font-mono text-white/60">{idNumber}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3].map(i => <Star key={i} className="w-2 h-2 text-red-600 fill-red-600" />)}
                        </div>
                        <p className="text-[6px] font-medium text-white/20 max-w-[140px]">
                          This document is property of the Kilvish Empire. Unauthorized duplication is punishable by digital erasure.
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded-sm">
                        <QrCode className="w-8 h-8 text-black" />
                      </div>
                    </div>
                  </div>

                  {/* Holographic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="aspect-[1.6/1] w-full rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center space-y-4 text-white/20"
                >
                  <Fingerprint className="w-12 h-12 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Biometric Data</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isGenerated && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex gap-4"
              >
                <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download ID
                </button>
                <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" /> Share Access
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <section className="pt-20 grid md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Global Access', 
              desc: 'Unrestricted entry to all Kilvishstan digital territories and physical outposts.',
              icon: Globe 
            },
            { 
              title: 'Imperial Protection', 
              desc: 'Priority defense from the Kilvish Intelligence network against external threats.',
              icon: Shield 
            },
            { 
              title: 'Supreme Rewards', 
              desc: 'Exclusive access to multiversal tracks, prophecies, and high-level empire tools.',
              icon: Zap 
            }
          ].map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4"
            >
              <benefit.icon className="w-6 h-6 text-red-500/50" />
              <h3 className="text-sm font-bold uppercase tracking-wider">{benefit.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
}
