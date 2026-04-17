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
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <Hero />
      
      {/* Dynamic Stats Section */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 relative z-10">
            {[
              { label: "Active Patients", value: "25k+", icon: <Star className="w-5 h-5" /> },
              { label: "Medicine Catalog", value: "5k+", icon: <Shield className="w-5 h-5" /> },
              { label: "AI Precision", value: "99.8%", icon: <Zap className="w-5 h-5" /> },
              { label: "Direct Support", value: "24/7", icon: <TrendingUp className="w-5 h-5" /> },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-6 text-center group">
                <div className="mb-0 p-6 rounded-[1.5rem] bg-white/5 border border-white/5 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-700 shadow-2xl">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">{stat.value}</div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <About />
      <Process />
      <OffersDeals />

      {/* Register & Earn Prompt - Premium Dark Mode */}
      <section className="py-40 bg-slate-950 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-24 bg-indigo-600 p-20 lg:p-32 rounded-[4rem] shadow-[0_40px_100px_rgba(79,70,229,0.4)] relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] group-hover:bg-white/20 transition-all duration-1000" />
            
            <div className="space-y-10 text-center lg:text-left relative z-10">
              <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-white/20 text-white text-[11px] font-black uppercase tracking-[0.4em] backdrop-blur-md">
                <Gift className="w-5 h-5" />
                Loyalty Status
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[1]">
                Elevate Your <br />
                <span className="text-indigo-100 italic font-medium">Experience.</span>
              </h2>
              <p className="text-2xl text-indigo-100 max-w-xl font-medium leading-relaxed">
                Join our clinical community to track health metrics, earn <span className="text-white font-black underline decoration-white/30 decoration-4">10% rewards</span>, and access 24/7 pharmaceutical support.
              </p>
            </div>
            
            <div className="flex flex-col gap-8 w-full max-w-md relative z-10">
              <Link href="/login?mode=register">
                <button className="w-full flex items-center justify-center gap-5 px-14 py-8 bg-white text-slate-950 rounded-[2.5rem] text-2xl font-black hover:bg-slate-950 hover:text-white transition-all shadow-3xl active:scale-[0.98] group">
                  <UserPlus className="w-7 h-7" />
                  Sign Up Free
                  <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-3 transition-transform" />
                </button>
              </Link>
              <div className="flex items-center justify-center gap-6 pt-6">
                <div className="h-[2px] w-12 bg-white/20" />
                <p className="text-indigo-100 text-[11px] font-black uppercase tracking-[0.3em]">
                  Existing? <Link href="/login" className="text-white hover:underline underline-offset-4 decoration-2">Log In</Link>
                </p>
                <div className="h-[2px] w-12 bg-white/20" />
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

