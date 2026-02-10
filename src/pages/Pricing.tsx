import { motion } from "framer-motion";
import { Truck, CheckCircle, AlertCircle, Calculator, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Pricing = () => {
  const loadSizes = [
    {
      size: "1/4 Truck",
      price: "$150",
      description: "Perfect for small cleanouts",
      capacity: "Fits approximately:",
      items: [
        "1-2 pieces of furniture",
        "Small appliance",
        "10-15 bags of items",
        "Equivalent to 1.5 pickup truck loads"
      ],
      popular: false
    },
    {
      size: "1/2 Truck",
      price: "$250",
      description: "Most common for residential jobs",
      capacity: "Fits approximately:",
      items: [
        "3-4 pieces of furniture",
        "1-2 appliances",
        "20-25 bags of items",
        "Equivalent to 3 pickup truck loads"
      ],
      popular: true
    },
    {
      size: "3/4 Truck",
      price: "$350",
      description: "Larger cleanouts and renovations",
      capacity: "Fits approximately:",
      items: [
        "5-6 pieces of furniture",
        "2-3 appliances",
        "30-35 bags of items",
        "Equivalent to 4.5 pickup truck loads"
      ],
      popular: false
    },
    {
      size: "Full Truck",
      price: "$450",
      description: "Complete property cleanouts",
      capacity: "Fits approximately:",
      items: [
        "7-10 pieces of furniture",
        "3-4 appliances",
        "40-50 bags of items",
        "Equivalent to 6 pickup truck loads"
      ],
      popular: false
    },
  ];

  const additionalCharges = [
    {
      item: "Tires",
      price: "$15 each",
      description: "Special disposal required by Minnesota regulations",
      icon: "🛞"
    },
    {
      item: "Hazardous Materials",
      price: "$50 per item",
      description: "Paint, chemicals, batteries, etc. (per Minnesota law)",
      icon: "⚠️"
    },
    {
      item: "Heavy Items",
      price: "$35 surcharge",
      description: "Pianos, safes, hot tubs, concrete slabs",
      icon: "💪"
    },
    {
      item: "Stairs",
      price: "$25 per flight",
      description: "Additional labor for items from upper floors or basements",
      icon: "🪜"
    },
    {
      item: "Disassembly",
      price: "$40 per item",
      description: "Furniture, swing sets, or structures requiring disassembly",
      icon: "🔧"
    },
  ];

  const included = [
    "All labor and loading",
    "Truck and equipment",
    "Disposal fees",
    "Recycling when possible",
    "Donation of usable items",
    "Cleanup and sweeping",
    "No hidden fees",
    "Same-day service available"
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
              <Calculator className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary text-sm uppercase tracking-wide">Transparent Pricing</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6">
              Simple, Fair{" "}
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Pricing</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              No hidden fees. No surprises. Just honest, upfront pricing based on truck load size.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {loadSizes.map((load, index) => (
              <motion.div
                key={load.size}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-3xl p-8 border-2 hover:shadow-2xl hover:-translate-y-1 transition-all relative ${
                  load.popular 
                    ? 'border-primary shadow-xl scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {load.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-black uppercase shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <Truck className={`w-16 h-16 mx-auto mb-4 ${load.popular ? 'text-primary' : 'text-gray-400'}`} />
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{load.size}</h3>
                  <div className="text-4xl font-black text-primary mb-2">{load.price}</div>
                  <p className="text-sm text-gray-600 font-semibold">{load.description}</p>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-3">{load.capacity}</p>
                  <ul className="space-y-2">
                    {load.items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  asChild
                  className={`w-full font-bold ${
                    load.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <a href="/booking">Book Now</a>
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Not sure what size you need? Use our calculator or give us a call!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-bold">
                <a href="/estimate">Use Calculator</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold">
                <a href="tel:+16126854696">
                  <Phone className="w-5 h-5 mr-2" />
                  (612) 685-4696
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Charges */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Additional Charges
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transparent pricing for special items and services
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {additionalCharges.map((charge, index) => (
              <motion.div
                key={charge.item}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 hover:border-yellow-400 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{charge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-black text-gray-900">{charge.item}</h3>
                      <span className="text-lg font-black text-primary">{charge.price}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{charge.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-black text-blue-900 mb-2">Important Note</h3>
                <p className="text-blue-800 leading-relaxed">
                  Final pricing is determined on-site based on actual volume and items. We'll always provide an estimate before starting work and never charge more than agreed upon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              What's Included
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every job includes these services at no extra charge
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {included.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center hover:border-green-400 transition-colors"
              >
                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <p className="font-bold text-gray-900">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Price Comparison */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Why Choose StoneRiver?
            </h2>
            <p className="text-xl text-gray-600">
              Compare our value to DIY or other services
            </p>
          </div>

          <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary to-orange-600 text-white">
                <tr>
                  <th className="p-4 text-left font-black">Service</th>
                  <th className="p-4 text-center font-black">DIY</th>
                  <th className="p-4 text-center font-black">Competitors</th>
                  <th className="p-4 text-center font-black bg-white/20">StoneRiver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { service: "Labor & Loading", diy: "❌", competitor: "✓", us: "✓" },
                  { service: "Truck & Equipment", diy: "Rental $$$", competitor: "✓", us: "✓" },
                  { service: "Disposal Fees", diy: "Extra $$$", competitor: "✓", us: "✓" },
                  { service: "Recycling", diy: "❌", competitor: "Sometimes", us: "✓" },
                  { service: "Donations", diy: "❌", competitor: "Rarely", us: "✓" },
                  { service: "Same-Day Service", diy: "❌", competitor: "Extra Fee", us: "✓" },
                  { service: "Cleanup", diy: "❌", competitor: "❌", us: "✓" },
                  { service: "No Hidden Fees", diy: "N/A", competitor: "❌", us: "✓" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{row.service}</td>
                    <td className="p-4 text-center text-gray-600">{row.diy}</td>
                    <td className="p-4 text-center text-gray-600">{row.competitor}</td>
                    <td className="p-4 text-center font-bold text-primary bg-primary/5">{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get an instant estimate or book your pickup today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/estimate"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-gray-100 font-black text-lg px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase"
            >
              <Calculator className="w-5 h-5" />
              Get Estimate
            </a>
            <a
              href="/booking"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10 font-black text-lg px-10 py-5 rounded-2xl transition-all uppercase"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
