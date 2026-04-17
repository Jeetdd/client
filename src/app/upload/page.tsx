"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Upload, CheckCircle2, AlertCircle, Loader2, ShoppingCart, X, ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://server-hw5w.onrender.com';

interface DetectedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  isAvailable: boolean;
  price: number | null;
  image: string | null;
  matchedMedicine: any | null;
}

export default function UploadPage() {
  const [files, setFiles] = useState<{ id: string; file: File; preview: string; isAnalyzing: boolean; error: string | null; detectedMedicines: DetectedMedicine[] }[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMeds, setCurrentMeds] = useState<DetectedMedicine[]>([]);
  const [selectedMeds, setSelectedMeds] = useState<number[]>([]);
  const { addItem, setPrescriptionUrl } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleFiles = useCallback(async (newFiles: FileList | null) => {
    if (!newFiles) return;

    const uploaded = Array.from(newFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      isAnalyzing: false,
      error: null,
      detectedMedicines: []
    }));

    setFiles(prev => [...prev, ...uploaded]);
    
    // Automatically analyze the first one Added or all
    for (const item of uploaded) {
      await analyzeWithAPI(item.file, item.id);
    }
  }, []);

  const analyzeWithAPI = async (selectedFile: File, id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, isAnalyzing: true, error: null } : f));

    try {
      const formData = new FormData();
      formData.append('prescription', selectedFile);
      if (user?.email) {
        formData.append("email", user.email);
        formData.append("name", user.name);
      }

      const response = await fetch(`${API_BASE}/api/prescriptions/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Analysis failed');
      }

      const data = await response.json();
      
      setFiles(prev => prev.map(f => f.id === id ? { 
        ...f, 
        isAnalyzing: false, 
        detectedMedicines: data.detectedMedicines || [] 
      } : f));

      if (data.detectedMedicines?.length > 0) {
        setCurrentMeds(data.detectedMedicines);
        setPrescriptionUrl(`${API_BASE}${data.imageUrl}`);
        setSelectedMeds(data.detectedMedicines.map((m: any, i: number) => m.isAvailable && m.price ? i : -1).filter((i: number) => i !== -1));
        setShowModal(true);
      }
    } catch (err: any) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, isAnalyzing: false, error: err.message } : f));
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleAddToCart = () => {
    selectedMeds.forEach(index => {
      const med = currentMeds[index];
      addItem({
        medicineId: med.matchedMedicine?.id || undefined,
        name: med.name,
        price: med.price || 0,
        quantity: med.quantity || 1,
        image: med.image || undefined,
        dosage: med.dosage,
        frequency: med.frequency,
      });
    });
    setShowModal(false);
    router.push('/cart');
  };

  return (
    <main className="min-h-screen bg-slate-950 pt-32 pb-20 relative overflow-hidden">
      {/* Ambient Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[160px] -z-10 opacity-30 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] -z-10 opacity-20 -translate-x-1/2 translate-y-1/2" />

      <Navbar />
      
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-500/10 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 border border-indigo-500/20 backdrop-blur-md">
            Digital Diagnostics
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white">
            Upload <span className="text-indigo-500 italic font-medium">Prescriptions.</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto italic">
            "Clinical-grade AI analysis for absolute medication accuracy."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Upload & Instructions */}
          <div className="lg:col-span-12 space-y-10">
            <div 
              className="premium-card relative group cursor-pointer p-2 relative overflow-hidden h-80 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 hover:border-indigo-500/50 transition-all bg-white/[0.02]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
            >
              <input 
                type="file" 
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
              <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-500 ring-1 ring-white/5">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-white mb-2">Deploy Files.</h3>
              <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">Drop JPG, PNG or PDF (Max 10MB per file)</p>
              
              <div className="absolute top-6 right-6 p-4 rounded-2xl bg-white/5 border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
              </div>
            </div>

            {/* Evidence List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {files.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="premium-card p-6 bg-slate-900/40 relative group overflow-hidden"
                >
                  <button 
                    onClick={() => removeFile(item.id)}
                    className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-black/20 mb-6 relative">
                    <img src={item.preview} className="w-full h-full object-cover" alt="" />
                    {item.isAnalyzing && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Analyzing...</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-black truncate text-sm uppercase tracking-wider">{item.file.name}</h4>
                    {item.error ? (
                      <p className="text-rose-500 text-xs font-bold leading-tight">{item.error}</p>
                    ) : item.detectedMedicines.length > 0 ? (
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-wider">{item.detectedMedicines.length} Detected</span>
                        <button 
                          onClick={() => {
                            setCurrentMeds(item.detectedMedicines);
                            setSelectedMeds(item.detectedMedicines.map((m, i) => m.isAvailable && m.price ? i : -1).filter(i => i !== -1));
                            setShowModal(true);
                          }}
                          className="text-white bg-indigo-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-colors"
                        >
                          View Output
                        </button>
                      </div>
                    ) : !item.isAnalyzing && (
                      <button 
                        onClick={() => analyzeWithAPI(item.file, item.id)}
                        className="w-full py-2 bg-white/5 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all"
                      >
                        Start Scan
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Redesigned Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-12 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-5xl font-black text-white tracking-tighter">Clinical Report.</h2>
                  <p className="text-slate-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">Verified by SkinShop AI</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-4 bg-white/5 text-slate-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-8">
                {currentMeds.map((med, i) => (
                  <div 
                    key={i}
                    onClick={() => setSelectedMeds(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                    className={`group relative p-8 rounded-[3rem] border transition-all cursor-pointer overflow-hidden ${
                      selectedMeds.includes(i) ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-white/[0.02] border-white/5 hover:border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex gap-10">
                        <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                          selectedMeds.includes(i) ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'border-white/10 group-hover:border-indigo-500/50'
                        }`}>
                          {selectedMeds.includes(i) && <Check className="w-8 h-8 stroke-[4px]" />}
                        </div>
                        <div>
                          <h4 className="text-3xl font-black text-white tracking-tight leading-none mb-3">{med.name}</h4>
                          <p className="text-slate-400 text-lg font-medium">{med.dosage} • {med.frequency} • {med.duration || 'Standard Duration'}</p>
                          {!med.isAvailable && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                              <AlertCircle className="w-4 h-4" />
                              External Fulfillment Required
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black text-white tracking-tighter mb-2">{med.price ? `₹${med.price}` : 'TBD'}</p>
                        <p className="text-indigo-500 text-sm font-black uppercase tracking-[0.2em]">Quantity: {med.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-12 bg-white/[0.02] flex items-center justify-between border-t border-white/5 px-20">
                <div className="space-y-1">
                  <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em]">Ready to Dispense</p>
                  <p className="text-4xl font-black text-white tracking-tighter">{selectedMeds.length} Preparations</p>
                </div>
                <div className="flex gap-6">
                  <button onClick={() => setShowModal(false)} className="px-12 py-6 rounded-[2.5rem] text-xl font-black text-slate-400 bg-white/5 hover:bg-white/10 transition-all">Cancel</button>
                  <button 
                    onClick={handleAddToCart}
                    disabled={selectedMeds.length === 0}
                    className="px-16 py-6 rounded-[2.5rem] text-xl font-black bg-indigo-500 text-white hover:bg-indigo-400 transition-all shadow-[0_20px_60px_rgba(99,102,241,0.3)] disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
  );
}
