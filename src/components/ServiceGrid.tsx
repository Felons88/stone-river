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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  items: string[];
  delay: number;
  link: string;
}

const ServiceCard = ({ icon: Icon, title, description, items, delay, link }: ServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-3xl p-10 border-2 border-gray-200 hover:border-primary hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-10 h-10 text-primary" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight group-hover:text-primary transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed font-medium">
        {description}
      </p>

      {/* Items List */}
      <ul className="space-y-2.5 mb-8">
        {items.map((item, index) => (
          <li key={index} className="text-gray-700 text-sm flex items-start">
            <span className="text-primary mr-2.5 font-black text-base mt-0.5">✓</span>
            <span className="font-semibold">{item}</span>
          </li>
        ))}
      </ul>

      {/* Learn More Button */}
      <a
        href={link}
        className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all text-sm group-hover:shadow-2xl"
      >
        Learn More
        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
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
      description: "Junk removal, full clean-outs, and so much more!",
      items: [
        "Appliances",
        "Electronics",
        "Mattresses & Box Springs",
        "Furniture (Couches, Armchairs, etc.)",
        "Hot Tubs",
        "Carpets and more!"
      ],
      link: "/residential"
    },
    {
      icon: Building2,
      title: "Commercial Junk Removal",
      description: "Professional removal for businesses of all sizes.",
      items: [
        "Desks",
        "Filing Cabinets",
        "Pallets",
        "Electronics",
        "Cubicles",
        "Chairs and more!"
      ],
      link: "/commercial"
    },
    {
      icon: HardHat,
      title: "Demolition",
      description: "Structure removal and demolition services.",
      items: [
        "Swing-sets",
        "Pools",
        "Concrete, Brick & Rocks",
        "Sheds",
        "Patios",
        "Decks and more!"
      ],
      link: "/demolition"
    },
  ];

  return (
    <section id="services" className="py-32 relative bg-gradient-to-b from-white via-slate-50 to-white" ref={ref}>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/20 rounded-full mb-6">
            <span className="font-bold text-primary text-sm uppercase tracking-wide">Our Services</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 mb-6">
            What We Remove
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Professional junk removal for residential, commercial, and demolition projects. No job too big or small.
          </p>
        </motion.div>

        {/* Service Grid */}
        <div className="grid md:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              {...service}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
