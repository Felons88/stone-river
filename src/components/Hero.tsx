import { motion } from "framer-motion";
import { ArrowRight, Star, Shield, Clock, Award, Phone, CheckCircle, Sparkles, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import MiniEstimator from "./MiniEstimator";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/3 to-blue-500/3 rounded-full blur-3xl animate-pulse" />
      
      {/* Floating elements for visual interest */}
      <div className="absolute top-32 left-20 w-8 h-8 bg-primary/20 rounded-full animate-bounce" />
      <div className="absolute top-48 right-32 w-6 h-6 bg-orange-500/20 rounded-full animate-bounce delay-100" />
      <div className="absolute bottom-32 left-40 w-10 h-10 bg-blue-500/20 rounded-full animate-bounce delay-200" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Enhanced Professional Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap items-center gap-3"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-black text-gray-900">5.0</span>
                <span className="text-sm font-semibold text-gray-600">• 1,659+ Reviews</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white shadow-md hover:shadow-lg transition-shadow">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-bold">Licensed & Insured</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white shadow-md hover:shadow-lg transition-shadow">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">Same-Day Available</span>
              </div>
            </motion.div>

            {/* Enhanced Professional Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.1]">
              <span className="block text-gray-900">Professional Junk Removal</span>
              <span className="block bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Central Minnesota</span>
            </h1>

            {/* Enhanced Professional Subheadline */}
            <div className="space-y-4">
              <p className="text-xl sm:text-2xl text-gray-700 max-w-2xl leading-relaxed font-semibold">
                Fast, reliable junk removal service for homes and businesses across Central Minnesota.
              </p>
              
              {/* Enhanced Value Propositions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Award, text: "Eco-Friendly Disposal", color: "text-green-600" },
                  { icon: Shield, text: "Fully Insured", color: "text-blue-600" },
                  { icon: Clock, text: "24hr Response", color: "text-orange-600" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${item.color.replace('text-', '')}/10 flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="font-semibold text-gray-900">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Enhanced Professional CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-primary to-orange-600 text-white hover:shadow-2xl font-bold text-lg px-10 py-7 rounded-xl transition-all relative overflow-hidden group"
                >
                  <a href="/quote" className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    Get Free Quote
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </motion.div>
              
              <motion.a 
                href="tel:+16126854696" 
                className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">Call Now</div>
                  <div className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">(612) 685-4696</div>
                </div>
              </motion.a>
            </div>

            {/* Enhanced Service Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-2 gap-4 pt-4 max-w-md"
            >
              {[
                { icon: CheckCircle, text: "No Hidden Fees", color: "bg-green-50 border-green-200 text-green-700" },
                { icon: Truck, text: "Fast Service", color: "bg-blue-50 border-blue-200 text-blue-700" },
                { icon: Users, text: "Professional Team", color: "bg-purple-50 border-purple-200 text-purple-700" },
                { icon: Award, text: "100% Satisfaction", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl ${badge.color} hover:shadow-md transition-all`}
                >
                  <badge.icon className="w-4 h-4" />
                  <span className="text-sm font-bold">{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Social Proof Counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="pt-4 border-t-2 border-gray-200"
            >
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-3xl font-black text-gray-900">10,000+</div>
                  <div className="text-sm text-gray-600 font-semibold">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-primary">5,000+</div>
                  <div className="text-sm text-gray-600 font-semibold">Jobs Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-green-600">98%</div>
                  <div className="text-sm text-gray-600 font-semibold">Satisfaction Rate</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Enhanced Mini Estimator */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -top-4 -right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm animate-pulse">
              LIMITED TIME OFFER
            </div>
            <MiniEstimator />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
