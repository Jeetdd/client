"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Camera as Instagram, Globe as Twitter, Share2 as Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold gradient-text">SkinShop</h3>
            <p className="text-muted-foreground leading-relaxed">
              Leading the revolution in online healthcare through AI innovation and human care. Your health is our priority.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="p-2 rounded-full hover:bg-secondary transition-colors"><Twitter className="w-5 h-5" /></Link>
              <Link href="#" className="p-2 rounded-full hover:bg-secondary transition-colors"><Facebook className="w-5 h-5" /></Link>
              <Link href="#" className="p-2 rounded-full hover:bg-secondary transition-colors"><Instagram className="w-5 h-5" /></Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg">Quick Links</h4>
            <div className="flex flex-col gap-4 text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">How it Works</Link>
              <Link href="#" className="hover:text-primary transition-colors">Upload Prescription</Link>
              <Link href="#" className="hover:text-primary transition-colors">Catalog</Link>
              <Link href="#" className="hover:text-primary transition-colors">About Us</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg">Legal</h4>
            <div className="flex flex-col gap-4 text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors">Shipping Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Compliance Info</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg">Contact</h4>
            <div className="flex flex-col gap-4 text-muted-foreground">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Mumbai, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>hello@skinshop.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <p>© 2024 SkinShop Healthcare. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
