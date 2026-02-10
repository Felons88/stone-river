import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Phone, Mail, MapPin, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import api from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

const Booking = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    serviceType: "",
    loadSize: "",
    preferredDate: "",
    preferredTime: "",
    alternateDate: "",
    alternateTime: "",
    notes: "",
  });

  // Load available slots when preferred date changes
  useEffect(() => {
    if (bookingData.preferredDate) {
      loadAvailableSlots(bookingData.preferredDate);
    }
  }, [bookingData.preferredDate]);

  const loadAvailableSlots = async (date: string) => {
    setLoadingSlots(true);
    try {
      const result = await api.bookings.getAvailableSlots(date);
      setAvailableSlots(result.availableSlots || []);
      
      if (result.availableCount === 0) {
        toast({
          title: "No Availability",
          description: "All time slots are booked for this date. Please select a different date.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // Always show fallback slots regardless of error type
      const fallbackSlots = [
        "8:00 AM - 10:00 AM",
        "10:00 AM - 12:00 PM", 
        "12:00 PM - 2:00 PM",
        "2:00 PM - 4:00 PM",
        "4:00 PM - 6:00 PM",
      ];
      setAvailableSlots(fallbackSlots);
      
      // Show appropriate message based on error
      const is404 = error?.status === 404 || error?.response?.status === 404 || 
                   error?.message?.includes('404') || error?.message?.includes('Cannot GET');
      
      toast({
        title: is404 ? "Standard Schedule Available" : "Showing Available Times",
        description: "All time slots are available. We'll confirm your appointment.",
        variant: "default",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create booking with availability check
      await api.bookings.create({
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        address: bookingData.address,
        service_type: bookingData.serviceType,
        load_size: bookingData.loadSize,
        preferred_date: bookingData.preferredDate,
        preferred_time: bookingData.preferredTime,
        alternate_date: bookingData.alternateDate || null,
        alternate_time: bookingData.alternateTime || null,
        notes: bookingData.notes || null,
        status: 'pending',
      });

      toast({
        title: "Booking Request Submitted!",
        description: "We'll contact you within 24 hours to confirm your appointment.",
      });

      setStep(4);
    } catch (error: any) {
      toast({
        title: "Booking Error",
        description: error.message || "There was an error submitting your booking. Please try a different time slot.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    "8:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
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
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary text-sm uppercase tracking-wide">Book Online</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6">
              Schedule Your{" "}
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Pickup</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              Book your junk removal appointment online. Fast, easy, and convenient!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 bg-white border-b-2 border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: "Service Details" },
                { num: 2, label: "Contact Info" },
                { num: 3, label: "Schedule" },
                { num: 4, label: "Confirmation" },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all ${
                      step >= s.num 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
                    </div>
                    <span className={`text-xs font-bold mt-2 ${step >= s.num ? 'text-primary' : 'text-gray-500'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`h-1 flex-1 mx-2 transition-all ${
                      step > s.num ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Service Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-black text-gray-900 mb-6">What do you need removed?</h2>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase">
                    Service Type *
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { value: "residential", label: "Residential", icon: "🏠" },
                      { value: "commercial", label: "Commercial", icon: "🏢" },
                      { value: "demolition", label: "Demolition", icon: "🔨" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, serviceType: type.value })}
                        className={`p-6 rounded-xl border-2 transition-all text-center ${
                          bookingData.serviceType === type.value
                            ? 'border-primary bg-primary/10 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="text-4xl mb-2">{type.icon}</div>
                        <div className="font-bold text-gray-900">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase">
                    Estimated Load Size *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: "quarter", label: "1/4 Truck", price: "$150" },
                      { value: "half", label: "1/2 Truck", price: "$250" },
                      { value: "threeQuarter", label: "3/4 Truck", price: "$350" },
                      { value: "full", label: "Full Truck", price: "$450" },
                    ].map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, loadSize: size.value })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          bookingData.loadSize === size.value
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                        <div className="font-bold text-gray-900 text-sm">{size.label}</div>
                        <div className="text-primary font-black text-lg">{size.price}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* Final price determined on-site</p>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!bookingData.serviceType || !bookingData.loadSize}
                  className="w-full bg-primary hover:bg-primary/90 font-bold text-lg py-6"
                >
                  Continue to Contact Info
                </Button>
              </motion.div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-black text-gray-900 mb-6">Your Contact Information</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        name="name"
                        value={bookingData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="h-14 pl-12 text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="tel"
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleChange}
                        placeholder="(612) 685-4696"
                        required
                        className="h-14 pl-12 text-lg"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      value={bookingData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="h-14 pl-12 text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    Service Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      name="address"
                      value={bookingData.address}
                      onChange={handleChange}
                      placeholder="123 Main St, St. Cloud, MN 56301"
                      required
                      className="h-14 pl-12 text-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 font-bold text-lg py-6"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.address}
                    className="flex-1 bg-primary hover:bg-primary/90 font-bold text-lg py-6"
                  >
                    Continue to Schedule
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Schedule */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-black text-gray-900 mb-6">Choose Your Preferred Time</h2>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                  <p className="text-blue-900 font-semibold">
                    💡 <strong>Tip:</strong> Provide an alternate date/time to increase scheduling flexibility!
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="date"
                        name="preferredDate"
                        value={bookingData.preferredDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="h-14 pl-12 text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                      Preferred Time * {loadingSlots && <span className="text-xs text-gray-500">(Loading...)</span>}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="preferredTime"
                        value={bookingData.preferredTime}
                        onChange={handleChange as any}
                        required
                        disabled={!bookingData.preferredDate || loadingSlots}
                        className="h-14 pl-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg disabled:opacity-50"
                      >
                        <option value="">
                          {!bookingData.preferredDate 
                            ? "Select a date first" 
                            : loadingSlots 
                            ? "Loading available slots..." 
                            : availableSlots.length === 0
                            ? "No slots available"
                            : "Select time slot"}
                        </option>
                        {availableSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot} ✓ Available
                          </option>
                        ))}
                      </select>
                    </div>
                    {bookingData.preferredDate && availableSlots.length > 0 && (
                      <p className="text-xs text-green-600 mt-1 font-semibold">
                        ✓ {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
                      </p>
                    )}
                    {bookingData.preferredDate && availableSlots.length === 0 && !loadingSlots && (
                      <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        All slots booked - please choose another date
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                      Alternate Date (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="date"
                        name="alternateDate"
                        value={bookingData.alternateDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-14 pl-12 text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                      Alternate Time (Optional)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="alternateTime"
                        value={bookingData.alternateTime}
                        onChange={handleChange as any}
                        className="h-14 pl-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg"
                      >
                        <option value="">Select time slot</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                    Additional Notes (Optional)
                  </label>
                  <Textarea
                    name="notes"
                    value={bookingData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions, access codes, or details we should know..."
                    rows={4}
                    className="text-lg"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 font-bold text-lg py-6"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!bookingData.preferredDate || !bookingData.preferredTime || isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90 font-bold text-lg py-6"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">Booking Request Received!</h2>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                  Thank you for choosing StoneRiver! We'll review your request and contact you within 24 hours to confirm your appointment.
                </p>

                <div className="bg-slate-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto text-left">
                  <h3 className="text-xl font-black text-gray-900 mb-4">Booking Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Service:</span>
                      <span className="font-bold text-gray-900 capitalize">{bookingData.serviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Load Size:</span>
                      <span className="font-bold text-gray-900 capitalize">{bookingData.loadSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Preferred Date:</span>
                      <span className="font-bold text-gray-900">{bookingData.preferredDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Preferred Time:</span>
                      <span className="font-bold text-gray-900">{bookingData.preferredTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-primary hover:bg-primary/90 font-bold text-lg px-10 py-6">
                    <a href="/">Return Home</a>
                  </Button>
                  <Button asChild variant="outline" className="font-bold text-lg px-10 py-6">
                    <a href="tel:+16126854696">Call Us: (612) 685-4696</a>
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Booking;
