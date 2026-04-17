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
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-100 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-[0.2em]">
            Voice of the Community
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[0.9]">
            The Standard of <br />
            <span className="text-indigo-600">Care.</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            Real experiences from people who have transformed their skincare journey with AI-powered precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="premium-card group relative p-12 hover:border-indigo-100"
            >
              <div className="absolute top-10 right-12 text-slate-50 group-hover:text-indigo-50 transition-colors">
                <Quote className="w-16 h-16" />
              </div>
              
              <div className="relative space-y-8">
                <div className="flex gap-1.5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-indigo-600 text-indigo-600 shadow-sm" />
                  ))}
                </div>
                <p className="text-xl font-medium text-slate-700 leading-relaxed tracking-tight italic">
                  "{item.text}"
                </p>
              </div>

              <div className="mt-12 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:scale-110 transition-transform">
                  {item.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 tracking-tight">{item.name}</h4>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
