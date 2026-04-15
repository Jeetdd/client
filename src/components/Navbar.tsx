"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, LogOut, LayoutDashboard, UserRound, Search } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
      <div className="container mx-auto px-4 h-24 flex items-center justify-between font-outfit">
        <Link href="/" className="flex flex-col">
          <span className="text-2xl font-black tracking-tighter text-black leading-none uppercase">SKINNONEST</span>
          <span className="text-[7px] font-bold text-slate-500 tracking-[0.2em] mt-0.5">Dermatologist-Developed. Visible Results.</span>
        </Link>
        
        <div className="hidden xl:flex items-center gap-10 text-[11px] font-bold text-slate-800 transition-colors uppercase tracking-[0.15em]">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <Link href="/category" className="hover:text-amber-600">Shop By Category</Link>
          <Link href="/shop" className="hover:text-amber-600">Shop</Link>
          <Link href="/best-seller" className="hover:text-amber-600">Best Seller</Link>
          <Link href="/concern" className="hover:text-amber-600">Shop By Concern</Link>
          <Link href="/contact" className="hover:text-amber-600">Contact Us</Link>
        </div>

        <div className="flex items-center gap-6">
          <button className="hidden sm:block p-2 text-slate-800 hover:text-amber-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          {user ? (
            <div className="flex items-center gap-5 pl-5 border-l border-slate-200">
              <Link href="/account" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <UserRound className="w-4 h-4 text-slate-600" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">Account</p>
                  <p className="text-[11px] font-bold text-black">{user.name.split(' ')[0]}</p>
                </div>
              </Link>
              
              <Link href="/cart" className="relative group">
                <ShoppingCart className="w-5 h-5 text-slate-800 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold">{totalItems}</span>
                )}
              </Link>
              
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-600 transition-transform hover:scale-110"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-slate-800 group transition-all">
                <UserRound className="w-5 h-5 group-hover:scale-110" />
              </Link>
              <Link href="/cart" className="relative group">
                <ShoppingCart className="w-5 h-5 text-slate-800 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold">{totalItems}</span>
                )}
              </Link>
            </div>
          )}

          <button className="xl:hidden p-2 text-slate-800">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
