import { motion } from "framer-motion";
import { CheckCircle, Users, Leaf, Award, Heart, Truck } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6 uppercase">
              ABOUT{" "}
              <span className="text-primary">STONERIVER</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
              Your trusted partner for professional junk removal in Central Minnesota.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 uppercase">Our Mission</h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Work hard, remove junk the right way, and help people. We create jobs, donate usable items to nonprofits, 
              and reduce waste. Real impact, one job at a time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Community First",
                description: "We believe in giving back. Usable items are donated to local nonprofits and charities."
              },
              {
                icon: Leaf,
                title: "Eco-Friendly",
                description: "We recycle and dispose responsibly, keeping waste out of landfills whenever possible."
              },
              {
                icon: Users,
                title: "Local Team",
                description: "We're your neighbors. A local, family-owned business serving Central Minnesota."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6 bg-gray-50 rounded-2xl"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-12 text-center uppercase">
            Why Choose StoneRiver?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Licensed & Insured for your protection",
              "Same-Day Service Available",
              "Upfront, Transparent Pricing",
              "Professional, Courteous Team",
              "Eco-Friendly Disposal Practices",
              "Donate Usable Items to Charity",
              "No Hidden Fees",
              "Serving Central Minnesota"
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-colors"
              >
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="font-semibold text-gray-900">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { number: "1,659+", label: "Happy Customers" },
              { number: "50+", label: "Tons Recycled" },
              { number: "5.0", label: "Star Rating" },
              { number: "24hr", label: "Response Time" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-gradient-to-br from-primary/10 to-blue-50 rounded-2xl"
              >
                <div className="text-4xl font-black text-primary mb-2">{stat.number}</div>
                <div className="text-gray-700 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-12 text-center uppercase">
            How We Work
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Contact Us",
                description: "Call or fill out our online form. We'll provide a free quote based on your needs.",
                icon: "📞"
              },
              {
                step: "2",
                title: "We Come To You",
                description: "Our professional team arrives on time. We handle all the heavy lifting and loading.",
                icon: "🚛"
              },
              {
                step: "3",
                title: "Done!",
                description: "We haul everything away, clean up, and dispose responsibly. You relax!",
                icon: "✓"
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
                <div className="text-6xl mb-4">{step.icon}</div>
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Contact us today for a free quote. Same-day service available!
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

export default About;
