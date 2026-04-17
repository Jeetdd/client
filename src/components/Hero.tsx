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
    <section className="relative pt-32 pb-20 overflow-hidden min-h-[90vh] flex items-center bg-white">
      {/* Refined Indigo Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.03)_0%,transparent_70%)] -z-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-50 rounded-full blur-[120px] -z-10 opacity-50" />

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-10"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-700 mb-4 uppercase tracking-[0.2em]"
              >
                {slide.icon}
                {slide.tagline}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-9xl font-black tracking-tight leading-[0.85] text-slate-900"
              >
                {slide.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
              >
                {slide.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
              >
                <Link 
                  href="/upload" 
                  className="group flex items-center gap-3 bg-indigo-600 text-white px-12 py-5 rounded-2xl text-lg font-black hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
                >
                  <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  Upload Prescription
                </Link>
                <Link 
                  href="/shop" 
                  className="px-12 py-5 rounded-2xl text-lg font-black bg-white border border-slate-200 text-slate-900 hover:border-slate-900 transition-all"
                >
                  Shop Now
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-center gap-10 pt-24 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure Infrastructure
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Pharmacists
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Direct Compliance
            </div>
          </div>

          {/* Minimal Indicators */}
          <div className="flex items-center justify-center gap-2 pt-16">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-500 rounded-full ${
                  current === i ? "w-10 h-1 bg-indigo-600" : "w-2 h-1 bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
