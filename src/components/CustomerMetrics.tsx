import { motion } from "framer-motion";
import { Users, CheckCircle, Clock, Award, TrendingUp, Star, Shield, Truck } from "lucide-react";

const CustomerMetrics = () => {
  const metrics = [
    { 
      icon: Users, 
      value: "10,000+", 
      label: "Happy Customers", 
      description: "Satisfied clients across Central Minnesota",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      icon: CheckCircle, 
      value: "5,000+", 
      label: "Jobs Completed", 
      description: "Successful junk removal projects",
      color: "text-green-600", 
      bgColor: "bg-green-50"
    },
    { 
      icon: Star, 
      value: "5.0", 
      label: "Average Rating", 
      description: "Based on 1,659+ Google reviews",
      color: "text-yellow-600", 
      bgColor: "bg-yellow-50"
    },
    { 
      icon: Clock, 
      value: "24hr", 
      label: "Response Time", 
      description: "Fast response to all inquiries",
      color: "text-orange-600", 
      bgColor: "bg-orange-50"
    },
    { 
      icon: Award, 
      value: "98%", 
      label: "Satisfaction Rate", 
      description: "Customer satisfaction guaranteed",
      color: "text-purple-600", 
      bgColor: "bg-purple-50"
    },
    { 
      icon: TrendingUp, 
      value: "15+", 
      label: "Years Experience", 
      description: "Local expertise you can trust",
      color: "text-red-600", 
      bgColor: "bg-red-50"
    }
  ];

  const trustBadges = [
    { icon: Shield, text: "Licensed & Insured", color: "text-blue-600" },
    { icon: Award, text: "Award Winning Service", color: "text-yellow-600" },
    { icon: Truck, text: "Same-Day Service", color: "text-green-600" },
    { icon: CheckCircle, text: "Satisfaction Guaranteed", color: "text-purple-600" }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/20 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-sm uppercase tracking-wide">Our Impact</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6">
            Trusted by Central Minnesota
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our commitment to excellence has earned us the trust of thousands of customers throughout the region.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${metric.bgColor} rounded-2xl p-6 text-center border-2 border-transparent hover:border-primary/20 transition-all group`}
            >
              <motion.div
                className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
              >
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </motion.div>
              
              <motion.div 
                className="text-3xl font-black text-gray-900 mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: index * 0.1 + 0.2 }}
              >
                {metric.value}
              </motion.div>
              
              <div className="text-sm font-bold text-gray-900 mb-1">{metric.label}</div>
              <div className="text-xs text-gray-600 leading-relaxed">{metric.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl"
        >
          <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">Why Choose StoneRiver?</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform">
                  <badge.icon className={`w-8 h-8 ${badge.color}`} />
                </div>
                <div className="font-bold text-gray-900">{badge.text}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Live Activity Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-full px-6 py-3">
            <motion.div
              className="w-3 h-3 bg-green-600 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span className="text-green-700 font-bold">Currently serving customers in your area</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomerMetrics;
