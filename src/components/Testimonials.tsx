import { motion } from "framer-motion";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Boston, MA",
      text: "StoneRiver did an amazing job removing our old furniture. The team was professional, fast, and the price was very reasonable. Highly recommend!",
      rating: 5,
      image: "👩"
    },
    {
      name: "Mike Chen",
      location: "Cambridge, MA",
      text: "Best junk removal service I've used! They arrived on time, worked efficiently, and cleaned up everything. Will definitely use them again.",
      rating: 5,
      image: "👨"
    },
    {
      name: "Emily Rodriguez",
      location: "Somerville, MA",
      text: "Fantastic service from start to finish. They helped clear out my entire basement and donated items that were still usable. Great company!",
      rating: 5,
      image: "👩"
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-4 uppercase">
            HEAR FROM OUR CUSTOMERS
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-2xl font-black text-gray-900">5.0</span>
          </div>
          <p className="text-xl text-gray-700 font-semibold">
            1,659+ Reviews on Google
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Google Reviews Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.google.com/search?q=stoneriver+junk+removal"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-lg transition-colors"
          >
            Read more reviews on Google →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
