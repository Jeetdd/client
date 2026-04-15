"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CloudUpload, BarChart3, ShoppingBag, Truck } from 'lucide-react';

const steps = [
  {
    title: "Upload Prescription",
    description: "Scan or upload your doctor's prescription in JPG, PNG or PDF format.",
    icon: <CloudUpload className="w-10 h-10" />,
  },
  {
    title: "AI Analysis",
    description: "Our AI systems automatically detect medicines and verify details.",
    icon: <BarChart3 className="w-10 h-10" />,
  },
  {
    title: "Add to Cart",
    description: "Review detected medicines, adjust quantities and add to your bag.",
    icon: <ShoppingBag className="w-10 h-10" />,
  },
  {
    title: "Quick Delivery",
    description: "Fast doorstep delivery or convenient pick-up from a local store.",
    icon: <Truck className="w-10 h-10" />,
  }
];

export default function Process() {
  return (
    <section id="process" className="py-24 bg-white border-y border-slate-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">How it Works</h2>
          <p className="text-sm font-medium text-slate-500 max-w-2xl mx-auto">
            A seamless experience designed to make healthcare accessible and effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="text-black group-hover:scale-110 transition-transform duration-500">
                {step.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-black">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-slate-500 font-medium">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
