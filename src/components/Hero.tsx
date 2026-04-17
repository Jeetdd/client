"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ChevronRight, ShieldCheck, Sparkles, Pill, Heart, Zap } from 'lucide-react';
import Link from 'next/link';

const slides = [
  {
    tagline: "Your Trusted Online Pharmacy",
    title: <>Your Skin, <br /><span className="gradient-text">Prescribed by AI</span></>,
    description: "Experience the future of medicine ordering. Upload your prescription and let our AI detect your needs in seconds. Secure, verified, and delivered.",
    color: "from-indigo-600 to-indigo-800",
    icon: <Sparkles className="w-4 h-4" />
  },
  {
    tagline: "Authenticity You Can Trust",
    title: <>Verified <br /><span className="text-emerald-600">Pure Grade Meds</span></>,
    description: "Every medicine in our catalog is sourced directly from licensed manufacturers. 100% genuine products, every single time.",
    color: "from-emerald-600 to-emerald-800",
    icon: <ShieldCheck className="w-4 h-4" />
  },
  {
    tagline: "Revolutionizing Delivery",
    title: <>Healthcare <br /><span className="text-amber-600">At Your Speed</span></>,
    description: "Get same-day delivery for essential skincare or choose our local store pick-up for maximum convenience and zero shipping fees.",
    color: "from-amber-600 to-amber-800",
    icon: <Zap className="w-4 h-4" />
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative pt-40 pb-20 overflow-hidden min-h-[95vh] flex items-center bg-slate-950">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)] -z-10" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[160px] -z-10 opacity-30 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] -z-10 opacity-20 -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -30 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-12"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-indigo-400 mb-6 uppercase tracking-[0.4em] backdrop-blur-md"
              >
                {slide.icon}
                {slide.tagline}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl md:text-[11rem] font-black tracking-tighter leading-[0.8] text-white"
              >
                <span className="block">Your Skin,</span>
                <span className="text-white">Prescribed</span>
                <span className="block text-indigo-500 italic font-medium mt-4">by Intelligence.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed"
              >
                Experience the precision of clinical AI pharmacy. From prescription upload to doorstep delivery, SkinShop is your dedicated beauty-health gateway.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
              >
                <Link 
                  href="/upload" 
                  className="group relative flex items-center gap-4 bg-indigo-500 text-white px-14 py-6 rounded-[2rem] text-xl font-black hover:bg-indigo-400 transition-all shadow-[0_20px_60px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-95"
                >
                  <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                  Upload Prescription
                </Link>
                <Link 
                  href="/shop" 
                  className="px-14 py-6 rounded-[2rem] text-xl font-black bg-white/5 border border-white/10 text-white hover:bg-white hover:text-slate-950 transition-all backdrop-blur-md"
                >
                  Shop Store
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-14 pt-32 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500"
          >
            <div className="flex items-center gap-3 group">
              <ShieldCheck className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-slate-300 transition-colors">Digital Integrity</span>
            </div>
            <div className="flex items-center gap-3 group">
              <ShieldCheck className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-slate-300 transition-colors">Expert Validation</span>
            </div>
            <div className="flex items-center gap-3 group">
              <ShieldCheck className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-slate-300 transition-colors">Clinical Compliance</span>
            </div>
          </motion.div>

          {/* Precision Indicators */}
          <div className="flex items-center justify-center gap-4 pt-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-700 rounded-full h-1 ${
                  current === i ? "w-16 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" : "w-4 bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
