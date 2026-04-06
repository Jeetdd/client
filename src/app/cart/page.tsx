"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Minus, Plus, Trash2, ArrowRight, Tag, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/components/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const [coupon, setCoupon] = useState("");

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = coupon === "SKIN20" ? subtotal * 0.2 : 0;
  const delivery = items.length > 0 ? 50 : 0;
  const total = subtotal - discount + delivery;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background pt-24">
        <Navbar />
        <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">Upload a prescription to get started!</p>
          <Link href="/upload" className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity">
            Upload Prescription
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-12">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="flex items-center gap-6 p-6 bg-secondary/30 border border-border rounded-3xl"
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  {item.dosage && (
                    <p className="text-sm text-muted-foreground mt-0.5">{item.dosage} • {item.frequency}</p>
                  )}
                  <p className="text-primary font-bold text-lg mt-1">₹{item.price}</p>
                </div>
                
                <div className="flex items-center gap-4 bg-background border border-border rounded-xl p-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-secondary rounded-lg"><Minus className="w-4 h-4" /></button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-secondary rounded-lg"><Plus className="w-4 h-4" /></button>
                </div>

                <button onClick={() => removeItem(item.id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="p-8 bg-secondary/50 border border-border rounded-[2.5rem] sticky top-24">
              <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
              
              <div className="space-y-4 text-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-bold">₹{delivery}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount (SKIN20)</span>
                    <span className="font-bold">-₹{discount}</span>
                  </div>
                )}
                <div className="h-[1px] bg-border my-6" />
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Apply Coupon (SKIN20)"
                    className="w-full pl-10 pr-4 py-4 rounded-2xl bg-background border border-border focus:ring-2 ring-primary outline-none"
                  />
                </div>
                <Link 
                  href="/checkout"
                  className="w-full py-5 bg-primary text-primary-foreground rounded-2xl text-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Checkout
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
