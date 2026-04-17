"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, LogOut, LayoutDashboard, UserRound } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-14">
          <Link href="/" className="text-3xl font-black tracking-tighter text-white group">
            Skin<span className="text-indigo-500 group-hover:text-indigo-400 transition-colors">Shop</span>
          </Link>
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black text-slate-500 transition-colors uppercase tracking-[0.3em]">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#process" className="hover:text-white transition-colors">Process</Link>
            <Link href="/shop" className="hover:text-white transition-colors">Pharmacy</Link>
            <Link href="/#about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/cart" className="relative p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all group">
            <ShoppingCart className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[10px] min-w-5 h-5 flex items-center justify-center rounded-full font-black shadow-lg shadow-indigo-500/20 px-1">{totalItems}</span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-6 pl-6 border-l border-white/5">
              <div className="hidden lg:block text-right">
                <p className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.2em] leading-none mb-1">Authenticated</p>
                <p className="text-sm font-black text-white">{user.name}</p>
              </div>
              <div className="flex items-center gap-3">
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <Link href="/account" className="p-3.5 bg-white/5 text-slate-400 rounded-2xl hover:bg-white/10 hover:text-white border border-white/5 transition-all">
                  <UserRound className="w-5 h-5" />
                </Link>
                <button 
                  onClick={logout}
                  className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all font-bold group"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-4 bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20">
              <User className="w-5 h-5" />
              Sign In
            </Link>
          )}

          <button className="lg:hidden p-3.5 bg-white/5 rounded-2xl border border-white/5">
            <Menu className="w-6 h-6 text-slate-400" />
          </button>
        </div>
      </div>
    </nav>
  );
}
