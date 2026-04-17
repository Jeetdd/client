"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Sparkles, Zap, Gift } from 'lucide-react';

const deals = [
  {
    code: "SKIN20",
    label: "Flat 20% OFF",
    description: "On your first prescription order. Valid for new users.",
    icon: <Tag className="w-5 h-5" />,
    color: "from-indigo-600 to-indigo-800"
  },
  {
    code: "HEALTHY15",
    label: "15% Cash Rewards",
    description: "Earn extra loyalty points on all skincare combos.",
    icon: <Sparkles className="w-5 h-5" />,
    color: "from-emerald-600 to-emerald-800"
  },
  {
    code: "FASTPICK",
    label: "₹50 Instant Discount",
    description: "Choose store pick-up and save on delivery fees.",
    icon: <Zap className="w-5 h-5" />,
    color: "from-amber-600 to-amber-800"
  }
];

export default function OffersDeals() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">
              Exclusive <span className="text-primary">Offers.</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-xl font-medium">
              Grab the best deals on verified medicines and healthcare essentials. 
              Limited time promotions for our growing community.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-200">
            <Gift className="w-4 h-4 text-primary" />
            3 Active Campaigns
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {deals.map((deal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className={`mb-6 inline-flex p-3 rounded-2xl bg-gradient-to-br ${deal.color} text-white shadow-lg`}>
                {deal.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{deal.label}</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                {deal.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">Coupon Code</div>
                <div className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
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
