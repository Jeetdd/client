import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Process from "@/components/Process";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      
      <Process />

      {/* Product Showcase / CTA Section */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
            <div className="relative w-full lg:w-1/2">
              <div className="absolute inset-0 bg-neutral-100 rounded-[3rem] -rotate-3 -z-10" />
              <img 
                src="/skinnonest_products_lineup_1776255102224.png" 
                alt="SKINNONEST Product Lineup" 
                className="w-full h-auto rounded-[3rem] shadow-2xl shadow-black/10 hover:scale-[1.02] transition-transform duration-700"
              />
            </div>

            <div className="w-full lg:w-1/2 space-y-10 text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black leading-tight uppercase">
                Ready to transform your <br />
                healthcare journey?
              </h2>
              <p className="text-lg font-medium text-slate-500 max-w-xl mx-auto lg:mx-0">
                Join thousands of users who have simplified their medicine ordering process with AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
                <Link href="/upload">
                  <button className="group flex items-center justify-center gap-3 px-12 py-5 bg-black text-white rounded-lg text-lg font-bold hover:scale-105 transition-all shadow-xl shadow-black/10">
                    <Upload className="w-5 h-5 group-hover:animate-bounce" />
                    Upload Now
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle Branding Watermark */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 pointer-events-none opacity-[0.03]">
          <span className="text-[20vw] font-black tracking-tighter uppercase whitespace-nowrap">SKINNONEST</span>
        </div>
      </section>

      <Footer />
    </main>
  );
}
