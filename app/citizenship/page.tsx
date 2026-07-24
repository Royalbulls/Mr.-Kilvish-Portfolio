'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AuthGuard } from '@/components/Citizenship/AuthGuard';
import { RegistrationForm } from '@/components/Citizenship/RegistrationForm';
import { CitizenCard } from '@/components/Citizenship/CitizenCard';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Star, UserCheck, ChevronLeft, LayoutDashboard, LogOut, Search, ShieldAlert, ShieldCheck, Loader2, Camera, X, QrCode } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Scanner Component
function ScannerModal({ onClose, onScan }: { onClose: () => void, onScan: (data: string) => void }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [onScan]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
    >
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-3xl w-full max-w-md space-y-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5 text-white/40" />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-red-600/10 border border-red-600/20 mb-2">
            <Camera className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter">Imperial Scanner</h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Scan a Citizen&apos;s QR Code for Verification</p>
        </div>

        <div id="reader" className="overflow-hidden rounded-2xl border border-white/10 bg-black"></div>

        <p className="text-[10px] font-medium text-white/40 text-center uppercase tracking-widest leading-relaxed">
          Position the QR code within the frame to authenticate the subject.
        </p>
      </div>
    </motion.div>
  );
}

export default function CitizenshipPage() {
  const [citizen, setCitizen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const fetchCitizen = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'citizens', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCitizen(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching citizen:', err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCitizen();
      } else {
        setCitizen(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const docRef = doc(db, 'citizens', searchId.trim());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSearchResult(docSnap.data());
      } else {
        setSearchError('No citizen found with this Imperial UID.');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError('Verification failed. The void is unresponsive.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleScan = async (decodedText: string) => {
    setShowScanner(false);
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      let uid = '';
      try {
        // Try to parse as JSON first (our format)
        const data = JSON.parse(decodedText);
        uid = data.id || data.uid;
      } catch {
        // If not JSON, assume it's the raw UID
        uid = decodedText;
      }

      if (!uid) throw new Error('Invalid QR data');

      const docRef = doc(db, 'citizens', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSearchResult(docSnap.data());
        setSearchId(uid);
      } else {
        setSearchError('No citizen found with this scanned data.');
      }
    } catch (err) {
      console.error('Scan verification failed:', err);
      setSearchError('Invalid QR code or verification failed.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AuthGuard>
      <AnimatePresence>
        {showScanner && (
          <ScannerModal 
            onClose={() => setShowScanner(false)} 
            onScan={handleScan} 
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-black text-white p-8 md:p-12 space-y-12">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-500 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Command Center
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                {auth.currentUser?.displayName || 'Imperial Subject'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-red-600/10 hover:border-red-600/20 transition-all text-white/40 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-4 rounded-2xl bg-red-600/10 border border-red-600/20 mb-4"
          >
            <Shield className="w-12 h-12 text-red-600" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Kilvishtan <span className="text-red-600">Citizenship</span>
          </h1>
          <p className="text-lg text-white/40 font-medium uppercase tracking-widest max-w-2xl mx-auto">
            Official digital identification for the citizens of the Kilvish Empire. 
            Claim your place in the new world order.
          </p>
        </section>

        {/* Main Content */}
        <section className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {citizen ? (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-12"
                >
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/10 border border-emerald-600/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                      <UserCheck className="w-3 h-3" />
                      Citizenship Verified
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Your Imperial Identity</h2>
                  </div>
                  
                  <CitizenCard citizen={citizen} />

                  <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {[
                      { title: 'Access Level', value: citizen.rank || 'Standard', icon: Shield },
                      { title: 'Sector', value: 'Sector 7-G', icon: LayoutDashboard },
                      { title: 'Status', value: 'Active', icon: Star }
                    ].map((stat, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2">
                        <stat.icon className="w-5 h-5 text-red-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.title}</p>
                        <p className="text-lg font-black uppercase tracking-tight">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RegistrationForm onSuccess={setCitizen} />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </section>

        {/* Global Verification Section */}
        <section className="max-w-xl mx-auto pt-20">
          <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tighter">Imperial Verification Center</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Verify any citizen by their Imperial UID</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter Imperial UID..."
                  className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="p-3 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 rounded-xl transition-all flex items-center justify-center"
                title="Scan QR Code"
              >
                <QrCode className="w-5 h-5 text-red-500" />
              </button>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-950 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3 text-red-500" />}
                Verify
              </button>
            </form>

            <AnimatePresence mode="wait">
              {searchError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center gap-3"
                >
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{searchError}</p>
                </motion.div>
              )}

              {searchResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 rounded-xl bg-emerald-600/10 border border-emerald-600/20 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Citizen Authenticated</p>
                      <p className="text-lg font-black uppercase tracking-tight">{searchResult.fullName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-600/10">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Rank</p>
                      <p className="text-xs font-bold text-white">{searchResult.rank}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Status</p>
                      <p className="text-xs font-bold text-emerald-500">Active Citizen</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto pt-20 pb-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-6 opacity-20">
            <Star className="w-4 h-4" />
            <div className="h-px w-20 bg-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Kilvish Empire</span>
            <div className="h-px w-20 bg-white" />
            <Star className="w-4 h-4" />
          </div>
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
            © 2026 Kilvishtan Digital Administration. All rights reserved. 
            Unauthorized duplication of citizenship is punishable by soul purification.
          </p>
        </footer>
      </div>
    </AuthGuard>
  );
}
