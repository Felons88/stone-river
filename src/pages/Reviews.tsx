import { motion } from "framer-motion";
import { Star, Quote, ThumbsUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Reviews = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      location: "St. Cloud, MN",
      rating: 5,
      date: "2 weeks ago",
      service: "Residential Cleanout",
      text: "Absolutely fantastic service! They removed 20 years of garage clutter in just 2 hours. The team was professional, efficient, and even swept up afterwards. Highly recommend!",
      verified: true,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Mike Peterson",
      location: "Sauk Rapids, MN",
      rating: 5,
      date: "1 month ago",
      service: "Demolition",
      text: "Had an old deck that needed to go. StoneRiver demolished it and hauled everything away same day. Fair pricing and great communication throughout. Will use again!",
      verified: true,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Jennifer Martinez",
      location: "Sartell, MN",
      rating: 5,
      date: "3 weeks ago",
      service: "Commercial Junk Removal",
      text: "We needed our office cleared out for renovation. They handled everything professionally and worked around our schedule. The team was courteous and efficient. 5 stars!",
      verified: true,
      image: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Tom Anderson",
      location: "Waite Park, MN",
      rating: 5,
      date: "1 week ago",
      service: "Residential Cleanout",
      text: "Best junk removal service in Central MN! They helped me clean out my late mother's house. Very respectful, patient, and donated usable items to charity. Thank you!",
      verified: true,
      image: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Lisa Chen",
      location: "St. Joseph, MN",
      rating: 5,
      date: "2 months ago",
      service: "Residential Cleanout",
      text: "Called them in the morning, they came same day! Removed old furniture, appliances, and yard waste. Pricing was transparent and fair. Couldn't be happier with the service.",
      verified: true,
      image: "/placeholder.svg"
    },
    {
      id: 6,
      name: "David Brown",
      location: "Cold Spring, MN",
      rating: 5,
      date: "3 weeks ago",
      service: "Demolition",
      text: "Needed a shed removed from my backyard. They gave me a quote over the phone, showed up on time, and had it done in under an hour. Professional and affordable!",
      verified: true,
      image: "/placeholder.svg"
    },
    {
      id: 7,
      name: "Amanda Wilson",
      location: "Richmond, MN",
      rating: 5,
      date: "1 month ago",
      service: "Residential Cleanout",
      text: "Excellent service from start to finish. The crew was friendly, worked quickly, and left my property cleaner than they found it. Will definitely use them again!",
      verified: true,
      image: "/placeholder.svg"
    },
    {
      id: 8,
      name: "Robert Taylor",
      location: "St. Cloud, MN",
      rating: 5,
      date: "2 weeks ago",
      service: "Commercial Junk Removal",
      text: "Used them for our retail store closure. They handled a massive amount of inventory and fixtures efficiently. Great communication and fair pricing. Highly recommend!",
      verified: true,
      image: "/placeholder.svg"
    },
  ];

  const stats = [
    { number: "1,659+", label: "Happy Customers" },
    { number: "5.0", label: "Average Rating" },
    { number: "98%", label: "Would Recommend" },
    { number: "24hr", label: "Response Time" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/20 rounded-full mb-6">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="font-bold text-primary text-sm uppercase tracking-wide">Customer Reviews</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6">
              What Our Customers{" "}
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Say</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              Real reviews from real customers across Central Minnesota.
            </p>
            
            {/* Star Rating Display */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="text-2xl font-black text-gray-900">5.0 out of 5 stars</p>
            <p className="text-gray-600">Based on 1,659+ reviews</p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y-2 border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-black text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-black text-primary">
                        {review.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">{review.name}</h3>
                      <p className="text-xs text-gray-500 font-semibold">{review.location}</p>
                    </div>
                  </div>
                  {review.verified && (
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                      ✓ Verified
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                {/* Service Type */}
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase mb-4">
                  {review.service}
                </div>

                {/* Review Text */}
                <div className="relative mb-4">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
                  <p className="text-gray-700 leading-relaxed pl-6">{review.text}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <span className="font-semibold">{review.date}</span>
                  <button className="flex items-center gap-1 text-primary hover:text-primary/80 font-bold">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Video Testimonials
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear directly from our satisfied customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[1, 2].map((video) => (
              <motion.div
                key={video}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-200 rounded-2xl aspect-video flex items-center justify-center border-2 border-gray-300 hover:border-primary transition-colors cursor-pointer group"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-2" />
                  </div>
                  <p className="text-gray-600 font-bold">Video Testimonial #{video}</p>
                  <p className="text-sm text-gray-500">Coming Soon</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl p-12 border-2 border-blue-200 text-center"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              See All Our Google Reviews
            </h2>
            <p className="text-gray-700 mb-8 text-lg">
              Check out our full collection of verified reviews on Google
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 font-bold text-lg px-10 py-6"
            >
              <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                View Google Reviews
                <ExternalLink className="w-5 h-5" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Leave a Review CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Had a Great Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            We'd love to hear from you! Leave us a review and help others find quality junk removal service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-gray-100 font-black text-lg px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase"
            >
              Leave a Review
              <Star className="w-5 h-5 fill-primary" />
            </a>
            <a
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10 font-black text-lg px-10 py-5 rounded-2xl transition-all uppercase"
            >
              Get a Quote
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Reviews;
