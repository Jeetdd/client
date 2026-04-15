"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative pt-44 pb-32 overflow-hidden bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] text-black uppercase"
          >
            Because Your Health Matters—<br />
            Hassle-Free Refills,<br />
            <span className="text-black">Delivered to Your Doorstep</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium"
          >
            Experience the future of medicine ordering. Upload your prescription and let our AI detect your needs in seconds. Secure, verified, and delivered.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
          >
            <Link 
              href="/upload" 
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-black text-white px-10 py-5 rounded-lg text-lg font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-black/5"
            >
              <Upload className="w-5 h-5" />
              Upload Prescription
            </Link>
            <Link 
              href="/shop" 
              className="w-full sm:w-auto px-12 py-5 rounded-lg text-lg font-bold border-2 border-slate-100 text-black hover:bg-slate-50 transition-all font-outfit"
            >
              Browse Shop
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-12 pt-16"
          >
            {[
              "100% Secure Storage",
              "Verified Pharmacists",
              "Indian Compliance Ready"
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
