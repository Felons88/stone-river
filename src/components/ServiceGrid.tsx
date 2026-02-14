import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Sofa,
  TreeDeciduous,
  HardHat,
  Home,
  Building2,
  Cpu,
  ArrowRight,
  Truck,
  Wrench,
  Hammer,
  Package,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  items: string[];
  delay: number;
  link: string;
  featured?: boolean;
  popular?: boolean;
}

const ServiceCard = ({ icon: Icon, title, description, items, delay, link, featured = false, popular = false }: ServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={`relative bg-white rounded-3xl p-10 border-2 hover:border-primary hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group ${
        featured ? 'ring-4 ring-primary/20 shadow-xl' : 'border-gray-200'
      }`}
    >
      {/* Popular Badge */}
      {popular && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg z-10">
          MOST POPULAR
        </div>
      )}

      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg z-10">
          FEATURED
        </div>
      )}

      {/* Icon with enhanced animation */}
      <motion.div 
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:scale-110 transition-all duration-300"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className="w-10 h-10 text-primary" />
      </motion.div>

      {/* Title */}
      <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Enhanced Description */}
      <p className="text-gray-600 mb-6 leading-relaxed font-medium">
        {description}
      </p>

      {/* Enhanced Items List with icons */}
      <ul className="space-y-3 mb-8">
        {items.slice(0, 4).map((item, index) => (
          <motion.li 
            key={index} 
            className="text-gray-700 text-sm flex items-start"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay + index * 0.1 }}
          >
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <span className="text-primary font-black text-xs">✓</span>
            </div>
            <span className="font-semibold">{item}</span>
          </motion.li>
        ))}
        {items.length > 4 && (
          <li className="text-primary text-sm font-semibold">
            +{items.length - 4} more items...
          </li>
        )}
      </ul>

      {/* Enhanced Learn More Button */}
      <motion.a
        href={link}
        className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all text-sm group-hover:shadow-2xl relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          Learn More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.a>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};

const ServiceGrid = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    {
      icon: Home,
      title: "Residential Junk Removal",
      description: "Complete home junk removal, clean-outs, and decluttering services.",
      items: [
        "Appliances & Electronics",
        "Mattresses & Furniture",
        "Hot Tubs & Spas",
        "Carpets & Flooring",
        "Garage Cleanouts",
        "Basement Cleanouts"
      ],
      link: "/residential",
      popular: true
    },
    {
      icon: Building2,
      title: "Commercial Junk Removal",
      description: "Professional removal for businesses, offices, and commercial properties.",
      items: [
        "Office Furniture",
        "Electronics & Computers",
        "Warehouse Cleanouts",
        "Retail Store Removal",
        "Construction Debris",
        "Equipment Disposal"
      ],
      link: "/commercial",
      featured: true
    },
    {
      icon: HardHat,
      title: "Demolition Services",
      description: "Complete structure removal and demolition for residential and commercial.",
      items: [
        "Sheds & Outbuildings",
        "Decks & Patios",
        "Concrete Removal",
        "Swing Sets & Playgrounds",
        "Pool Removal",
        "Interior Demolition"
      ],
      link: "/demolition"
    },
  ];

  return (
    <section id="services" className="py-32 relative bg-gradient-to-b from-white via-slate-50 to-white" ref={ref}>
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
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/20 rounded-full mb-6">
            <Truck className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-sm uppercase tracking-wide">Our Services</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6">
            What We Remove
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Professional junk removal for residential, commercial, and demolition projects. No job too big or small.
          </p>
          
          {/* Service Stats */}
          <div className="flex items-center justify-center gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-black text-primary">500+</div>
              <div className="text-sm text-gray-600 font-semibold">Jobs Per Month</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-black text-green-600">24hr</div>
              <div className="text-sm text-gray-600 font-semibold">Response Time</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-black text-orange-600">100%</div>
              <div className="text-sm text-gray-600 font-semibold">Satisfaction</div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Service Grid */}
        <div className="grid md:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              {...service}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl p-8 border-2 border-primary/20">
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              Don't See Your Service Listed?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We handle custom jobs and specialized removal services. Contact us for a free quote on any junk removal project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/quote"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                <Zap className="w-5 h-5" />
                Get Custom Quote
              </a>
              <a
                href="tel:+16126854696"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-xl hover:border-primary hover:shadow-lg transition-all"
              >
                Call (612) 685-4696
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceGrid;
