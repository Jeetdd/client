"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between font-outfit">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-3xl font-black tracking-tighter text-primary">
            SkinShop
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground transition-colors uppercase tracking-widest text-[10px]">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/#process" className="hover:text-primary">Medical Process</Link>
            <Link href="/#store" className="hover:text-primary">Pharmacy Store</Link>
            <Link href="/#about" className="hover:text-primary">Our Story</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-3 rounded-2xl bg-secondary/30 hover:bg-secondary transition-all group shadow-sm">
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-lg shadow-primary/20">{totalItems}</span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-border">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest leading-none">Logged In</p>
                <p className="text-sm font-bold text-primary">{user.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary/20 transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <button 
                  onClick={logout}
                  className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all font-bold group"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-primary/20">
              <User className="w-5 h-5" />
              Sign In
            </Link>
          )}

          <button className="md:hidden p-3 bg-secondary/30 rounded-2xl">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
