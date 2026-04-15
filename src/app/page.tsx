import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Process from "@/components/Process";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Star, Shield, Zap, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Social Proof / Stats */}
      <section className="py-12 border-y border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Users", value: "50k+", icon: <Star className="w-5 h-5 text-yellow-500" /> },
              { label: "Medicines", value: "10k+", icon: <Shield className="w-5 h-5 text-blue-500" /> },
              { label: "AI Accuracy", value: "99.2%", icon: <Zap className="w-5 h-5 text-purple-500" /> },
              { label: "Fast Delivery", value: "24hrs", icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-center p-4">
                <div className="mb-2 p-3 rounded-full bg-secondary/50">{stat.icon}</div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Process />

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass p-12 md:p-20 rounded-[3rem] text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to transform your healthcare journey?</h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Join thousands of users who have simplified their medicine ordering process with AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link href="/upload">
                <button className="px-10 py-5 bg-primary text-primary-foreground rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/25">
                  Upload Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
