import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Phone, Mail, MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Quote = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    service_type: "residential",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_forms')
        .insert([{
          ...formData,
          status: 'pending'
        }]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Quote Request Submitted!",
        description: "We'll contact you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        service_type: "residential",
        description: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6 uppercase">
              GET YOUR FREE{" "}
              <span className="text-primary">QUOTE!</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
              Fill out the form below and we'll get back to you within 24 hours with a free, no-obligation quote!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase">Contact Us</h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Prefer to call? We're here to help! Reach out directly or fill out the form and we'll contact you.
              </p>

              <div className="space-y-6">
                <a href="tel:+16126854696" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors group">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-600 uppercase">Call Us</div>
                    <div className="text-xl font-black text-gray-900">(612) 685-4696</div>
                  </div>
                </a>

                <a href="mailto:info@stoneriverjunk.com" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-primary/5 transition-colors group">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-600 uppercase">Email Us</div>
                    <div className="text-lg font-bold text-gray-900">info@stoneriverjunk.com</div>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-600 uppercase">Service Area</div>
                    <div className="text-lg font-bold text-gray-900">Central Minnesota</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <h3 className="font-black text-gray-900 mb-3 uppercase">Why Choose Us?</h3>
                <ul className="space-y-2">
                  {[
                    "Same-Day Service Available",
                    "Licensed & Insured",
                    "Eco-Friendly Disposal",
                    "Upfront Pricing",
                    "Professional Team"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Quote Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {submitted ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Quote Request Received!</h3>
                  <p className="text-gray-700 mb-6">
                    Thank you for contacting StoneRiver! We'll review your request and get back to you within 24 hours with a free quote.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="bg-primary text-white hover:bg-primary/90 font-bold"
                  >
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase">Request a Quote</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(612) 685-4696"
                        required
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Service Address *
                      </label>
                      <Input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Main St, Minneapolis, MN"
                        required
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Service Type *
                      </label>
                      <select
                        name="service_type"
                        value={formData.service_type}
                        onChange={handleChange}
                        required
                        className="w-full h-12 px-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:border-primary"
                      >
                        <option value="residential">Residential Junk Removal</option>
                        <option value="commercial">Commercial Junk Removal</option>
                        <option value="demolition">Demolition</option>
                        <option value="estate">Estate Cleanout</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                        Description of Items/Job *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Please describe what you need removed (e.g., old furniture, appliances, yard waste, etc.)"
                        required
                        rows={4}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-medium text-gray-700 focus:outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-primary text-white hover:bg-primary/90 font-black text-lg uppercase shadow-xl hover:shadow-2xl transition-all"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          GET FREE QUOTE
                          <ArrowRight className="w-6 h-6" />
                        </div>
                      )}
                    </Button>

                    <p className="text-xs text-gray-600 text-center">
                      By submitting this form, you agree to be contacted by StoneRiver Property Services.
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Quote;
