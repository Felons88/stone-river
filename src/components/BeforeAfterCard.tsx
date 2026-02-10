import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

const BeforeAfterCard = () => {
  const [sliderValue, setSliderValue] = useState([50]);

  // Using placeholder images - in production these would be real before/after photos
  const beforeImage = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop";
  const afterImage = "https://images.unsplash.com/photo-1558618047-f4b511e3e0e4?w=600&h=400&fit=crop";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50 bg-card animate-float"
    >
      {/* Card Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* After Image (Background) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${afterImage})`,
          }}
        />

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${beforeImage})`,
            clipPath: `inset(0 ${100 - sliderValue[0]}% 0 0)`,
          }}
        />

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg shadow-primary/50"
          style={{ left: `${sliderValue[0]}%` }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-primary-foreground rounded-full" />
              <div className="w-0.5 h-4 bg-primary-foreground rounded-full" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-xs font-semibold text-foreground border border-border/50">
          Before
        </div>
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          After
        </div>
      </div>

      {/* Slider Control */}
      <div className="p-4 bg-card border-t border-border/50">
        <Slider
          value={sliderValue}
          onValueChange={setSliderValue}
          max={100}
          step={1}
          className="cursor-pointer"
        />
        <p className="text-center text-sm text-muted-foreground mt-3">
          Drag to compare the transformation
        </p>
      </div>
    </motion.div>
  );
};

export default BeforeAfterCard;
