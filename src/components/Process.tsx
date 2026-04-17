"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, Search, ShoppingBag, Truck } from 'lucide-react';

const steps = [
  {
    title: "Upload Prescription",
    description: "Upload your doctor's prescription and let our AI instantly verify your needs.",
    icon: <FileUp className="w-8 h-8" />,
    color: "bg-indigo-500/10 text-indigo-500"
  },
  {
    title: "Add to Cart",
    description: "Review detected medicines, adjust your dosages, and add items to your bag.",
    icon: <ShoppingBag className="w-8 h-8" />,
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    title: "Choose Delivery",
    description: "Pick doorstep delivery or convenient pick-up from our nearest partner store.",
    icon: <Truck className="w-8 h-8" />,
    color: "bg-emerald-500/10 text-emerald-500"
  },
  {
    title: "Get Medicines",
    description: "Receive your verified medications safely with professional pharmacist support.",
    icon: <Search className="w-8 h-8" />,
    color: "bg-amber-500/10 text-amber-500"
  }
];

export default function Process() {
  return (
    <section id="process" className="py-40 bg-slate-950 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] -z-10 opacity-30" />
      
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto mb-32 space-y-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-500/10 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 border border-indigo-500/20 backdrop-blur-md">
            The Workflow
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[1]">
            Four Steps to <br />
            <span className="text-indigo-500 italic font-medium">Total Wellness.</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
            "Simplifying pharmaceutical complexity through artificial intelligence."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="premium-card relative group p-14 hover:border-indigo-500/30 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-700 shadow-2xl group-hover:shadow-indigo-500/40">
                {step.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-white tracking-tight">{step.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                {step.description}
              </p>
              
              <div className="absolute bottom-6 right-10 text-7xl font-black text-white/[0.02] italic pointer-events-none group-hover:text-indigo-500/10 transition-colors">
                0{index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
