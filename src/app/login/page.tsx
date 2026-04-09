"use client";

import React, { Suspense, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, User, Mail, Lock, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthContext";

const errorMessages: Record<string, string> = {
  google_oauth_state_mismatch: "Google sign-in expired or was interrupted. Please try again.",
  google_token_exchange_failed: "Google sign-in could not be completed. Please try again.",
  google_profile_fetch_failed: "We could not read your Google profile. Please try again.",
  google_email_not_verified: "Your Google email must be verified before you can continue.",
  google_oauth_not_configured: "Google sign-in is not configured on this deployment yet.",
  google_oauth_callback_failed: "Google sign-in failed on the server. Check deployment environment variables.",
  google_oauth_missing_client_id: "Missing GOOGLE_CLIENT_ID in deployment environment variables.",
  google_oauth_missing_client_secret: "Missing GOOGLE_CLIENT_SECRET in deployment environment variables.",
  google_oauth_missing_session_secret: "Missing AUTH_SESSION_SECRET in deployment environment variables.",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://server-hw5w.onrender.com";

function LoginContent() {
  const searchParams = useSearchParams();
  const { login: setAuth, loginWithGoogle, user } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const error = useMemo(() => {
    const code = searchParams.get("error");
    return code ? errorMessages[code] ?? "Unable to complete Google sign-in right now." : null;
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setAuth(data.token, data.user);
      router.push(data.user.role === "ADMIN" ? "/admin" : "/");
    } catch (submitError) {
      console.error("Credential sign-in failed:", submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col pt-20">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          <div className="hidden lg:block space-y-10 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-7xl font-black font-outfit tracking-tight">
                Care Access.
                <br />
                <span className="text-primary italic">One Secure Sign-In.</span>
              </h1>
              <p className="text-2xl text-muted-foreground font-medium">
                Use your Google account to unlock prescription uploads, faster checkout, and role-based access for admins.
              </p>
            </div>
            
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, text: "Secure Google OAuth session", color: "text-emerald-500" },
                { icon: CheckCircle2, text: "One-click sign up and sign in", color: "text-primary" },
                { icon: Sparkles, text: "Admins route straight to the dashboard", color: "text-amber-400" }
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-4 group">
                  <div className={`p-4 bg-secondary/50 rounded-2xl group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <p className="text-xl font-bold">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-10 rounded-[3.5rem] border border-white/10 shadow-2xl relative bg-secondary/10 backdrop-blur-3xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-[0.3em] mb-8">
                OAuth
                <span className="text-primary/50">Google</span>
              </div>

              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-black font-outfit">
                  {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Sign in to SkinShop"}
                </h2>
                <p className="text-muted-foreground font-medium">
                  Continue with Google to create your account or log back in with the same identity.
                </p>
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
                  disabled={isSubmitting}
                  className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Register"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="relative py-2">
                  <div className="border-t border-border/70" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    or
                  </span>
                </div>

                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="w-full py-5 px-6 bg-white text-slate-900 rounded-2xl font-black flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                >
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-white text-lg font-black">G</span>
                  Continue with Google
                  <ArrowRight className="w-5 h-5" />
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex flex-col pt-20">
          <Navbar />
          <div className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
            <div className="flex items-center gap-4 text-muted-foreground font-bold">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              Loading sign-in...
            </div>
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
