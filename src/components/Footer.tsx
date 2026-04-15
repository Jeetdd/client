"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Camera as Instagram, Globe as Twitter, Share2 as Facebook, Video as Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white pt-24 pb-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-8">
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-white uppercase">SKINNONEST</span>
              <span className="text-[8px] font-bold text-neutral-500 tracking-[0.2em] mt-1 uppercase">Dermatologist-Developed. Visible Results.</span>
            </div>
            <p className="text-xl font-bold leading-tight max-w-[200px] uppercase">
              Care for <br />
              <span className="text-neutral-500">Your Skin,</span> <br />
              Care for <br />
              <span className="text-neutral-500">Your Beauty</span>
            </p>
          </div>

          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">Company Overview</h4>
            <div className="flex flex-col gap-4 text-[13px] font-medium text-neutral-300">
              <Link href="#" className="hover:text-white transition-colors">About Us</Link>
              <Link href="#" className="hover:text-white transition-colors">Our values</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy notice</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms & conditions</Link>
              <Link href="#" className="hover:text-white transition-colors">Disclaimer</Link>
              <Link href="#" className="hover:text-white transition-colors">Corporate Information</Link>
              <Link href="#" className="hover:text-white transition-colors">Media Outreach</Link>
              <Link href="#" className="hover:text-white transition-colors">Distributor Queries</Link>
              <Link href="#" className="hover:text-white transition-colors">Grievance Redressal</Link>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">Quick Links</h4>
            <div className="flex flex-col gap-4 text-[13px] font-medium text-neutral-300">
              <Link href="#" className="hover:text-white transition-colors">Knowledge</Link>
              <Link href="#" className="hover:text-white transition-colors">FAQs</Link>
              <Link href="#" className="hover:text-white transition-colors">Shipping Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Return & refund policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Payment Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Track order</Link>
              <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
              <Link href="#" className="hover:text-white transition-colors">Download App</Link>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">Contact Us</h4>
            <div className="flex flex-col gap-6 text-[13px] font-medium text-neutral-300">
              <div className="space-y-2">
                <p className="text-neutral-500 uppercase text-[10px] font-bold">Need help? Fill out our form or email</p>
                <Link href="mailto:help@skinnonest.com" className="text-sm border-b border-neutral-700 pb-1 hover:border-white transition-colors">help@skinnonest.com</Link>
              </div>
              <div className="space-y-2">
                <p className="text-neutral-500 uppercase text-[10px] font-bold">For billing inquiries, write to us at</p>
                <Link href="mailto:info@skinnonest.com" className="text-sm border-b border-neutral-700 pb-1 hover:border-white transition-colors">info@skinnonest.com</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">© 2025 SKINNONEST</p>
            <div className="flex items-center gap-6 ml-10">
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></Link>
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors"><Facebook className="w-4 h-4" /></Link>
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors"><Instagram className="w-4 h-4" /></Link>
              <Link href="#" className="text-neutral-400 hover:text-white transition-colors"><Youtube className="w-4 h-4" /></Link>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Designed By:</span>
            <Link href="https://dreamsdesign.in" target="_blank" className="text-[10px] text-neutral-300 font-black uppercase tracking-widest hover:text-white transition-colors">Dreamsdesign.in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
