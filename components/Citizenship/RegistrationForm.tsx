'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, Calendar, Droplets, Shield, Star, Loader2, CheckCircle2, Camera } from 'lucide-react';
import Image from 'next/image';

const citizenSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  dob: z.string().min(1, 'Date of birth is required'),
  bloodGroup: z.string().optional(),
  rank: z.string().optional(),
});

type CitizenFormValues = z.infer<typeof citizenSchema>;

export function RegistrationForm({ onSuccess }: { onSuccess: (data: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CitizenFormValues>({
    resolver: zodResolver(citizenSchema),
    defaultValues: {
      rank: 'Citizen',
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError('Photo size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: CitizenFormValues) => {
    if (!auth.currentUser) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const citizenData = {
        ...values,
        uid: auth.currentUser.uid,
        registrationDate: new Date().toISOString(),
        photoData: photoBase64,
        qrData: JSON.stringify({
          id: auth.currentUser.uid,
          name: values.fullName,
          rank: values.rank || 'Citizen',
          reg: new Date().toISOString()
        })
      };

      await setDoc(doc(db, 'citizens', auth.currentUser.uid), citizenData);
      onSuccess(citizenData);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl space-y-8"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Citizen Registration</h2>
        <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Enroll in the Kilvish Empire</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center space-y-4 pb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden relative">
                {photoBase64 ? (
                  <Image 
                    src={photoBase64} 
                    alt="Preview" 
                    fill 
                    className="object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-white/20" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Imperial Portrait</p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <User className="w-3 h-3 text-red-500" />
              Full Name
            </label>
            <input
              {...register('fullName')}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors"
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.fullName.message}</p>}
          </div>

          {/* DOB */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-red-500" />
              Date of Birth
            </label>
            <input
              type="date"
              {...register('dob')}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors"
            />
            {errors.dob && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.dob.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Blood Group */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Droplets className="w-3 h-3 text-red-500" />
                Blood Group
              </label>
              <select
                {...register('bloodGroup')}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors appearance-none"
              >
                <option value="" className="bg-zinc-950">Select</option>
                <option value="A+" className="bg-zinc-950">A+</option>
                <option value="A-" className="bg-zinc-950">A-</option>
                <option value="B+" className="bg-zinc-950">B+</option>
                <option value="B-" className="bg-zinc-950">B-</option>
                <option value="O+" className="bg-zinc-950">O+</option>
                <option value="O-" className="bg-zinc-950">O-</option>
                <option value="AB+" className="bg-zinc-950">AB+</option>
                <option value="AB-" className="bg-zinc-950">AB-</option>
              </select>
            </div>

            {/* Rank */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Shield className="w-3 h-3 text-red-500" />
                Desired Rank
              </label>
              <select
                {...register('rank')}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600 transition-colors appearance-none"
              >
                <option value="Citizen" className="bg-zinc-950">Citizen</option>
                <option value="Warrior" className="bg-zinc-950">Warrior</option>
                <option value="Infiltrator" className="bg-zinc-950">Infiltrator</option>
                <option value="Commander" className="bg-zinc-950">Commander</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-black uppercase tracking-widest text-sm transition-all rounded-xl flex items-center justify-center gap-3 group"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Claim Citizenship
            </>
          )}
        </button>
      </form>

      <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-4">
        <Star className="w-4 h-4 text-red-600/50" />
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Andhera Kayam Rahe</span>
        <Star className="w-4 h-4 text-red-600/50" />
      </div>
    </motion.div>
  );
}
