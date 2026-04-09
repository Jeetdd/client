"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Store, 
  Clock, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  Calendar,
  Ticket,
  ChevronRight,
  Info,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from "@/components/AuthContext";

export default function CheckoutPage() {
  const { items, prescriptionUrl, clearCart } = useCart();
  const { user } = useAuth();
  const [deliveryType, setDeliveryType] = useState<'home' | 'pickup'>('home');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [coupon, setCoupon] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');

  type CheckoutResponse = {
    id?: string;
    _id?: string;
    message?: string;
  };

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  React.useEffect(() => {
    if (!user) return;
    setFormData((current) => ({
      ...current,
      name: current.name || user.name || "",
      email: user.email || current.email,
    }));
  }, [user]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCharge = deliveryType === 'home' ? 50 : 0;
  const discount = isCouponApplied ? subtotal * 0.2 : 0;
  const total = subtotal + deliveryCharge - discount;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      alert('Your cart is empty. Add at least one medicine before checkout.');
      return;
    }

    if (deliveryType === 'pickup' && !selectedSlot) {
      alert('Please select a pickup slot before placing the order.');
      return;
    }

    if (!formData.name || !formData.phone || !formData.email || (deliveryType === 'home' && !formData.address)) {
      alert('Please complete all required checkout details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveEmail = user?.email || formData.email;
      const orderData = {
        user: {
          name: formData.name,
          email: effectiveEmail,
          phone: formData.phone
        },
        items: items.map(item => ({
          medicineId: item.medicineId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          dosage: item.dosage,
          frequency: item.frequency
        })),
        totalAmount: total,
        address: deliveryType === 'home' ? formData.address : `PICKUP: ${selectedSlot}`,
        prescriptionUrl: prescriptionUrl
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server-hw5w.onrender.com'}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const data = await res.json() as CheckoutResponse;
        const createdOrderId = data.id || data._id;

        if (!createdOrderId) {
          throw new Error('Order created but id is missing in response.');
        }

        setOrderId(createdOrderId.slice(-8).toUpperCase());
        setOrderPlaced(true);
        clearCart();
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Failed to place order. Please try again.' })) as CheckoutResponse;
        alert(errorData.message || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err instanceof Error ? err.message : 'Error connecting to payment gateway');
    } finally {
      setIsSubmitting(false);
    }
  };

  interface Slot {
    id: string;
    date: string;
    timeSlot: string;
    maxBookings: number;
    currentBookings: number;
  }

  const [dbSlots, setDbSlots] = useState<Slot[]>([]);

  React.useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server-hw5w.onrender.com'}/api/slots`);
        if (res.ok) {
          const data = await res.json();
          setDbSlots(data);
        }
      } catch (err) {
        console.error('Failed to fetch slots:', err);
      }
    };
    fetchSlots();
  }, []);

  const timeSlots = dbSlots.map(s => s.timeSlot);

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-24 pb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full glass p-12 rounded-[3.5rem] text-center space-y-8 border border-primary/20 shadow-2xl bg-secondary/10 backdrop-blur-3xl"
          >
            <div className="w-28 h-28 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-14 h-14 stroke-[2.5px] scale-110" />
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl font-black font-outfit tracking-tight">Order Confirmed!</h1>
              <p className="text-xl text-muted-foreground font-medium">
                Your order <span className="text-primary font-bold">#{orderId}</span> has been received. 
              </p>
            </div>
            
            <div className="p-8 bg-background/50 rounded-[2.5rem] border border-border text-left space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                What's Next?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {deliveryType === 'home' 
                  ? "A licensed pharmacist is reviewing your prescription. Once verified, your medicines will be dispatched and arrive within 24 hours." 
                  : `Your order will be ready for pickup at our partner store during your selected slot: ${selectedSlot}.`}
              </p>
              <div className="pt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-bold text-lg">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-6">
              <Link href="/" className="inline-block px-12 py-5 bg-primary text-primary-foreground rounded-full text-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30">
                Back to Shopping
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 font-outfit">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Main Checkout Section */}
          <div className="flex-[2] space-y-16">
            <header className="space-y-3">
              <h1 className="text-6xl font-black tracking-tight font-outfit">Secure Checkout</h1>
              <p className="text-2xl text-muted-foreground">Premium healthcare, delivered with care.</p>
            </header>

            {/* Delivery Method */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm">
                  <Truck className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold">Delivery Method</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div 
                  onClick={() => setDeliveryType('home')}
                  className={`relative p-10 rounded-[3rem] border-2 cursor-pointer transition-all group overflow-hidden ${
                    deliveryType === 'home' 
                      ? 'bg-primary shadow-2xl shadow-primary/20 border-primary text-white scale-[1.02]' 
                      : 'bg-secondary/20 border-border hover:border-primary/40 hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={`p-5 rounded-3xl ${deliveryType === 'home' ? 'bg-white/10 text-white' : 'bg-secondary text-primary'}`}>
                      <Home className="w-8 h-8" />
                    </div>
                    {deliveryType === 'home' && <CheckCircle2 className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 relative z-10">Home Delivery</h3>
                  <p className={`${deliveryType === 'home' ? 'text-white/80' : 'text-muted-foreground'} relative z-10 font-medium`}>
                    Doorstep delivery within 24 hours of pharmacist verification.
                  </p>
                  <div className="mt-6 flex items-center gap-2 relative z-10">
                    <span className="text-xl font-black">₹50.00</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${deliveryType === 'home' ? 'bg-white/20' : 'bg-primary/10 text-primary'} font-bold`}>FASTEST</span>
                  </div>
                </div>

                <div 
                  onClick={() => setDeliveryType('pickup')}
                  className={`relative p-10 rounded-[3rem] border-2 cursor-pointer transition-all group overflow-hidden ${
                    deliveryType === 'pickup' 
                      ? 'bg-primary shadow-2xl shadow-primary/20 border-primary text-white scale-[1.02]' 
                      : 'bg-secondary/20 border-border hover:border-primary/40 hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={`p-5 rounded-3xl ${deliveryType === 'pickup' ? 'bg-white/10 text-white' : 'bg-secondary text-primary'}`}>
                      <Store className="w-8 h-8" />
                    </div>
                    {deliveryType === 'pickup' && <CheckCircle2 className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 relative z-10">Shop Pickup</h3>
                  <p className={`${deliveryType === 'pickup' ? 'text-white/80' : 'text-muted-foreground'} relative z-10 font-medium`}>
                    Self-collect from our verified partner pharmacies.
                  </p>
                  <div className="mt-6 flex items-center gap-2 relative z-10">
                    <span className={`text-xl font-black ${deliveryType === 'pickup' ? 'text-white' : 'text-emerald-500'}`}>FREE</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${deliveryType === 'pickup' ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500'} font-bold`}>SAVINGS</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Pickup Slots */}
            <AnimatePresence>
              {deliveryType === 'pickup' && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold">Select Pickup Time</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {dbSlots.map((slot, i) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(`${new Date(slot.date).toLocaleDateString()} ${slot.timeSlot}`)}
                        className={`p-6 rounded-[2rem] border-2 font-bold transition-all text-sm flex flex-col items-center gap-1 ${
                          selectedSlot === `${new Date(slot.date).toLocaleDateString()} ${slot.timeSlot}`
                            ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.05]' 
                            : 'bg-secondary/30 border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="opacity-60 text-[10px] uppercase tracking-widest">{new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span>{slot.timeSlot}</span>
                      </button>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Shipping Info */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-secondary/10 p-10 rounded-[3rem] border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-2">Full Name</label>
                  <input 
                    placeholder="e.g. John Doe" 
                    className="w-full p-6 rounded-2xl bg-secondary/30 border border-border outline-none focus:ring-4 ring-primary transition-all font-bold text-lg" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground ml-2">Phone Number</label>
                  <input 
                    placeholder="+91 98765 43210" 
                    className="w-full p-6 rounded-2xl bg-secondary/30 border border-border outline-none focus:ring-4 ring-primary transition-all font-bold text-lg" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-muted-foreground ml-2">Email Address</label>
                  <input 
                    placeholder="john@example.com" 
                    disabled={Boolean(user?.email)}
                    className={`w-full p-6 rounded-2xl border border-border outline-none focus:ring-4 ring-primary transition-all font-bold text-lg ${user?.email ? "bg-secondary/10 text-muted-foreground cursor-not-allowed" : "bg-secondary/30"}`} 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                {deliveryType === 'home' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 md:col-span-2 overflow-hidden">
                    <label className="text-sm font-bold text-muted-foreground ml-2">Delivery Address</label>
                    <textarea 
                      placeholder="Detailed address with landmark..." 
                      rows={4} 
                      className="w-full p-6 rounded-2xl bg-secondary/30 border border-border outline-none focus:ring-4 ring-primary transition-all font-bold text-lg resize-none" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </motion.div>
                )}
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <div className="flex-1">
            <div className="sticky top-32 space-y-8">
              <div className="glass p-12 rounded-[4rem] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden bg-secondary/5 backdrop-blur-2xl">
                <div className="absolute -top-10 -right-10 p-8 text-primary opacity-[0.03]">
                  <ShoppingCart className="w-56 h-56" />
                </div>
                
                <h3 className="text-4xl font-black mb-12 relative z-10 font-outfit">Order Summary</h3>
                
                <div className="space-y-8 mb-12 relative z-10">
                  <div className="flex justify-between items-center text-xl">
                    <span className="text-muted-foreground font-medium">Subtotal</span>
                    <span className="font-black">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl">
                    <span className="text-muted-foreground font-medium">Delivery Fee</span>
                    <span className={`font-black ${deliveryType === 'pickup' ? 'text-emerald-500' : ''}`}>
                      {deliveryType === 'home' ? '₹50.00' : 'FREE'}
                    </span>
                  </div>
                  
                  {isCouponApplied && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center text-xl text-emerald-500 font-black">
                      <span className="flex items-center gap-2">
                        <Ticket className="w-5 h-5" />
                        Discount (20%)
                      </span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </motion.div>
                  )}
                  
                  <div className="h-[2px] bg-white/5 my-10" />
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-lg text-muted-foreground font-bold">Total Amount</span>
                    <span className="text-6xl font-black tracking-tightest text-primary font-outfit">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon Tab */}
                <div className="space-y-5 mb-12 relative z-10">
                  <div className="flex items-center gap-3 text-xs text-primary font-black uppercase tracking-[0.2em] mb-2 px-2">
                    <Ticket className="w-4 h-4" />
                    Special Disount
                  </div>
                  <div className="flex gap-3">
                    <input 
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      placeholder="Coupon Code" 
                      className="flex-1 p-5 rounded-2xl bg-secondary/50 border border-border outline-none focus:ring-4 ring-primary font-black uppercase transition-all text-sm"
                    />
                    <button 
                      onClick={() => {
                        if (coupon === 'SKIN20') setIsCouponApplied(true);
                      }}
                      className="px-8 py-5 bg-white text-black font-black rounded-2xl hover:bg-border transition-all active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                  {isCouponApplied && (
                    <p className="text-sm text-emerald-500 font-bold flex items-center gap-2 animate-bounce-subtle px-2">
                      <CheckCircle2 className="w-4 h-4" />
                      SKIN20 Code Applied!
                    </p>
                  )}
                </div>

                <div className="space-y-5 relative z-10">
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={items.length === 0 || (deliveryType === 'pickup' && !selectedSlot) || !formData.name || !formData.phone || !formData.email || (deliveryType === 'home' && !formData.address) || isSubmitting}
                    className="w-full py-8 bg-primary text-primary-foreground rounded-[2.5rem] text-2xl font-black flex items-center justify-center gap-4 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] disabled:opacity-30 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed group font-outfit"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <>
                        Confirm & Complete
                        <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-muted-foreground text-sm font-bold flex items-center justify-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Encrypted Secure Checkout
                  </p>
                </div>
              </div>

              {/* Assistance Card */}
              <div className="p-10 bg-secondary/20 rounded-[3rem] border border-border flex items-center justify-between group cursor-pointer hover:bg-secondary/30 transition-all">
                <div className="flex gap-6 items-center">
                  <div className="p-4 bg-background rounded-2xl shadow-inner">
                    <Info className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xl font-outfit">Medical Assistance?</h4>
                    <p className="text-sm text-muted-foreground font-medium">Talk to our experts 24/7.</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
