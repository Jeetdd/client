"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Medal, Globe, Heart } from 'lucide-react';

const values = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "100% Genuine",
    description: "Every medicine is sourced from verified manufacturers with valid licenses."
  },
  {
    icon: <Medal className="w-6 h-6" />,
    title: "Licensed Pharmacy",
    description: "Operating under strict Indian pharmaceutical compliance and ethical standards."
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Global Standards",
    description: "Combining world-class AI technology with personalized Indian healthcare."
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Mission Driven",
    description: "Our goal is to make professional skincare accessible to every Indian household."
  }
];

export default function About() {
  return (
    <section id="about" className="py-40 bg-slate-950 relative overflow-hidden">
      {/* Structural Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/5 -skew-x-12 translate-x-1/2 blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-purple-500/5 skew-x-12 -translate-x-1/2 blur-[100px]" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-500/10 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 border border-indigo-500/20 backdrop-blur-md">
              The Mission
            </div>
            
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">
              Medicine. <br />
              <span className="text-indigo-500 italic font-medium">Simplified.</span>
            </h2>
            
            <p className="text-xl text-slate-400 leading-relaxed max-w-xl font-medium">
              SkinShop is a state-of-the-art clinic gateway by <span className="text-white font-bold">Skinnonest</span>. 
              We utilize proprietary AI models to decode complex prescriptions and ensure absolute medicine fidelity.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-8">
              {values.map((value, i) => (
                <div key={i} className="space-y-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-indigo-500/20">
                    {value.icon}
                  </div>
                  <h4 className="text-xl font-black text-white tracking-tight">{value.title}</h4>
                  <p className="text-md text-slate-500 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-indigo-500/10 rounded-[4rem] blur-[120px] -z-10" />
            <div className="premium-card lg:p-20 ring-1 ring-white/10 backdrop-blur-2xl bg-slate-900/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="space-y-12 relative z-10">
                <div className="flex items-center gap-6 border-b border-white/5 pb-10">
                  <div className="w-24 h-24 rounded-3xl bg-white text-slate-950 flex items-center justify-center text-4xl font-black shadow-2xl">S</div>
                  <div>
                    <h3 className="text-3xl font-black text-white leading-none">Core Values</h3>
                    <p className="text-[10px] font-black text-indigo-500 mt-3 uppercase tracking-[0.3em]">Integrity Verified</p>
                  </div>
                </div>
                
                <p className="text-3xl font-medium text-slate-200 leading-[1.2] tracking-tighter">
                  "Speed is nothing without accuracy. Our AI and human experts work in tandem to ensure your health remains absolute."
                </p>
                
                <div className="pt-10 flex flex-col gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Corporate Entity</p>
                    <p className="text-lg font-bold text-white underline decoration-indigo-500 decoration-4 underline-offset-8">SKINNONEST HEALTHCARE PVT LTD</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Registration</p>
                      <p className="text-sm font-bold text-slate-400">MH-AI-4523B</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Compliance</p>
                      <p className="text-sm font-bold text-slate-400">Grade A Pharma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

