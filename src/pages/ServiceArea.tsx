import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, CheckCircle, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ServiceArea = () => {
  const [zipCode, setZipCode] = useState("");
  const [checkResult, setCheckResult] = useState<'pending' | 'yes' | 'no' | 'maybe'>('pending');

  const servicedZipCodes = [
    // St. Cloud area
    "56301", "56303", "56304",
    // Sauk Rapids
    "56379",
    // Sartell
    "56377",
    // Waite Park
    "56387",
    // St. Joseph
    "56374",
    // Cold Spring
    "56320",
    // Richmond
    "56368",
    // Avon
    "56310",
    // Albany
    "56307",
    // Paynesville
    "56362",
    // Melrose
    "56352",
    // Little Falls
    "56345",
    // Royalton
    "56373",
    // Rice
    "56367",
  ];

  const maybeZipCodes = [
    "56308", "56309", "56311", "56312", "56313", "56314", "56315", "56316",
    "56318", "56319", "56321", "56323", "56324", "56325", "56326", "56327",
  ];

  const handleCheck = () => {
    const cleanZip = zipCode.trim();
    if (servicedZipCodes.includes(cleanZip)) {
      setCheckResult('yes');
    } else if (maybeZipCodes.includes(cleanZip)) {
      setCheckResult('maybe');
    } else if (cleanZip.length === 5) {
      setCheckResult('no');
    }
  };

  const cities = [
    { name: "St. Cloud", zip: "56301" },
    { name: "Sauk Rapids", zip: "56379" },
    { name: "Sartell", zip: "56377" },
    { name: "Waite Park", zip: "56387" },
    { name: "St. Joseph", zip: "56374" },
    { name: "Cold Spring", zip: "56320" },
    { name: "Richmond", zip: "56368" },
    { name: "Avon", zip: "56310" },
    { name: "Albany", zip: "56307" },
    { name: "Paynesville", zip: "56362" },
    { name: "Melrose", zip: "56352" },
    { name: "Little Falls", zip: "56345" },
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
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary text-sm uppercase tracking-wide">Service Coverage</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6">
              Service Area{" "}
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Checker</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              Proudly serving Central Minnesota. Check if we service your area!
            </p>
          </motion.div>
        </div>
      </section>

      {/* ZIP Code Checker */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 md:p-12 border-2 border-gray-200 shadow-xl"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-4 text-center">
              Are We In Your Area?
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Enter your ZIP code to check if we service your location
            </p>

            <div className="flex gap-3 mb-6">
              <Input
                type="text"
                placeholder="Enter ZIP code (e.g., 56301)"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={5}
                className="h-14 text-lg font-semibold"
                onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
              />
              <Button
                onClick={handleCheck}
                className="bg-primary hover:bg-primary/90 h-14 px-8 font-bold"
              >
                <Search className="w-5 h-5 mr-2" />
                Check
              </Button>
            </div>

            {/* Results */}
            {checkResult === 'yes' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 text-center"
              >
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-green-900 mb-2">Great News!</h3>
                <p className="text-green-800 mb-4">We service your area! Same-day service available.</p>
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-bold">
                  <a href="/quote">Get Free Quote</a>
                </Button>
              </motion.div>
            )}

            {checkResult === 'maybe' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-50 border-2 border-yellow-500 rounded-2xl p-6 text-center"
              >
                <MapPin className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-yellow-900 mb-2">Possibly!</h3>
                <p className="text-yellow-800 mb-4">We may service your area. Give us a call to confirm!</p>
                <Button asChild className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold">
                  <a href="tel:+16126854696">Call (612) 685-4696</a>
                </Button>
              </motion.div>
            )}

            {checkResult === 'no' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 text-center"
              >
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-red-900 mb-2">Not Yet</h3>
                <p className="text-red-800 mb-4">We don't currently service this area, but give us a call - we're expanding!</p>
                <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold">
                  <a href="tel:+16126854696">Call (612) 685-4696</a>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Service Area Map */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Cities We Serve
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We proudly serve the following cities and surrounding areas in Central Minnesota
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {cities.map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all"
              >
                <MapPin className="w-6 h-6 text-primary mb-3" />
                <h3 className="text-lg font-black text-gray-900 mb-1">{city.name}</h3>
                <p className="text-sm text-gray-600 font-semibold">{city.zip}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Don't see your city? We're constantly expanding our service area!
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-bold">
              <a href="tel:+16126854696">Call to Check Your Area</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Coverage Details */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-primary/10 to-orange-50 rounded-2xl p-8 border-2 border-primary/20">
              <h3 className="text-2xl font-black text-gray-900 mb-4">Primary Service Area</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We offer same-day service and competitive pricing throughout our primary service area, 
                which includes St. Cloud and surrounding communities within a 20-mile radius.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-semibold">Same-day service available</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-semibold">No travel fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-semibold">Priority scheduling</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 border-2 border-blue-200">
              <h3 className="text-2xl font-black text-gray-900 mb-4">Extended Service Area</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We also service areas beyond our primary zone. Extended areas may have additional 
                travel fees and scheduling considerations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-semibold">Up to 40 miles from St. Cloud</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-semibold">Flexible scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-semibold">Call for availability</span>
                </li>
              </ul>
            </div>
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
            Whether you're in our primary or extended service area, we're here to help!
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

export default ServiceArea;
