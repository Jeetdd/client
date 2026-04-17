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
    <section id="about" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              About SkinShop
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-none">
              The Pharmacy of <br />
              <span className="text-primary">The Future.</span>
            </h2>
            <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
              SkinShop is a premium healthcare platform powered by <span className="font-bold text-slate-900">Skinnonest.com</span>. 
              We leverage advanced AI to simplify the complex journey of medical prescriptions into a seamless, 
              one-tap experience.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {values.map((value, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 shadow-sm">
                    {value.icon}
                  </div>
                  <h4 className="font-bold text-slate-900">{value.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-[100px] -z-10" />
            <div className="rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl bg-white p-2">
              <div className="bg-slate-50 rounded-[2.5rem] p-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-black">S</div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 leading-none">Our Mission</h3>
                      <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Bridging AI & Healthcare</p>
                    </div>
                  </div>
                  <p className="text-lg font-medium text-slate-600 leading-relaxed">
                    "At SkinShop, we believe that technology should never be cold. We use AI not just for speed, but for accuracy and safety—ensuring that every Indian has access to verified medicines with absolute confidence."
                  </p>
                  <div className="pt-6">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Licensed Entity</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">SKINNONEST HEALTHCARE PRIVATE LIMITED</p>
                    <p className="text-xs text-slate-400">Reg No: MH-4523-22B / Pharmacy Grade A</p>
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
