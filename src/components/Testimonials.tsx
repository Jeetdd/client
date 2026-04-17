"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    name: "Dr. Ananya Sharma",
    role: "Dermatologist",
    text: "The AI prescription analysis is surprisingly accurate. It saves so much time for my patients and ensures they get exactly what's prescribed without errors.",
    rating: 5,
    avatar: "AS"
  },
  {
    name: "Rahul Verma",
    role: "Verified Buyer",
    text: "SkinShop has changed how I buy my skin meds. The interface is clean, the delivery is fast, and the loyalty points actually add up. Highly recommended!",
    rating: 5,
    avatar: "RV"
  },
  {
    name: "Sneha Kapoor",
    role: "Verified Buyer",
    text: "I was skeptical about AI, but it detected my complex prescription in seconds. The store pick-up option is very convenient for someone with a busy schedule.",
    rating: 5,
    avatar: "SK"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-40 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] -z-10 opacity-30" />
      
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-32 space-y-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-500/10 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 border border-indigo-500/20 backdrop-blur-md">
            The Proof
          </div>
          <h2 className="text-6xl md:text-[9rem] font-black tracking-tighter text-white leading-[0.85]">
            The Standard <br />
            <span className="text-indigo-500 italic font-medium">of Care.</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            Real experiences from people who have transformed their skincare journey with our AI precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="premium-card relative group p-14 hover:border-indigo-500/30 overflow-hidden"
            >
              <div className="absolute top-10 right-12 text-white/[0.03] group-hover:text-indigo-500/10 transition-colors">
                <Quote className="w-24 h-24" />
              </div>
              
              <div className="relative space-y-10">
                <div className="flex gap-2">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-indigo-500 text-indigo-500 shadow-lg shadow-indigo-500/20" />
                  ))}
                </div>
                <p className="text-2xl font-medium text-slate-200 leading-[1.3] tracking-tight italic">
                  "{item.text}"
                </p>
              </div>

              <div className="mt-16 flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:scale-110 transition-transform duration-700">
                  {item.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-xl font-bold text-white tracking-tight">{item.name}</h4>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
