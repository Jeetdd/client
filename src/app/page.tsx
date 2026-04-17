import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Process from "@/components/Process";
import OffersDeals from "@/components/OffersDeals";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Star, Shield, Zap, TrendingUp, Gift, UserPlus, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      
      {/* Social Proof / Stats */}
      <section className="py-16 border-y border-slate-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Satisfied Patients", value: "25k+", icon: <Star className="w-5 h-5 text-amber-500" /> },
              { label: "Medicine Catalog", value: "5k+", icon: <Shield className="w-5 h-5 text-indigo-500" /> },
              { label: "AI Precision", value: "99.8%", icon: <Zap className="w-5 h-5 text-purple-500" /> },
              { label: "Delivery Success", value: "100%", icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-3 text-center transition-transform hover:scale-105">
                <div className="mb-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm text-primary">{stat.icon}</div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <About />
      <Process />
      <OffersDeals />

      {/* Register & Earn Prompt */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 bg-white/5 backdrop-blur-xl p-12 lg:p-20 rounded-[3rem] border border-white/10 shadow-2xl">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <Gift className="w-4 h-4" />
                Join the Circle
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-none">
                Unlock Premium <br />
                <span className="text-indigo-400">Benefits.</span>
              </h2>
              <p className="text-xl text-indigo-100/70 max-w-xl font-medium leading-relaxed">
                Create an account today to track your prescriptions, earn 10% loyalty points on every order, and get exclusive first-access to dermatological deals.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <Link href="/register">
                <button className="w-full flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-2xl text-lg font-black hover:bg-indigo-50 transition-all shadow-xl active:scale-95 group">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  Sign Up Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <p className="text-center text-indigo-200/40 text-xs font-bold uppercase tracking-widest pt-2">
                Already a member? <Link href="/login" className="text-white hover:underline">Log In</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      <Footer />
    </main>
  );
}
