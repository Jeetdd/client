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
    <section id="process" className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-24 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Simplicity Refined
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
            Four Steps to <br />
            <span className="text-indigo-600">Total Wellness.</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
            "We've removed the complexity from healthcare, so you can focus on healing."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="premium-card group relative p-10 hover:border-indigo-200"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-8 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                {step.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{step.title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                {step.description}
              </p>
              
              <div className="absolute top-8 right-10 text-4xl font-black text-slate-50 italic -z-10 group-hover:text-indigo-50 transition-colors">
                0{index + 1}
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-8 h-[2px] bg-slate-100" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
