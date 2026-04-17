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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
            Trusted by Thousands
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">
            Don't take our word <br />
            <span className="text-primary">for it.</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Join a community of thousands who rely on SkinShop for their daily healthcare needs. 
            Real stories from real users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.04)] transition-all flex flex-col justify-between"
            >
              <div className="absolute top-8 right-10 text-slate-50">
                <Quote className="w-12 h-12" />
              </div>
              
              <div className="relative space-y-6">
                <div className="flex gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg font-medium text-slate-700 leading-relaxed italic">
                  "{item.text}"
                </p>
              </div>

              <div className="mt-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-slate-50">
                  {item.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
