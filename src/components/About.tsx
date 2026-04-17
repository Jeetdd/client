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
    <section id="about" className="py-32 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -z-10 skew-x-12 translate-x-1/2" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border border-indigo-100">
              The Mission
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[0.9]">
              Medicine. <br />
              <span className="text-indigo-600">Simpified.</span>
            </h2>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-xl font-medium">
              SkinShop is a premium healthcare gateway by <span className="text-slate-900 font-bold">Skinnonest</span>. 
              We use AI to bridge the gap between complex prescriptions and verified medicine access.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-4">
              {values.map((value, i) => (
                <div key={i} className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                    {value.icon}
                  </div>
                  <h4 className="font-bold text-slate-900 tracking-tight">{value.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-indigo-50/50 rounded-[3rem] blur-2xl -z-10" />
            <div className="premium-card p-12 lg:p-16 border-slate-200/60 ring-8 ring-white">
              <div className="space-y-8">
                <div className="flex items-center gap-5 border-b border-slate-100 pb-10">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-2xl">S</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-none">Core Values</h3>
                    <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-[0.2em]">Verified Excellence</p>
                  </div>
                </div>
                
                <p className="text-2xl font-medium text-slate-700 leading-tight tracking-tight">
                  "Speed is nothing without accuracy. Our AI and human experts work in tandem to ensure your health is never a gamble."
                </p>
                
                <div className="pt-10 flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Entity Details</p>
                    <p className="text-sm font-bold text-slate-900 underline decoration-indigo-200 underline-offset-4 decoration-2">SKINNONEST HEALTHCARE PVT LTD</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Licensing</p>
                    <p className="text-sm font-bold text-slate-700">Reg No: MH-AI-4523B | Grade Pharmaceutical</p>
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
