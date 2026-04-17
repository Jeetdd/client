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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-3xl font-black tracking-tighter text-slate-900 group">
            Skin<span className="text-indigo-600 group-hover:text-slate-900 transition-colors">Shop</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black text-slate-600 transition-colors uppercase tracking-[0.25em]">
            <Link href="/" className="hover:text-indigo-600">Home</Link>
            <Link href="/#process" className="hover:text-indigo-600">Process</Link>
            <Link href="/shop" className="hover:text-indigo-600">Pharmacy</Link>
            <Link href="/#about" className="hover:text-indigo-600">About</Link>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/cart" className="relative p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group shadow-sm">
            <ShoppingCart className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] min-w-5 h-5 flex items-center justify-center rounded-full font-black shadow-lg shadow-indigo-100 px-1">{totalItems}</span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-5 pl-5 border-l border-slate-100">
              <div className="hidden lg:block text-right">
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] leading-none mb-1">Authenticated</p>
                <p className="text-sm font-black text-slate-900">{user.name}</p>
              </div>
              <div className="flex items-center gap-3">
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100">
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <Link href="/account" className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 transition-all">
                  <UserRound className="w-5 h-5" />
                </Link>
                <button 
                  onClick={logout}
                  className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white border border-rose-100 transition-all font-bold group"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">
              <User className="w-5 h-5" />
              Sign In
            </Link>
          )}

          <button className="md:hidden p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <Menu className="w-6 h-6 text-slate-400" />
          </button>
        </div>
      </div>
    </nav>
  );
}
