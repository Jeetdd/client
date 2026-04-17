"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Sparkles, Zap, Gift } from 'lucide-react';

const deals = [
  {
    code: "SKIN20",
    label: "First Order Reward",
    description: "Get a flat 20% discount on your first prescription analysis. Welcome to SkinShop.",
    icon: <Tag className="w-5 h-5" />
  },
  {
    code: "HEALTHY15",
    label: "Loyalty Booster",
    description: "Earn 1.5x points on all skincare essential combos. Build your routine.",
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    code: "FASTPICK",
    label: "Convenience Credit",
    description: "Save ₹50 instantly when you choose store pick-up. No delivery waits.",
    icon: <Zap className="w-5 h-5" />
  }
];

export default function OffersDeals() {
  return (
    <section id="offers" className="py-40 bg-slate-950 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-500/10 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 border border-indigo-500/20 backdrop-blur-md">
              The Rewards
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[1]">
              Premium <br />
              <span className="text-indigo-500 italic font-medium">Privileges.</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] bg-white/5 px-8 py-5 rounded-3xl border border-white/5 backdrop-blur-xl">
            <Gift className="w-6 h-6 text-indigo-500 animate-pulse" />
            Active Campaigns Available
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {deals.map((deal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="premium-card relative group hover:border-indigo-500/40 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-700" />
              
              <div className="mb-10 inline-flex p-6 rounded-3xl bg-indigo-500 text-white shadow-[0_20px_40px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform duration-700 group-hover:rotate-6">
                {deal.icon}
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">{deal.label}</h3>
              <p className="text-slate-400 text-lg font-medium mb-12 leading-relaxed group-hover:text-slate-200 transition-colors">
                {deal.description}
              </p>
              
              <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Access Code</div>
                <div className="text-sm font-black text-indigo-400 bg-indigo-500/10 px-6 py-3 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                  {deal.code}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
