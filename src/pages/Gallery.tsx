import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'residential' | 'commercial' | 'demolition'>('all');

  const galleryItems = [
    {
      id: 1,
      before: "/placeholder.svg",
      after: "/placeholder.svg",
      title: "Garage Cleanout",
      category: "residential",
      description: "Complete garage transformation in Eden Prairie. Removed 20+ years of accumulated items.",
      location: "Eden Prairie, MN",
      date: "January 2026"
    },
    {
      id: 2,
      before: "/placeholder.svg",
      after: "/placeholder.svg",
      title: "Office Renovation",
      category: "commercial",
      description: "Full office cleanout for corporate relocation. 3/4 truck load of furniture and electronics.",
      location: "St. Cloud, MN",
      date: "December 2025"
    },
    {
      id: 3,
      before: "/placeholder.svg",
      after: "/placeholder.svg",
      title: "Deck Demolition",
      category: "demolition",
      description: "Old deck removal and disposal. Eco-friendly wood recycling.",
      location: "Sauk Rapids, MN",
      date: "November 2025"
    },
    {
      id: 4,
      before: "/placeholder.svg",
      after: "/placeholder.svg",
      title: "Basement Cleanout",
      category: "residential",
      description: "Basement hoarding cleanup. Donated usable items to local charities.",
      location: "Waite Park, MN",
      date: "October 2025"
    },
    {
      id: 5,
      before: "/placeholder.svg",
      after: "/placeholder.svg",
      title: "Retail Store Closure",
      category: "commercial",
      description: "Complete retail inventory and fixture removal. Same-day service.",
      location: "Sartell, MN",
      date: "September 2025"
    },
    {
      id: 6,
      before: "/placeholder.svg",
      after: "/placeholder.svg",
      title: "Shed Removal",
      category: "demolition",
      description: "Old shed demolition and haul away. Recycled metal components.",
      location: "St. Joseph, MN",
      date: "August 2025"
    },
  ];

  const filteredItems = filter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter);

  const handlePrevious = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null && selectedImage < filteredItems.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

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
              <span className="font-bold text-primary text-sm uppercase tracking-wide">Our Work</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6">
              Before & After{" "}
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Gallery</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              See the transformations we've created for homes and businesses across Central Minnesota.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-white border-b-2 border-gray-100 sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { key: 'all', label: 'All Projects' },
              { key: 'residential', label: 'Residential' },
              { key: 'commercial', label: 'Commercial' },
              { key: 'demolition', label: 'Demolition' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  filter === tab.key
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedImage(index)}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-primary hover:shadow-2xl transition-all duration-300">
                  {/* Before/After Slider Preview */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-2">
                      <div className="relative">
                        <img src={item.before} alt="Before" className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase">
                          Before
                        </div>
                      </div>
                      <div className="relative">
                        <img src={item.after} alt="After" className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase">
                          After
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="font-bold text-gray-900">View Full Size</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase mb-3">
                      {item.category}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-semibold">📍 {item.location}</span>
                      <span className="font-semibold">{item.date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No projects found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {selectedImage > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {selectedImage < filteredItems.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl overflow-hidden"
              >
                {/* Before/After Comparison */}
                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-[4/3]">
                    <img 
                      src={filteredItems[selectedImage].before} 
                      alt="Before" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold uppercase">
                      Before
                    </div>
                  </div>
                  <div className="relative aspect-[4/3]">
                    <img 
                      src={filteredItems[selectedImage].after} 
                      alt="After" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg font-bold uppercase">
                      After
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-8">
                  <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold uppercase mb-4">
                    {filteredItems[selectedImage].category}
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-3">
                    {filteredItems[selectedImage].title}
                  </h2>
                  <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                    {filteredItems[selectedImage].description}
                  </p>
                  <div className="flex items-center gap-6 text-gray-600">
                    <span className="font-semibold">📍 {filteredItems[selectedImage].location}</span>
                    <span className="font-semibold">📅 {filteredItems[selectedImage].date}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Ready for Your Transformation?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let us help you reclaim your space. Get a free quote today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-gray-100 font-black text-lg px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase"
            >
              Get Free Quote
            </a>
            <a
              href="tel:+16126854696"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10 font-black text-lg px-10 py-5 rounded-2xl transition-all uppercase"
            >
              📞 (612) 685-4696
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
