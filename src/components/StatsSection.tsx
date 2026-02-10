import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Home, ThumbsUp, Star } from "lucide-react";

interface StatCardProps {
  icon: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
  delay: number;
}

const useCountUp = (end: number, duration: number = 2000, startCounting: boolean = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, startCounting]);

  return count;
};

const CountUp = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const StatCard = ({ icon, value, suffix, label, description, delay }: StatCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useCountUp(value, 2000, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className="bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
        {/* Icon */}
        <div className="text-5xl mb-4">{icon}</div>

        {/* Value */}
        <div className="text-5xl sm:text-6xl font-black text-gray-900 mb-2 tracking-tight">
          <CountUp end={value} duration={2} />
          <span className="text-primary">{suffix}</span>
        </div>

        {/* Label */}
        <p className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-600 font-medium">{description}</p>
      </div>
    </motion.div>
  );
};

const StatsSection = () => {
  const stats = [
    {
      icon: "😊",
      value: 1659,
      suffix: "+",
      label: "Happy Customers",
      description: "And counting every day",
    },
    {
      icon: "♻️",
      value: 50,
      suffix: "+",
      label: "Tons Recycled",
      description: "Keeping waste out of landfills",
    },
    {
      icon: "⚡",
      value: 24,
      suffix: "hr",
      label: "Response Time",
      description: "Same-day service available",
    },
    {
      icon: "✓",
      value: 100,
      suffix: "%",
      label: "Satisfaction",
      description: "Guaranteed or your money back",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 uppercase drop-shadow-lg">
            REAL RESULTS
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-xl font-semibold">
            Making a difference, one pickup at a time
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              description={stat.description}
              delay={index * 0.15}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-white text-2xl font-bold mb-6 drop-shadow-lg">
            Join thousands of satisfied customers!
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 font-black text-lg px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase"
          >
            Get Started Today →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
