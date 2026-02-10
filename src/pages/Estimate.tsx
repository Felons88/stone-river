import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Plus, Minus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Minnesota market average pricing
const PRICING = {
  // Base load pricing (per truck load)
  truckLoad: {
    quarter: 150,
    half: 250,
    threeQuarter: 350,
    full: 450,
  },
  // Item-based pricing
  items: {
    furniture_small: 35,      // Chair, small table
    furniture_large: 75,      // Sofa, mattress, large desk
    appliance_small: 50,      // Microwave, small AC
    appliance_large: 100,     // Refrigerator, washer, dryer
    electronics: 25,          // TV, computer
    mattress: 60,
    tire: 15,                 // EXTRA CHARGE per tire
    hazardous: 50,            // EXTRA CHARGE per hazmat item
    yard_waste: 40,           // Per cubic yard
    construction: 60,         // Per cubic yard
  },
  // Labor surcharges
  labor: {
    stairs_per_flight: 25,
    heavy_item: 35,
    disassembly: 40,
  }
};

const Estimate = () => {
  const [loadSize, setLoadSize] = useState<keyof typeof PRICING.truckLoad>('quarter');
  const [items, setItems] = useState({
    furniture_small: 0,
    furniture_large: 0,
    appliance_small: 0,
    appliance_large: 0,
    electronics: 0,
    mattress: 0,
    tire: 0,
    hazardous: 0,
    yard_waste: 0,
    construction: 0,
  });
  const [labor, setLabor] = useState({
    stairs_per_flight: 0,
    heavy_item: 0,
    disassembly: 0,
  });

  const calculateTotal = () => {
    let total = PRICING.truckLoad[loadSize];
    
    // Add item costs
    Object.entries(items).forEach(([key, quantity]) => {
      total += PRICING.items[key as keyof typeof PRICING.items] * quantity;
    });
    
    // Add labor costs
    Object.entries(labor).forEach(([key, quantity]) => {
      total += PRICING.labor[key as keyof typeof PRICING.labor] * quantity;
    });
    
    return total;
  };

  const updateItem = (key: keyof typeof items, delta: number) => {
    setItems(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const updateLabor = (key: keyof typeof labor, delta: number) => {
    setLabor(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const total = calculateTotal();

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
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border-2 border-primary/20 rounded-full mb-6">
              <Calculator className="w-6 h-6 text-primary" />
              <span className="font-bold text-gray-900">Instant Estimate</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6 uppercase">
              ESTIMATE{" "}
              <span className="text-primary">CALCULATOR</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-700 mb-4 leading-relaxed font-medium">
              Get an instant estimate for your junk removal project!
            </p>
            <p className="text-base text-gray-600">
              Based on Minnesota market averages. Final pricing may vary based on actual job conditions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calculator Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Load Size */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4 uppercase">1. Select Load Size</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { key: 'quarter', label: '1/4 Truck', price: PRICING.truckLoad.quarter },
                    { key: 'half', label: '1/2 Truck', price: PRICING.truckLoad.half },
                    { key: 'threeQuarter', label: '3/4 Truck', price: PRICING.truckLoad.threeQuarter },
                    { key: 'full', label: 'Full Truck', price: PRICING.truckLoad.full },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setLoadSize(option.key as keyof typeof PRICING.truckLoad)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        loadSize === option.key
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="font-bold text-gray-900 text-sm">{option.label}</div>
                      <div className="text-primary font-black text-lg">${option.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4 uppercase">2. Add Items</h3>
                <div className="space-y-3">
                  {[
                    { key: 'furniture_small', label: 'Small Furniture (Chair, Small Table)', price: PRICING.items.furniture_small },
                    { key: 'furniture_large', label: 'Large Furniture (Sofa, Mattress, Desk)', price: PRICING.items.furniture_large },
                    { key: 'appliance_small', label: 'Small Appliance (Microwave, AC)', price: PRICING.items.appliance_small },
                    { key: 'appliance_large', label: 'Large Appliance (Fridge, Washer)', price: PRICING.items.appliance_large },
                    { key: 'electronics', label: 'Electronics (TV, Computer)', price: PRICING.items.electronics },
                    { key: 'mattress', label: 'Mattress/Box Spring', price: PRICING.items.mattress },
                    { key: 'yard_waste', label: 'Yard Waste (per cubic yard)', price: PRICING.items.yard_waste },
                    { key: 'construction', label: 'Construction Debris (per cubic yard)', price: PRICING.items.construction },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                        <div className="text-primary font-bold text-sm">${item.price} each</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateItem(item.key as keyof typeof items, -1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900">
                          {items[item.key as keyof typeof items]}
                        </span>
                        <button
                          onClick={() => updateItem(item.key as keyof typeof items, 1)}
                          className="w-8 h-8 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Charges */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-xl font-black text-gray-900 uppercase">Extra Charges</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'tire', label: 'Tires (EXTRA CHARGE)', price: PRICING.items.tire },
                    { key: 'hazardous', label: 'Hazardous Materials (EXTRA CHARGE)', price: PRICING.items.hazardous },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-yellow-200">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">{item.label}</div>
                        <div className="text-primary font-black text-sm">${item.price} each</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateItem(item.key as keyof typeof items, -1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900">
                          {items[item.key as keyof typeof items]}
                        </span>
                        <button
                          onClick={() => updateItem(item.key as keyof typeof items, 1)}
                          className="w-8 h-8 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Labor Surcharges */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4 uppercase">3. Labor Surcharges</h3>
                <div className="space-y-3">
                  {[
                    { key: 'stairs_per_flight', label: 'Stairs (per flight)', price: PRICING.labor.stairs_per_flight },
                    { key: 'heavy_item', label: 'Extra Heavy Items', price: PRICING.labor.heavy_item },
                    { key: 'disassembly', label: 'Disassembly Required', price: PRICING.labor.disassembly },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                        <div className="text-primary font-bold text-sm">+${item.price}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateLabor(item.key as keyof typeof labor, -1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900">
                          {labor[item.key as keyof typeof labor]}
                        </span>
                        <button
                          onClick={() => updateLabor(item.key as keyof typeof labor, 1)}
                          className="w-8 h-8 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Estimate Summary - Sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-gradient-to-br from-primary via-orange-600 to-red-600 rounded-2xl p-8 text-white shadow-2xl">
                  <h3 className="text-2xl font-black mb-6 uppercase">Your Estimate</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between pb-3 border-b border-white/20">
                      <span className="font-semibold">Base Load</span>
                      <span className="font-bold">${PRICING.truckLoad[loadSize]}</span>
                    </div>
                    
                    {Object.entries(items).filter(([_, qty]) => qty > 0).map(([key, qty]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span>{key.replace(/_/g, ' ')} ({qty}x)</span>
                        <span className="font-bold">${PRICING.items[key as keyof typeof PRICING.items] * qty}</span>
                      </div>
                    ))}
                    
                    {Object.entries(labor).filter(([_, qty]) => qty > 0).map(([key, qty]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span>{key.replace(/_/g, ' ')} ({qty}x)</span>
                        <span className="font-bold">${PRICING.labor[key as keyof typeof PRICING.labor] * qty}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t-2 border-white/30">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xl font-bold uppercase">Total Estimate</span>
                      <span className="text-4xl font-black">${total}</span>
                    </div>
                    
                    <Button
                      asChild
                      className="w-full bg-white text-primary hover:bg-gray-100 font-black text-lg py-6 rounded-xl uppercase"
                    >
                      <a href="/quote">Get Official Quote</a>
                    </Button>
                  </div>
                  
                  <p className="text-xs text-white/80 mt-4 text-center">
                    * This is an estimate. Final pricing determined on-site.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <p className="text-sm text-gray-700 font-medium">
                    <strong>Note:</strong> Tires and hazardous materials incur additional charges per Minnesota disposal regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Estimate;
