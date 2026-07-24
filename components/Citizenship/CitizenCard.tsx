'use client';

import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Download, Shield, Star, MapPin, Calendar, Droplets, Maximize2, X, CheckCircle2, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface CitizenData {
  fullName: string;
  dob: string;
  bloodGroup?: string;
  rank?: string;
  registrationDate: string;
  uid: string;
  qrData?: string;
  photoData?: string;
}

export function CitizenCard({ citizen }: { citizen: CitizenData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `Kilvish_Citizenship_${citizen.fullName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download card:', err);
    }
  };

  const verifyCard = async () => {
    setIsVerifying(true);
    setVerificationStatus('idle');
    
    try {
      // Simulate network delay for "imperial processing"
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const docRef = doc(db, 'citizens', citizen.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Verify core fields match
        const isValid = data.uid === citizen.uid && data.fullName === citizen.fullName;
        setVerificationStatus(isValid ? 'valid' : 'invalid');
      } else {
        setVerificationStatus('invalid');
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setVerificationStatus('invalid');
    } finally {
      setIsVerifying(false);
    }
  };

  const qrValue = citizen.qrData || JSON.stringify({
    id: citizen.uid,
    name: citizen.fullName,
    rank: citizen.rank || 'Citizen',
    reg: citizen.registrationDate
  });

  return (
    <div className="space-y-8 flex flex-col items-center w-full overflow-hidden">
      <div className="w-full flex justify-center overflow-hidden py-4">
        <div 
          ref={cardRef}
          className="relative w-[400px] h-[250px] rounded-2xl overflow-hidden bg-zinc-950 border border-red-900/30 shadow-2xl shadow-red-950/20 p-6 flex flex-col justify-between shrink-0 origin-center sm:scale-100 scale-[0.8] sm:my-0 -my-8"
        >
          {/* Verification Badge Overlay */}
          <AnimatePresence>
            {verificationStatus === 'valid' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 right-4 z-50 pointer-events-none"
              >
                <div className="px-2 py-1 border-2 border-emerald-500/50 rounded-lg bg-emerald-950/40 backdrop-blur-sm flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Verified</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        {/* Background Accents */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-900/10 rounded-full blur-3xl" />
        
        {/* Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 leading-none">Empire of</h3>
              <h2 className="text-lg font-black uppercase tracking-tighter text-white leading-none">Kilvishtan</h2>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Official ID</span>
            <span className="text-[10px] font-mono text-red-500/80">#{citizen.uid.slice(-8).toUpperCase()}</span>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex gap-6 relative z-10">
          {/* Photo */}
          <div className="w-24 h-24 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden relative group">
            {citizen.photoData ? (
              <Image 
                src={citizen.photoData} 
                alt="Citizen" 
                fill 
                className="object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Star className="w-8 h-8 text-white/10" />
              </>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Full Name</label>
              <p className="text-sm font-black uppercase tracking-tight text-white">{citizen.fullName}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Rank</label>
                <p className="text-[10px] font-bold uppercase text-red-500">{citizen.rank || 'Citizen'}</p>
              </div>
              <div>
                <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Blood Group</label>
                <p className="text-[10px] font-bold uppercase text-white">{citizen.bloodGroup || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">DOB</label>
                <p className="text-[10px] font-bold uppercase text-white/80">{citizen.dob}</p>
              </div>
              <div>
                <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest block">Issued</label>
                <p className="text-[10px] font-bold uppercase text-white/80">{new Date(citizen.registrationDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQRModal(true)}
            className="p-2 bg-white rounded-lg self-end cursor-pointer group relative"
          >
            <QRCodeSVG 
              value={qrValue} 
              size={60}
              level="H"
              includeMargin={false}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-white/5 relative z-10">
          <div className="flex items-center gap-1">
            <MapPin className="w-2 h-2 text-red-500" />
            <span className="text-[6px] font-bold text-white/30 uppercase tracking-widest">Global Jurisdiction: Sector 7-G</span>
          </div>
          <div className="text-[8px] font-black italic text-red-600/50 uppercase tracking-widest">
            Andhera Kayam Rahe
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full space-y-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Imperial QR Identity</h3>
                <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>

              <div className="p-6 bg-white rounded-2xl inline-block shadow-2xl shadow-red-600/20">
                <QRCodeSVG 
                  value={qrValue} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-black uppercase tracking-tight text-white">{citizen.fullName}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-red-500">{citizen.rank || 'Citizen'}</p>
                <p className="text-[10px] font-mono text-white/20">UID: {citizen.uid}</p>
              </div>

              <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em] leading-relaxed">
                This QR code contains your official citizenship data for verification within the Kilvish Empire.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <div className="flex flex-wrap justify-center gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={downloadCard}
        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
      >
        <Download className="w-4 h-4 text-red-500" />
        Download Digital ID
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={verifyCard}
        disabled={isVerifying}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
          verificationStatus === 'valid' 
            ? 'bg-emerald-600/20 border-emerald-600/30 text-emerald-500' 
            : verificationStatus === 'invalid'
            ? 'bg-red-600/20 border-red-600/30 text-red-500'
            : 'bg-zinc-900 hover:bg-zinc-800 text-white border-white/10'
        }`}
      >
        {isVerifying ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : verificationStatus === 'valid' ? (
          <ShieldCheck className="w-4 h-4" />
        ) : verificationStatus === 'invalid' ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-red-500" />
        )}
        {isVerifying ? 'Verifying...' : verificationStatus === 'valid' ? 'Identity Verified' : verificationStatus === 'invalid' ? 'Invalid ID' : 'Verify Identity'}
      </motion.button>
    </div>
    </div>
  );
}
