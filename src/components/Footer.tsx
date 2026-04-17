"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Camera as Instagram, Globe as Twitter, Share2 as Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-32 bg-slate-950 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-10">
            <h3 className="text-3xl font-black text-white tracking-tighter">
              Skin<span className="text-indigo-500">Shop</span>
            </h3>
            <p className="text-slate-500 leading-relaxed font-medium text-lg">
              Redefining pharmaceutical care through high-precision AI and clinical excellence. Part of the <span className="text-white font-bold">Skinnonest</span> global network.
            </p>
            <div className="flex items-center gap-5">
              <Link href="#" className="p-3.5 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"><Twitter className="w-6 h-6" /></Link>
              <Link href="#" className="p-3.5 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"><Facebook className="w-6 h-6" /></Link>
              <Link href="#" className="p-3.5 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"><Instagram className="w-6 h-6" /></Link>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="font-black text-xs uppercase tracking-[0.4em] text-indigo-500">Navigation</h4>
            <div className="flex flex-col gap-5 text-md font-bold text-slate-400">
              <Link href="#process" className="hover:text-white transition-colors">Digital Workflow</Link>
              <Link href="/upload" className="hover:text-white transition-colors">Prescription Engine</Link>
              <Link href="/shop" className="hover:text-white transition-colors">Catalog Support</Link>
              <Link href="#about" className="hover:text-white transition-colors">Our Ethos</Link>
              <Link href="/account" className="hover:text-white transition-colors">Tracking Hub</Link>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="font-black text-xs uppercase tracking-[0.4em] text-indigo-500">Regulatory</h4>
            <div className="flex flex-col gap-5 text-md font-bold text-slate-400">
              <Link href="#" className="hover:text-white transition-colors">Privacy Shield</Link>
              <Link href="#" className="hover:text-white transition-colors">Fulfillment Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Pharma Usage</Link>
              <Link href="#" className="hover:text-white transition-colors">Clinical Disclosure</Link>
              <Link href="#" className="hover:text-white transition-colors">Direct Support</Link>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="font-black text-xs uppercase tracking-[0.4em] text-indigo-500">Clinical Support</h4>
            <div className="flex flex-col gap-8 text-md font-bold text-slate-400">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5"><Phone className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-1">Direct Line</p>
                  <p className="text-white text-lg font-black tracking-tight">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5"><Mail className="w-6 h-6" /></div>
                <div>
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-1">Inquiries</p>
                  <p className="text-white text-lg font-black tracking-tight">hello@skinshop.in</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
          <p>© 2024 SKINNONEST HEALTHCARE PRIVATE LIMITED. ALL RIGHTS RESERVED WORLDWIDE.</p>
          <div className="flex items-center gap-10">
            <Link href="#" className="hover:text-white transition-colors">PHARMA REG MH-452A</Link>
            <Link href="#" className="hover:text-white transition-colors">GDPR COMPLIANCE</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
