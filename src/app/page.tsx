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
      <section className="py-24 border-y border-slate-50 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(79,70,229,0.02)_0%,transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Active Patients", value: "25k+", icon: <Star className="w-5 h-5" /> },
              { label: "Medicine Catalog", value: "5k+", icon: <Shield className="w-5 h-5" /> },
              { label: "AI Precision", value: "99.8%", icon: <Zap className="w-5 h-5" /> },
              { label: "Direct Support", value: "24/7", icon: <TrendingUp className="w-5 h-5" /> },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-4 text-center group">
                <div className="mb-2 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  {stat.icon}
                </div>
                <div className="text-5xl font-black text-slate-900 tracking-tight leading-none">{stat.value}</div>
                <div className="text-slate-300 text-[10px] font-black uppercase tracking-[0.25em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <About />
      <Process />
      <OffersDeals />

      {/* Register & Earn Prompt - Refined Design */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 bg-slate-900 p-16 lg:p-24 rounded-[4rem] shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
            
            <div className="space-y-8 text-center lg:text-left relative z-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md border border-white/10">
                <Gift className="w-4 h-4" />
                Loyalty Rewards
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[0.9]">
                Elevate Your <br />
                <span className="text-indigo-400">Experience.</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-xl font-medium leading-relaxed">
                Join the SkinShop community to access prescription tracking, earn <span className="text-white font-bold">10% points</span> on every transaction, and receive direct clinical support.
              </p>
            </div>
            
            <div className="flex flex-col gap-6 w-full max-w-sm relative z-10">
              <Link href="/register">
                <button className="w-full flex items-center justify-center gap-4 px-12 py-6 bg-white text-slate-900 rounded-[2rem] text-xl font-black hover:bg-indigo-50 transition-all shadow-2xl active:scale-[0.98] group">
                  <UserPlus className="w-6 h-6 text-indigo-600" />
                  Sign Up Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="h-[1px] w-8 bg-slate-800" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  Existing Member? <Link href="/login" className="text-white hover:text-indigo-400 transition-colors">Log In</Link>
                </p>
                <div className="h-[1px] w-8 bg-slate-800" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      <Footer />
    </main>
  );
}

