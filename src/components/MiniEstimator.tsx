import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowRight, Truck, Package, Box, ShoppingCart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const MiniEstimator = () => {
  const [loadSize, setLoadSize] = useState<'quarter' | 'half' | 'threeQuarter' | 'full'>('quarter');

  const pricing = {
    quarter: 150,
    half: 250,
    threeQuarter: 350,
    full: 450,
  };

  const loadSizeInfo = {
    quarter: {
      label: '1/4 Truck',
      description: 'Small items, single room cleanout',
      visualItems: ['📦', '🪑', '🗑️'],
      examples: 'Few furniture pieces, appliances, or small debris'
    },
    half: {
      label: '1/2 Truck',
      description: 'Medium cleanout, multiple rooms',
      visualItems: ['🛋️', '📺', '🪑', '🗑️', '📦'],
      examples: 'Furniture, appliances, garage cleanout'
    },
    threeQuarter: {
      label: '3/4 Truck',
      description: 'Large cleanout, entire home',
      visualItems: ['🛋️', '📺', '🪑', '🗑️', '📦', '🚪'],
      examples: 'Whole house cleanout, basement, garage'
    },
    full: {
      label: 'Full Truck',
      description: 'Maximum load, estate cleanout',
      visualItems: ['🛋️', '📺', '🪑', '🗑️', '📦', '🚪', '🏠'],
      examples: 'Estate cleanout, commercial, large debris'
    }
  };

  const estimate = pricing[loadSize];
  const currentLoadInfo = loadSizeInfo[loadSize];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-8 backdrop-blur-sm relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Calculator className="w-6 h-6 text-primary" />
          </motion.div>
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase">Quick Estimate</h3>
            <p className="text-sm text-gray-600 font-medium">Get instant pricing</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Enhanced Load Size Selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase">Truck Load Size</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(loadSizeInfo).map(([key, info], index) => (
                <motion.button
                  key={key}
                  onClick={() => setLoadSize(key as typeof loadSize)}
                  className={`p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                    loadSize === key
                      ? 'border-primary bg-primary/10 shadow-md scale-105'
                      : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Visual items indicator */}
                  <div className="flex items-center gap-1 mb-2">
                    {info.visualItems.map((item, i) => (
                      <motion.span
                        key={i}
                        className="text-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                  
                  <div className="font-bold text-gray-900 text-sm mb-1">{info.label}</div>
                  <div className="text-primary font-black text-lg">${pricing[key as keyof typeof pricing]}</div>
                  
                  {/* Description tooltip */}
                  <div className="text-xs text-gray-500 mt-1 font-medium">
                    {info.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Enhanced Estimate Display */}
          <motion.div 
            className="bg-gradient-to-br from-primary via-orange-600 to-red-600 rounded-2xl p-6 text-white relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full blur-lg animate-pulse delay-100" />
            
            <div className="relative z-10">
              <div className="text-sm font-bold uppercase mb-2 text-white/90">Your Estimate</div>
              <div className="flex items-baseline gap-2 mb-3">
                <motion.span 
                  className="text-5xl font-black"
                  key={estimate}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  ${estimate}
                </motion.span>
                <span className="text-lg font-semibold text-white/80">approx.</span>
              </div>
              
              {/* Load size details */}
              <div className="bg-white/20 rounded-lg p-3 mb-4 backdrop-blur-sm">
                <div className="text-xs font-semibold mb-1">{currentLoadInfo.label}</div>
                <div className="text-xs text-white/90">{currentLoadInfo.examples}</div>
              </div>
              
              <Button
                asChild
                className="w-full bg-white text-primary hover:bg-gray-100 font-black text-base py-6 rounded-xl shadow-xl hover:scale-105 transition-all uppercase relative overflow-hidden group"
              >
                <a href="/estimate" className="flex items-center justify-center gap-2">
                  <span className="relative z-10 flex items-center gap-2">
                    Full Calculator
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Enhanced Trust Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-gray-100">
            {[
              { icon: Shield, text: "Licensed & Insured", color: "text-blue-600" },
              { icon: Truck, text: "Same-Day Service", color: "text-green-600" },
              { icon: Package, text: "Eco-Friendly", color: "text-purple-600" },
              { icon: Calculator, text: "Best Prices", color: "text-orange-600" },
            ].map((badge, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <badge.icon className={`w-4 h-4 ${badge.color}`} />
                <span className="text-xs font-bold text-gray-700">{badge.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Urgency indicator */}
          <motion.div
            className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 text-orange-600 font-bold text-sm">
              <motion.div
                className="w-2 h-2 bg-orange-600 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span>Limited Time: Book Today & Save 10%!</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniEstimator;
