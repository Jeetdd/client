"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://server-hw5w.onrender.com';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: setAuth } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setAuth(data.token, data.user);
      router.push(data.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col pt-20">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Brand Info Section */}
          <div className="hidden lg:block space-y-10 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-7xl font-black font-outfit tracking-tight">Your Skin. <br /><span className="text-primary italic">Simplified.</span></h1>
              <p className="text-2xl text-muted-foreground font-medium">Join 50,000+ people who use SkinShop for seamless, prescription-verified healthcare.</p>
            </div>
            
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, text: "Official Pharmacist Verification", color: "text-emerald-500" },
                { icon: CheckCircle2, text: "AI-Powered Prescription Analysis", color: "text-primary" },
                { icon: ArrowRight, text: "Free Doorstep Delivery", color: "text-primary" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={`p-4 bg-secondary/50 rounded-2xl group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <p className="text-xl font-bold">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-md mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-10 rounded-[3.5rem] border border-white/10 shadow-2xl relative bg-secondary/10 backdrop-blur-3xl"
            >
              <div className="flex bg-secondary/40 p-2 rounded-2xl mb-10">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${isLogin ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${!isLogin ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                  Register
                </button>
              </div>

              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-black font-outfit">{isLogin ? "Welcome Back" : "Create Account"}</h2>
                <p className="text-muted-foreground font-medium">{isLogin ? "Unlock your medical dashboard." : "Start your skincare journey today."}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                          required={!isLogin}
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full pl-12 pr-6 py-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary outline-none transition-all font-medium"
                          placeholder="your full name"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary outline-none transition-all font-medium"
                      placeholder="hello@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</label>
                    {isLogin && <button type="button" className="text-[10px] uppercase font-black text-primary hover:underline">Forgot?</button>}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                      required
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-secondary/50 rounded-2xl border border-border focus:border-primary outline-none transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold text-center">
                    {error}
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Register"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  {isLogin ? "New to SkinShop?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary font-bold hover:underline"
                  >
                    {isLogin ? "Sign up for free" : "Return to Log In"}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </main>
  );
}
