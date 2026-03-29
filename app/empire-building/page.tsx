'use client';

import { motion } from 'motion/react';
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Zap, 
  Target, 
  BarChart3, 
  Layers, 
  Radio, 
  Eye,
  ChevronRight,
  Plus,
  UserCheck,
  Crosshair
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/UserContext';

export default function EmpireBuilding() {
  const { user } = useUser();
  const [resources, setResources] = useState([
    { name: 'AI Compute', value: 85, color: 'bg-red-500' },
    { name: 'Viral Energy', value: 62, color: 'bg-amber-500' },
    { name: 'Algorithmic Favor', value: 45, color: 'bg-purple-500' },
    { name: 'Loyalty Index', value: 92, color: 'bg-emerald-500' },
  ]);

  const tactics = [
    {
      title: 'Hook-First Short Form',
      desc: 'Optimize YouTube Shorts with 10s instant hooks for 2026 algorithm retention.',
      icon: Zap,
      status: 'Active',
      impact: '+24% Reach'
    },
    {
      title: 'Algorithmic Domination',
      desc: 'Convert subscribers into "Citizens of Kilvishstan" to build parasocial loyalty.',
      icon: Target,
      status: 'Deploying',
      impact: '+15% Retention'
    },
    {
      title: 'Hyper-Mashup Audio',
      desc: 'Blend dark synth-wave with traditional Indian instruments for viral Shorts audio.',
      icon: Radio,
      status: 'Researching',
      impact: 'Viral Potential: High'
    },
    {
      title: 'Character Consistency',
      desc: 'Maintain absolute visual identity across all AI-generated formats.',
      icon: Eye,
      status: 'Stable',
      impact: 'Brand Recognition: Max'
    }
  ];

  const stats = [
    { label: 'Subscribers', value: '293', trend: '+12%', icon: Users },
    { label: 'Viral Potential', value: '8.4/10', trend: '+0.5', icon: TrendingUp },
    { label: 'Empire Reach', value: '1.2M', trend: '+18%', icon: BarChart3 },
    { label: 'Active Raids', value: '4', trend: 'Stable', icon: Layers },
  ];

  return (
    <div className="p-8 md:p-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-4"
          >
            <Shield className="w-3 h-3" />
            Strategic Command
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter uppercase"
          >
            Empire <span className="text-red-600">Building</span>
          </motion.h1>
          <p className="text-white/40 text-sm font-medium mt-2">Strategic planning and resource management for the Kilvish Empire.</p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/citizenship" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> Issue ID Cards
          </Link>
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            Export Strategy
          </button>
          <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-5 h-5 text-red-500/50" />
              <span className="text-[10px] font-bold text-emerald-500">{stat.trend}</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
              <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Persona Section */}
      <div className="bg-gradient-to-br from-red-950/20 to-black border border-red-900/30 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white">Your Imperial Status</h2>
              {user?.persona ? (
                <p className="text-sm text-white/60 mt-1">
                  Operative <span className="text-red-500 font-bold">{user.persona.name}</span> • Rank: {user.persona.rank}
                </p>
              ) : (
                <p className="text-sm text-white/60 mt-1">You have not yet forged your identity within the Empire.</p>
              )}
            </div>
          </div>
          <div>
            {user?.persona ? (
              <Link href="/profile" className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2">
                <Crosshair className="w-4 h-4" /> View Directives
              </Link>
            ) : (
              <Link href="/profile" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                Forge Persona
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tactics Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
            <Zap className="w-5 h-5 text-red-600" />
            Active Tactics
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {tactics.map((tactic, i) => (
              <motion.div
                key={tactic.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-red-600/10 text-red-500">
                    <tactic.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
                    tactic.status === 'Active' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                    tactic.status === 'Deploying' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                    'border-white/10 bg-white/5 text-white/40'
                  }`}>
                    {tactic.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2">{tactic.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed mb-6">{tactic.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest">{tactic.impact}</span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Resource Management */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
            <Layers className="w-5 h-5 text-amber-600" />
            Resource Allocation
          </h2>
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] space-y-8">
            {resources.map((res) => (
              <div key={res.name} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{res.name}</span>
                  <span className="text-xs font-bold">{res.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${res.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${res.color}`} 
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Strategic Alert</p>
                <p className="text-[10px] text-amber-400/70 leading-relaxed">
                  Algorithmic Favor is declining. Consider deploying a &quot;Hyper-Mashup&quot; campaign to regain momentum.
                </p>
              </div>
            </div>
            
            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Reallocate Resources
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Timeline */}
      <section className="space-y-6">
        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
          <Target className="w-5 h-5 text-red-600" />
          Empire Campaigns
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">Campaign Name</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">Target Domain</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">Progress</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-white/30">ETA</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Operation: Dark Synth', domain: 'YouTube Shorts', progress: 75, status: 'Active', eta: '2h' },
                { name: 'Cult of Kilvishstan', domain: 'Community', progress: 40, status: 'Deploying', eta: '12h' },
                { name: 'Binary Mantra Raid', domain: 'Streaming', progress: 15, status: 'Queued', eta: '2d' },
                { name: 'Visual Identity Sync', domain: 'Cross-Platform', progress: 100, status: 'Complete', eta: '-' },
              ].map((campaign, i) => (
                <tr key={campaign.name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-6 px-6">
                    <span className="text-sm font-bold uppercase tracking-wider group-hover:text-red-500 transition-colors">{campaign.name}</span>
                  </td>
                  <td className="py-6 px-6">
                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">{campaign.domain}</span>
                  </td>
                  <td className="py-6 px-6 w-48">
                    <div className="flex items-center gap-3">
                      <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600" style={{ width: `${campaign.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-white/60">{campaign.progress}%</span>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
                      campaign.status === 'Active' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                      campaign.status === 'Complete' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                      'border-white/10 bg-white/5 text-white/40'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-6 px-6">
                    <span className="text-[10px] font-mono text-white/30">{campaign.eta}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
