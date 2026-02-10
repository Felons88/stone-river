import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MiniEstimator = () => {
  const [loadSize, setLoadSize] = useState<'quarter' | 'half' | 'threeQuarter' | 'full'>('quarter');

  const pricing = {
    quarter: 150,
    half: 250,
    threeQuarter: 350,
    full: 450,
  };

  const estimate = pricing[loadSize];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-8 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900 uppercase">Quick Estimate</h3>
          <p className="text-sm text-gray-600 font-medium">Get instant pricing</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Load Size Selector */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase">Truck Load Size</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'quarter', label: '1/4 Truck', price: pricing.quarter },
              { key: 'half', label: '1/2 Truck', price: pricing.half },
              { key: 'threeQuarter', label: '3/4 Truck', price: pricing.threeQuarter },
              { key: 'full', label: 'Full Truck', price: pricing.full },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setLoadSize(option.key as typeof loadSize)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  loadSize === option.key
                    ? 'border-primary bg-primary/10 shadow-md scale-105'
                    : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
                }`}
              >
                <div className="font-bold text-gray-900 text-sm mb-1">{option.label}</div>
                <div className="text-primary font-black text-lg">${option.price}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Estimate Display */}
        <div className="bg-gradient-to-br from-primary via-orange-600 to-red-600 rounded-2xl p-6 text-white">
          <div className="text-sm font-bold uppercase mb-2 text-white/90">Your Estimate</div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-black">${estimate}</span>
            <span className="text-lg font-semibold text-white/80">approx.</span>
          </div>
          <div className="text-xs text-white/80 mb-4 leading-relaxed">
            * Based on {loadSize === 'quarter' ? '1/4' : loadSize === 'half' ? '1/2' : loadSize === 'threeQuarter' ? '3/4' : 'full'} truck load. 
            Final price determined on-site. Large items, tires & hazmat extra.
          </div>
          <Button
            asChild
            className="w-full bg-white text-primary hover:bg-gray-100 font-black text-base py-6 rounded-xl shadow-xl hover:scale-105 transition-all uppercase"
          >
            <a href="/estimate" className="flex items-center justify-center gap-2">
              Full Calculator
              <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-gray-100">
          {[
            { icon: "✓", text: "Licensed & Insured" },
            { icon: "⚡", text: "Same-Day Service" },
            { icon: "♻️", text: "Eco-Friendly" },
            { icon: "💯", text: "Best Prices" },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xl">{badge.icon}</span>
              <span className="text-xs font-bold text-gray-700">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MiniEstimator;
