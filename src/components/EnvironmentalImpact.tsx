import { motion } from "framer-motion";
import { Leaf, Recycle, Heart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const EnvironmentalImpact = () => {
  const [counts, setCounts] = useState({
    recycled: 0,
    donated: 0,
    diverted: 0,
    trees: 0,
  });

  const targets = {
    recycled: 52, // tons
    donated: 1240, // items
    diverted: 89, // percentage
    trees: 156, // trees saved
  };

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounts({
        recycled: Math.floor(targets.recycled * progress),
        donated: Math.floor(targets.donated * progress),
        diverted: Math.floor(targets.diverted * progress),
        trees: Math.floor(targets.trees * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounts(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: Recycle,
      value: counts.recycled,
      suffix: " tons",
      label: "Recycled This Year",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      icon: Heart,
      value: counts.donated,
      suffix: "+",
      label: "Items Donated",
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      icon: TrendingUp,
      value: counts.diverted,
      suffix: "%",
      label: "Diverted from Landfills",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: Leaf,
      value: counts.trees,
      suffix: "",
      label: "Trees Saved",
      color: "from-green-600 to-lime-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border-2 border-green-200 rounded-full mb-6">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="font-bold text-green-700 text-sm uppercase tracking-wide">Environmental Impact</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-4">
            Together, We're Making a{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Difference
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every pickup creates opportunities. Here's our collective impact on the environment and community.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} border-2 ${stat.borderColor} rounded-2xl p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-black text-gray-900 mb-2">
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-gray-700 font-bold text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Our Commitment</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-black">✓</span>
                    </div>
                    <span className="text-gray-700 font-semibold">Donate usable items to local charities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-black">✓</span>
                    </div>
                    <span className="text-gray-700 font-semibold">Recycle metals, electronics, and materials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-black">✓</span>
                    </div>
                    <span className="text-gray-700 font-semibold">Partner with eco-friendly disposal facilities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-black">✓</span>
                    </div>
                    <span className="text-gray-700 font-semibold">Minimize landfill waste whenever possible</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Community Impact</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-semibold">Supporting local nonprofits with donations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-semibold">Creating local jobs in Central Minnesota</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-semibold">Helping families in need with furniture</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-semibold">Reducing environmental impact together</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EnvironmentalImpact;
