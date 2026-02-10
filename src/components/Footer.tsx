import { motion } from "framer-motion";
import { Mountain, Phone, Mail, MapPin, Facebook, Instagram, Twitter, ArrowRight, Leaf, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer id="contact" className="relative pt-24 pb-8 bg-background border-t border-border/50">
      {/* Final CTA Section */}
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden mb-20"
        >
          {/* CTA Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-blue-50" />

          <div className="relative z-10 p-12 sm:p-16 text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6 uppercase">
              GET YOUR FREE QUOTE!
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
              If you are outside of our service area, call us to ask if we can still make it happen anyway! We might be in the area already.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 font-bold text-lg px-10 py-7 rounded-xl shadow-xl uppercase"
              >
                REQUEST A QUOTE
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <div className="flex flex-col items-center gap-2">
                <a href="tel:+16126854696" className="text-2xl font-bold text-gray-900 hover:text-primary transition-colors">
                  📞 (612) 685-4696
                </a>
                <a href="mailto:info@stoneriverjunk.com" className="text-base text-gray-600 hover:text-primary transition-colors">
                  info@stoneriverjunk.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground leading-none">
                  StoneRiver
                </span>
                <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase mt-0.5">
                  Property Services
                </span>
              </div>
              <Mountain className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mt-4">
              Professional junk removal and property services for residential and commercial clients. Licensed, insured, and committed to eco-friendly practices.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li><a href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">About Us</a></li>
              <li><a href="/#services" className="text-muted-foreground hover:text-primary transition-colors text-sm">Our Services</a></li>
              <li><a href="/quote" className="text-muted-foreground hover:text-primary transition-colors text-sm">Get a Quote</a></li>
              <li><a href="/estimate" className="text-muted-foreground hover:text-primary transition-colors text-sm">Estimate Calculator</a></li>
              <li><a href="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQ</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              <li><a href="/residential" className="text-muted-foreground hover:text-primary transition-colors text-sm">Residential Junk Removal</a></li>
              <li><a href="/commercial" className="text-muted-foreground hover:text-primary transition-colors text-sm">Commercial Services</a></li>
              <li><a href="/demolition" className="text-muted-foreground hover:text-primary transition-colors text-sm">Demolition</a></li>
              <li><a href="/#services" className="text-muted-foreground hover:text-primary transition-colors text-sm">Estate Cleanouts</a></li>
              <li><a href="/#services" className="text-muted-foreground hover:text-primary transition-colors text-sm">E-Waste Recycling</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+16126854696" className="hover:text-primary transition-colors">(612) 685-4696</a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:info@stoneriverjunk.com" className="hover:text-primary transition-colors">info@stoneriverjunk.com</a>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Central Minnesota</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Impact Statement */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12 border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center uppercase">
            Every Pick Up Creates Opportunities
          </h3>
          <p className="text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
            We create jobs, donate usable items to nonprofits, and reduce waste. 
            Real impact, one job at a time. Turning junk into impact & empowering the community.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-600 pt-8 border-t border-gray-200">
          <p className="font-medium">© 2024 StoneRiver Junk Removal. All rights reserved. | Licensed & Insured</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
