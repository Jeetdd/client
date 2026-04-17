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
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative pt-32 pb-20 overflow-hidden min-h-[90vh] flex items-center bg-background">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] -z-10" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-sm font-bold text-primary mb-4 uppercase tracking-widest"
              >
                {slide.icon}
                {slide.tagline}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] text-slate-900"
              >
                {slide.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed"
              >
                {slide.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
              >
                <Link 
                  href="/upload" 
                  className="group flex items-center gap-2 bg-slate-900 text-white px-10 py-5 rounded-full text-lg font-black hover:scale-105 transition-all shadow-2xl shadow-slate-200"
                >
                  <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  Upload Prescription
                </Link>
                <Link 
                  href="/shop" 
                  className="px-10 py-5 rounded-full text-lg font-black bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                >
                  Shop Now
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-12 pt-16 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              100% Secure Storage
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Verified Pharmacists
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Compliant Ready
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex items-center justify-center gap-3 pt-12">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  current === i ? "w-8 bg-primary" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
