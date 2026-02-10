import { Leaf, Shield, Star, Clock } from "lucide-react";

const TrustMarquee = () => {
  const trustItems = [
    { icon: Leaf, text: "100% Eco-Friendly Disposal" },
    { icon: Shield, text: "Licensed & Insured" },
    { icon: Star, text: "5-Star Rated Service" },
    { icon: Clock, text: "Same-Day Pickup Available" },
  ];

  // Double the items for seamless loop
  const allItems = [...trustItems, ...trustItems];

  return (
    <section className="py-6 bg-secondary/30 border-y border-border/50 overflow-hidden">
      <div className="relative">
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
          {allItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-6"
            >
              <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-muted-foreground">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustMarquee;
