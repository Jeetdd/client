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
    <section className="py-32 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              Exclusive Access
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-none">
              Premium <br />
              <span className="text-indigo-600">Privileges.</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200">
            <Gift className="w-5 h-5 text-indigo-600" />
            Active Campaigns
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {deals.map((deal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="premium-card hover:border-indigo-100 group"
            >
              <div className="mb-8 inline-flex p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
                {deal.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{deal.label}</h3>
              <p className="text-slate-600 text-md font-medium mb-10 leading-relaxed">
                {deal.description}
              </p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Code</div>
                <div className="text-sm font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-200">
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
