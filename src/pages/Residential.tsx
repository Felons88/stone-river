import { motion } from "framer-motion";
import { ArrowRight, Home, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Residential = () => {
  const items = [
    "Furniture (Sofas, Chairs, Tables, Beds)",
    "Appliances (Refrigerators, Washers, Dryers, Stoves)",
    "Electronics (TVs, Computers, Stereos)",
    "Mattresses & Box Springs",
    "Hot Tubs & Spas",
    "Carpets & Rugs",
    "Exercise Equipment",
    "Yard Waste & Debris",
    "Garage Cleanouts",
    "Estate Cleanouts",
    "Basement & Attic Cleanouts",
    "Storage Unit Cleanouts"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border-2 border-primary/20 rounded-full mb-6">
              <Home className="w-6 h-6 text-primary" />
              <span className="font-bold text-gray-900">Residential Services</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6 uppercase">
              RESIDENTIAL JUNK{" "}
              <span className="text-primary">REMOVAL</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
              Professional junk removal for your home. We handle everything from single items to complete house cleanouts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 hover:scale-105 font-black text-xl px-12 py-8 rounded-2xl shadow-2xl uppercase"
              >
                GET A FREE QUOTE!
                <ArrowRight className="ml-3 h-7 w-7" />
              </Button>
              <a href="tel:+16126854696" className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:border-primary hover:shadow-lg transition-all group">
                <Phone className="w-6 h-6 text-primary" />
                <div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Call Now</div>
                  <div className="text-xl font-black text-gray-900 group-hover:text-primary">(612) 685-4696</div>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Remove */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 text-center uppercase">
              WHAT WE REMOVE
            </h2>
            <p className="text-xl text-gray-700 text-center mb-12 font-medium">
              From single items to full home cleanouts, we handle it all!
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors"
                >
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="text-gray-900 font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-16 text-center uppercase">
            HOW IT WORKS
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Contact Us",
                description: "Call or fill out our online form for a free quote. We'll ask about what you need removed."
              },
              {
                step: "2",
                title: "We Come To You",
                description: "Our professional team arrives at your scheduled time. We do all the heavy lifting!"
              },
              {
                step: "3",
                title: "Done!",
                description: "We haul everything away and clean up. Items are donated or recycled when possible."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-700 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 uppercase">
            READY TO CLEAR THE CLUTTER?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get your free quote today! Same-day service available.
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 font-black text-xl px-12 py-8 rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase"
          >
            GET FREE QUOTE NOW!
            <ArrowRight className="ml-3 h-7 w-7" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Residential;
