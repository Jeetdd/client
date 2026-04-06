"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Upload, CheckCircle2, AlertCircle, Loader2, ShoppingCart, X, ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';

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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [detectedMedicines, setDetectedMedicines] = useState<DetectedMedicine[]>([]);
  const [selectedMeds, setSelectedMeds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { addItem, setPrescriptionUrl } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Select all available medicines by default when they are detected
    if (detectedMedicines.length > 0) {
      const availableIndices = detectedMedicines
        .map((m, i) => m.isAvailable && m.price ? i : -1)
        .filter(i => i !== -1);
      setSelectedMeds(availableIndices);
    }
  }, [detectedMedicines]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);

    // Send to backend API
    await analyzeWithAPI(selectedFile);
  }, []);

  const analyzeWithAPI = async (selectedFile: File) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('prescription', selectedFile);

      const response = await fetch(`${API_BASE}/api/prescriptions/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to analyze prescription');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.detectedMedicines && data.detectedMedicines.length > 0) {
        setDetectedMedicines(data.detectedMedicines);
        setPrescriptionUrl(`${API_BASE}${data.imageUrl}`);
        setShowModal(true);
      } else {
        setError(data.message || 'No medicines could be detected. Please upload a clearer prescription image.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to analyze prescription. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleMedSelection = (index: number) => {
    setSelectedMeds(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleAddToCart = () => {
    const medsToAdd = selectedMeds.map(index => detectedMedicines[index]);
    medsToAdd.forEach(med => {
      addItem({
        name: med.name,
        price: med.price || 0, // Fallback to 0 if not matched in catalogue
        quantity: med.quantity || 1,
        image: med.image || undefined,
        dosage: med.dosage,
        frequency: med.frequency,
      });
    });
    setShowModal(false);
    router.push('/cart');
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowed.includes(droppedFile.type)) {
        setError('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      setFile(droppedFile);
      setError(null);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(droppedFile);
      analyzeWithAPI(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-8 text-center mb-12">
          <h1 className="text-4xl font-bold font-outfit">Upload Prescription</h1>
          <p className="text-muted-foreground text-lg">
            Our AI will scan your prescription and allow you to select which medicines to add.
          </p>
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3 text-sm text-primary max-w-2xl mx-auto">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            Your prescription data is stored securely and used only to process your order.
          </div>
        </div>

        {/* Upload Zone */}
        <div
          className="relative group cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            accept=".jpg,.jpeg,.png,.pdf"
          />
          <div className="border-2 border-dashed border-border group-hover:border-primary/50 transition-colors rounded-[2.5rem] p-20 flex flex-col items-center gap-6 bg-secondary/30">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              {isAnalyzing ? <Loader2 className="w-12 h-12 animate-spin" /> : <Upload className="w-12 h-12" />}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold mb-2">
                {file ? file.name : "Click or drag & drop to upload"}
              </p>
              <p className="text-muted-foreground">Supports PDF, JPG, PNG formats (max 10MB)</p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {preview && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-[2.5rem] overflow-hidden border border-border bg-secondary/30 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-bold text-lg">Uploaded Prescription</p>
            </div>
            <div className="relative group">
              <img src={preview} alt="Prescription preview" className="max-h-[500px] mx-auto rounded-2xl object-contain shadow-2xl border border-white/10" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
                <button className="px-6 py-3 bg-white text-black rounded-full font-bold">Zoom View</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-start gap-4"
          >
            <div className="p-2 bg-red-500/20 rounded-xl mt-1">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-400">Analysis Failed</p>
              <p className="text-red-400/80 mt-1">{error}</p>
              <button 
                onClick={() => {
                  setFile(null);
                  setError(null);
                  setPreview(null);
                }}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
            >
              <div className="relative">
                <Loader2 className="w-24 h-24 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-primary/50" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-bold font-outfit">Analyzing your prescription...</h3>
                <p className="text-muted-foreground text-lg">Our AI is extracting medication details with 99.2% accuracy</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detection Pop-up Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setShowModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-3xl bg-background rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
              >
                <div className="p-10 border-b border-border flex items-center justify-between bg-secondary/20">
                  <div>
                    <h2 className="text-3xl font-bold font-outfit">Prescription Detected</h2>
                    <p className="text-muted-foreground mt-1">Select the items you want to add to your order</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-3 hover:bg-secondary rounded-full transition-colors">
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <div className="p-10 max-h-[50vh] overflow-y-auto space-y-6">
                  {detectedMedicines.map((med, i) => (
                    <div 
                      key={i} 
                      onClick={() => toggleMedSelection(i)}
                      className={`group flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer ${
                        selectedMeds.includes(i) 
                          ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' 
                          : 'bg-secondary/40 border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex gap-6 items-start">
                        <div className={`mt-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedMeds.includes(i) ? 'bg-primary border-primary text-white' : 'border-border'
                        }`}>
                          {selectedMeds.includes(i) && <Check className="w-5 h-5 stroke-[4px]" />}
                        </div>
                        <div>
                          <p className="font-bold text-xl">{med.name}</p>
                          <p className="text-muted-foreground mt-1">{med.dosage} • {med.frequency}</p>
                          {med.duration && <p className="text-sm text-primary/70 font-medium mt-1">Suggested: {med.duration}</p>}
                          {!med.isAvailable && (
                            <span className="inline-block mt-3 px-3 py-1 bg-amber-500/10 text-amber-500 text-[11px] font-bold rounded-full uppercase tracking-wider">
                              Special order (Not in Standard Catalogue)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl tracking-tight">
                          {med.price ? `₹${med.price}` : 'Price TBD'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Quantity: {med.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-10 bg-secondary/10 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-border">
                  <div className="text-center sm:text-left">
                    <p className="text-muted-foreground">Total Selected</p>
                    <p className="text-2xl font-bold">{selectedMeds.length} Items</p>
                  </div>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                      onClick={() => setShowModal(false)}
                      className="flex-1 sm:px-8 py-5 rounded-2xl font-bold bg-background border border-border hover:bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddToCart}
                      disabled={selectedMeds.length === 0}
                      className="flex-[2] sm:px-12 py-5 rounded-2xl font-bold bg-primary text-primary-foreground flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Shop Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
  );
}
