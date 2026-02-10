import { motion } from "framer-motion";
import { ArrowRight, Star, Shield, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import MiniEstimator from "./MiniEstimator";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/3 to-blue-500/3 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Professional Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap items-center gap-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-gray-200 shadow-md">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-black text-gray-900">5.0</span>
                <span className="text-sm font-semibold text-gray-600">• 1,659+ Reviews</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white shadow-md">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-bold">Licensed & Insured</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white shadow-md">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">Same-Day Available</span>
              </div>
            </motion.div>

            {/* Professional Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.1]">
              <span className="block text-gray-900">Professional Junk Removal</span>
              <span className="block bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Central Minnesota</span>
            </h1>

            {/* Professional Subheadline */}
            <div className="space-y-3">
              <p className="text-xl sm:text-2xl text-gray-700 max-w-2xl leading-relaxed font-semibold">
                Fast, reliable junk removal service for homes and businesses across Central Minnesota.
              </p>
              <div className="flex flex-wrap gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Eco-Friendly Disposal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Fully Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-semibold">24hr Response</span>
                </div>
              </div>
            </div>

            {/* Professional CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-orange-600 text-white hover:shadow-2xl hover:scale-105 font-bold text-lg px-10 py-7 rounded-xl transition-all"
              >
                <a href="/quote" className="flex items-center gap-2">
                  Get Free Quote
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
              <a href="tel:+16126854696" className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl">📞</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Call Now</div>
                  <div className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">(612) 685-4696</div>
                </div>
              </a>
            </div>

            {/* Service Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-2 gap-4 pt-4 max-w-md"
            >
              {[
                { icon: "✓", text: "No Hidden Fees", color: "bg-green-50 border-green-200 text-green-700" },
                { icon: "♻️", text: "We Recycle", color: "bg-blue-50 border-blue-200 text-blue-700" },
                { icon: "⚡", text: "Fast Service", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
                { icon: "💯", text: "100% Satisfaction", color: "bg-purple-50 border-purple-200 text-purple-700" },
              ].map((badge, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl ${badge.color}`}>
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-sm font-bold">{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Mini Estimator */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="relative"
          >
            <MiniEstimator />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
