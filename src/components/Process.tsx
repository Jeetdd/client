"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, Search, ShoppingBag, Truck } from 'lucide-react';

const steps = [
  {
    title: "Upload Prescription",
    description: "Upload your doctor's prescription and let our AI instantly verify your needs.",
    icon: <FileUp className="w-8 h-8" />,
    color: "bg-indigo-500/10 text-indigo-500"
  },
  {
    title: "Add to Cart",
    description: "Review detected medicines, adjust your dosages, and add items to your bag.",
    icon: <ShoppingBag className="w-8 h-8" />,
    color: "bg-purple-500/10 text-purple-500"
  },
  {
    title: "Choose Delivery",
    description: "Pick doorstep delivery or convenient pick-up from our nearest partner store.",
    icon: <Truck className="w-8 h-8" />,
    color: "bg-emerald-500/10 text-emerald-500"
  },
  {
    title: "Get Medicines",
    description: "Receive your verified medications safely with professional pharmacist support.",
    icon: <Search className="w-8 h-8" />,
    color: "bg-amber-500/10 text-amber-500"
  }
];

export default function Process() {
  return (
    <section id="process" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How it Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A seamless experience designed to make healthcare accessible and effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-3xl bg-background border border-border group hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-10 text-border">
                  <div className="w-8 h-[2px] bg-border" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
