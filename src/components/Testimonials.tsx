import { motion } from "framer-motion";
import { Star, Quote, MapPin, Calendar, CheckCircle, Shield } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Minneapolis, MN",
      text: "StoneRiver did an amazing job removing our old furniture. The team was professional, fast, and the price was very reasonable. Highly recommend!",
      rating: 5,
      date: "2 weeks ago",
      service: "Residential Cleanout",
      verified: true,
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c1ca?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Mike Chen",
      location: "St. Paul, MN", 
      text: "Best junk removal service I've used! They arrived on time, worked efficiently, and cleaned up everything. Will definitely use them again.",
      rating: 5,
      date: "1 month ago",
      service: "Commercial Removal",
      verified: true,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      location: "Wayzata, MN",
      text: "Fantastic service from start to finish. They helped clear out my entire basement and donated items that were still usable. Great company!",
      rating: 5,
      date: "3 weeks ago",
      service: "Estate Cleanout",
      verified: true,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "David Thompson",
      location: "Eden Prairie, MN",
      text: "Professional team that handled our office renovation cleanup perfectly. They were careful with our property and got the job done quickly.",
      rating: 5,
      date: "2 months ago",
      service: "Commercial",
      verified: true,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Lisa Anderson",
      location: "Plymouth, MN",
      text: "Called them in the morning and they came the same day! Removed our old hot tub and deck materials. Fast, affordable, and professional.",
      rating: 5,
      date: "1 week ago",
      service: "Demolition",
      verified: true,
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Robert Martinez",
      location: "Minnetonka, MN",
      text: "Excellent service! They cleaned out our garage and even swept up afterwards. The team was friendly and worked efficiently.",
      rating: 5,
      date: "3 days ago",
      service: "Residential",
      verified: true,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/20 rounded-full mb-6">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="font-bold text-primary text-sm uppercase tracking-wide">Customer Reviews</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6">
            What Our Customers Say
          </h2>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-3xl font-black text-gray-900">5.0</span>
          </div>
          
          <p className="text-xl text-gray-700 font-semibold mb-8">
            1,659+ Verified Reviews on Google
          </p>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Verified Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">5-Star Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Local Service</span>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all relative group"
            >
              {/* Verified Badge */}
              {testimonial.verified && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  VERIFIED
                </div>
              )}

              {/* Quote Icon */}
              <div className="absolute top-4 left-4 text-primary/20 group-hover:text-primary/30 transition-colors">
                <Quote className="w-8 h-8" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                "{testimonial.text}"
              </p>

              {/* Service Type */}
              <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mb-4">
                {testimonial.service}
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    {testimonial.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {testimonial.date}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Google Reviews Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl p-8 border-2 border-primary/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              Read More Reviews
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of satisfied customers. See what they're saying about our service on Google.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.google.com/search?q=stoneriver+junk+removal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-xl hover:border-primary hover:shadow-lg transition-all group"
              >
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="group-hover:text-primary transition-colors">Google Reviews</span>
                <span className="text-sm text-gray-500">(1,659+)</span>
              </a>
              <a
                href="/quote"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                Get Your Free Quote
              </a>
            </div>
          </div>
        </motion.div>

        {/* Additional Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 max-w-4xl mx-auto">
            <h4 className="text-xl font-black text-gray-900 mb-6">Why Customers Trust StoneRiver</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: CheckCircle, text: "Licensed & Insured", color: "text-blue-600" },
                { icon: Star, text: "5-Star Rated", color: "text-yellow-500" },
                { icon: MapPin, text: "Local Company", color: "text-green-600" },
                { icon: Shield, text: "Satisfaction Guaranteed", color: "text-purple-600" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                  <span className="text-sm font-bold text-gray-700 text-center">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
