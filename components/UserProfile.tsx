'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from './UserContext';
import { User, Shield, Lock, Unlock, LogOut, Edit3, Save, X, Sparkles, Crosshair, Skull } from 'lucide-react';
import { audio } from '@/lib/audio';

export function UserProfile() {
  const { user, isAuthReady, login, signup, loginWithGoogle, logout, updateProfile, createPersona } = useUser();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [personaName, setPersonaName] = useState('');
  const [personaRole, setPersonaRole] = useState('Empire Strategist');
  const [personaSkill, setPersonaSkill] = useState('');

  const handleGoogleLogin = async () => {
    try {
      audio.playClick();
      await loginWithGoogle();
    } catch (error) {
      console.error('OAuth error:', error);
      alert('Failed to initiate Google Login.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signup(email, password, username || email.split('@')[0]);
      }
    } catch (error: any) {
      alert(error.message || "Authentication failed.");
    }
  };

  const handleSaveProfile = () => {
    audio.playClick();
    updateProfile({ bio: editBio });
    setIsEditing(false);
  };

  const handleTogglePrivacy = () => {
    audio.playClick();
    updateProfile({ isPublic: !user?.isPublic });
  };

  const handleCreatePersona = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playComplete();
    createPersona({
      name: personaName,
      role: personaRole,
      rank: 'Initiate',
      specialSkill: personaSkill,
    });
    setIsCreatingPersona(false);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)]" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl shadow-red-900/20 text-center"
        >
          <p className="text-white/60 uppercase tracking-widest text-xs font-bold animate-pulse">Initializing Neural Link...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)]" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-black/80 border border-red-900/30 p-8 rounded-2xl backdrop-blur-xl relative z-10"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center">
              <Skull className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-center mb-2">
            {isLoginMode ? 'Enter the Shadows' : 'Join the Empire'}
          </h2>
          <p className="text-center text-white/40 text-sm mb-8">
            {isLoginMode ? 'Authenticate your identity.' : 'Pledge your allegiance to Mr. Kilvish.'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Codename</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="Enter your alias"
                  required={!isLoginMode}
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Comm-Link (Email)</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Access Code (Password)</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-sm transition-all mt-6"
            >
              {isLoginMode ? 'Authenticate' : 'Pledge Allegiance'}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-white/40 text-xs uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
            <button 
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-4 bg-white hover:bg-gray-200 text-black rounded-xl font-black uppercase tracking-widest text-sm transition-all mt-2 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsLoginMode(!isLoginMode); audio.playClick(); }}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              {isLoginMode ? "Don't have an identity? Join the Empire" : "Already pledged? Authenticate"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <div className="bg-black/40 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <User className="w-12 h-12 text-white/20" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">{user.username}</h1>
                <p className="text-white/40 text-sm">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleTogglePrivacy}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                    user.isPublic 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-white/10 text-white/60 border border-white/20'
                  }`}
                >
                  {user.isPublic ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {user.isPublic ? 'Public Profile' : 'Private Profile'}
                </button>
                <button 
                  onClick={() => { logout(); audio.playClick(); }}
                  className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Biography</p>
                {!isEditing ? (
                  <button onClick={() => { setIsEditing(true); setEditBio(user.bio); audio.playClick(); }} className="text-white/40 hover:text-white">
                    <Edit3 className="w-3 h-3" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white"><X className="w-3 h-3" /></button>
                    <button onClick={handleSaveProfile} className="text-emerald-500 hover:text-emerald-400"><Save className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
              {isEditing ? (
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500/50 resize-none h-24"
                />
              ) : (
                <p className="text-sm text-white/70 leading-relaxed">{user.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Worriers of Mr. Kilvish Empire Section */}
      <div className="bg-gradient-to-br from-red-950/20 to-black border border-red-900/30 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-red-500">Worriers of Mr. Kilvish Empire</h2>
          </div>

          {!user.persona ? (
            <div className="text-center py-12">
              <p className="text-white/60 mb-6 max-w-lg mx-auto">
                You have not yet forged your identity within the Empire. Create your persona to join the ranks of the Worriers of Mr. Kilvish Empire and participate in the grand design.
              </p>
              {!isCreatingPersona ? (
                <button 
                  onClick={() => { setIsCreatingPersona(true); audio.playClick(); }}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                >
                  Forge Persona
                </button>
              ) : (
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleCreatePersona}
                  className="max-w-md mx-auto text-left space-y-4 bg-black/60 p-6 rounded-2xl border border-red-900/50"
                >
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-red-500/70 mb-2">Worrier Name</label>
                    <input 
                      type="text" 
                      value={personaName}
                      onChange={(e) => setPersonaName(e.target.value)}
                      className="w-full bg-black border border-red-900/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="e.g. Shadow Weaver"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-red-500/70 mb-2">Role</label>
                    <select 
                      value={personaRole}
                      onChange={(e) => setPersonaRole(e.target.value)}
                      className="w-full bg-black border border-red-900/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                    >
                      <option value="Empire Strategist">Empire Strategist</option>
                      <option value="Resource Gatherer">Resource Gatherer</option>
                      <option value="Legion Commander">Legion Commander</option>
                      <option value="Infiltrator">Infiltrator</option>
                      <option value="Propagandist">Propagandist</option>
                      <option value="Sonic Architect">Sonic Architect</option>
                      <option value="Void Walker">Void Walker</option>
                      <option value="Enforcer">Enforcer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-red-500/70 mb-2">Special Skill</label>
                    <input 
                      type="text" 
                      value={personaSkill}
                      onChange={(e) => setPersonaSkill(e.target.value)}
                      className="w-full bg-black border border-red-900/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="e.g. Subliminal Audio Manipulation"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsCreatingPersona(false)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                    >
                      Initialize
                    </button>
                  </div>
                </motion.form>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 border border-red-900/30 rounded-2xl p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500/50 mb-1">Operative Designation</p>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{user.persona.name}</h3>
                  </div>
                  <div className="px-3 py-1 bg-red-950/50 border border-red-900/50 rounded-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Rank: {user.persona.rank}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Role</p>
                    <p className="text-sm font-bold text-white/80">{user.persona.role}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Special Skill</p>
                    <p className="text-sm font-bold text-white/80">{user.persona.specialSkill}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Shadow Points</p>
                    <p className="text-xs font-black text-red-500">{user.shadowPoints || 0}</p>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-900 to-red-500"
                      style={{ width: `${Math.min(((user.shadowPoints || 0) / 1000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-red-900/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4">
                <Crosshair className="w-12 h-12 text-red-500/20" />
                <div>
                  <h4 className="font-black uppercase tracking-widest text-sm mb-2">Current Directive</h4>
                  <p className="text-white/50 text-sm">Awaiting orders from High Command. Maintain cover and continue spreading the sonic virus.</p>
                </div>
                <button className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all w-full mt-4">
                  Request Assignment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
