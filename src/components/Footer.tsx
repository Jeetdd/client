"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Camera as Instagram, Globe as Twitter, Share2 as Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-20 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">SkinShop</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Leading the revolution in online healthcare through AI innovation and human care. Part of the <span className="text-slate-900 font-bold">Skinnonest</span> network.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold tracking-widest"><Twitter className="w-5 h-5" /></Link>
              <Link href="#" className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold tracking-widest"><Facebook className="w-5 h-5" /></Link>
              <Link href="#" className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold tracking-widest"><Instagram className="w-5 h-5" /></Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Quick Links</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-600">
              <Link href="#process" className="hover:text-primary transition-colors">How it Works</Link>
              <Link href="/upload" className="hover:text-primary transition-colors">Upload Prescription</Link>
              <Link href="/shop" className="hover:text-primary transition-colors">Shop Medicines</Link>
              <Link href="#about" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="/account" className="hover:text-primary transition-colors">Track Orders</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Legal & Support</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-600">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Refund Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms & Conditions</Link>
              <Link href="#" className="hover:text-primary transition-colors">Compliance Info</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact Support</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Contact Helpline</h4>
            <div className="flex flex-col gap-5 text-sm font-bold text-slate-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100"><Phone className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Call Helpline</p>
                  <p className="text-slate-900">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100"><Mail className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Email Us</p>
                  <p className="text-slate-900">hello@skinshop.in</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100"><MapPin className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Office</p>
                  <p className="text-slate-900 leading-tight">Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <p>© 2024 SKINNONEST HEALTHCARE PRIVATE LIMITED. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Regulatory Compliance</Link>
            <Link href="#" className="hover:text-primary transition-colors">Pharmacy License</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
