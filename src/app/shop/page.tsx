"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  FileText,
  Loader2,
  Check,
  Plus,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://server-hw5w.onrender.com';

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  image: string | null;
  category: string;
  requiresPrescription: boolean;
}

export default function ShopPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const { addItem, items } = useCart();
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/medicines`);
      const data = await resp.json();
      setMedicines(data);
      
      const cats = Array.from(new Set(data.map((m: Medicine) => m.category))) as string[];
      setCategories(['All', ...cats]);
    } catch (err) {
      console.error('Failed to fetch medicines', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (m.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (medicine: Medicine) => {
    addItem({
      medicineId: medicine.id,
      name: medicine.name,
      price: medicine.price,
      quantity: 1,
      image: medicine.image || undefined,
    });
    
    setAddedItemIds(prev => new Set(prev).add(medicine.id));
    setTimeout(() => {
      setAddedItemIds(prev => {
        const next = new Set(prev);
        next.delete(medicine.id);
        return next;
      });
    }, 2000);
  };

  const isInCart = (id: string) => items.some(item => item.medicineId === id);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <header className="mb-12 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight font-outfit">Medical Store</h1>
                <p className="text-muted-foreground text-lg">Browse our verified catalogue of genuine medicines</p>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
                <ShieldCheck className="w-4 h-4" />
                DCO Verified Pharmacy
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search for medicines, symptoms, or brands..."
                  className="w-full pl-14 pr-6 py-5 bg-secondary/30 border border-border rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative group">
                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select 
                  className="w-full pl-14 pr-6 py-5 bg-secondary/30 border border-border rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-medium appearance-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4 bg-secondary/20 p-2 rounded-3xl border border-border h-[70px]">
                {['All', 'Essential', 'Premium'].map((t) => (
                  <button 
                    key={t}
                    className={`flex-1 h-full rounded-2xl text-sm font-bold transition-all ${t === 'All' ? 'bg-background shadow-lg text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-bold text-muted-foreground">Syncing catalogue...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence mode='popLayout'>
                {filteredMedicines.map((med) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={med.id}
                    className="group bg-secondary/20 border border-border rounded-[2.5rem] p-8 hover:bg-secondary/40 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full"
                  >
                    <div className="relative aspect-square mb-8 rounded-[2rem] overflow-hidden bg-white/50 border border-white/20">
                      {med.image ? (
                        <img src={med.image} alt={med.name} className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <Plus className="w-16 h-16" />
                        </div>
                      )}
                      
                      {med.requiresPrescription && (
                        <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg ring-4 ring-amber-500/10">
                          <FileText className="w-3 h-3" />
                          Prescription Required
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm">
                        {med.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </div>
                    </div>

                    <div className="space-y-4 flex-grow">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">{med.category}</p>
                          <h3 className="text-2xl font-bold font-outfit tracking-tight leading-tight">{med.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black tracking-tight">₹{med.price}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Incl. all taxes</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                        {med.description || "Trusted medicine for your skincare needs. Clinically tested and verified."}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">4.8 (120+)</span>
                      </div>
                      
                      <button 
                        onClick={() => handleAddToCart(med)}
                        disabled={med.stock <= 0}
                        className={`px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${
                          addedItemIds.has(med.id)
                            ? 'bg-emerald-500 text-white'
                            : isInCart(med.id)
                              ? 'bg-secondary text-primary'
                              : 'bg-primary text-primary-foreground hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-primary/20'
                        }`}
                      >
                        {addedItemIds.has(med.id) ? (
                          <>
                            <Check className="w-4 h-4" />
                            Added
                          </>
                        ) : isInCart(med.id) ? (
                          <>
                            <Plus className="w-4 h-4" />
                            Add More
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* No Results */}
          {!loading && filteredMedicines.length === 0 && (
            <div className="py-40 text-center space-y-6">
              <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mx-auto text-muted-foreground/30">
                <Search className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">No medicines found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
                className="text-primary font-bold underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Related Products / Help Section */}
          <section className="mt-32 pt-20 border-t border-border">
            <div className="bg-primary/5 rounded-[3rem] p-12 md:p-20 text-center space-y-8">
              <div className="inline-flex p-4 bg-primary/10 rounded-2xl text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-outfit">Need help with medicines?</h2>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                Our AI can analyze your prescription and suggest the exact medicines you need.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                <Link href="/upload">
                  <button className="px-10 py-5 bg-primary text-primary-foreground rounded-[2rem] text-lg font-black hover:scale-105 transition-transform shadow-xl shadow-primary/25">
                    Start AI Analysis
                  </button>
                </Link>
                <button className="px-10 py-5 bg-background border border-border rounded-[2rem] text-lg font-black hover:bg-secondary transition-colors">
                  Talk to Pharmacist
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
