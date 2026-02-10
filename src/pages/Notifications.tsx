import { motion } from "framer-motion";
import { MessageSquare, Bell, CheckCircle, Clock, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    toast({
      title: "SMS Notifications Enabled!",
      description: "You'll receive updates about your service appointments.",
    });
  };

  const notificationTypes = [
    {
      icon: CheckCircle,
      title: "Booking Confirmation",
      description: "Instant confirmation when you book a service",
      example: "Your junk removal is scheduled for Jan 15 at 10:00 AM. Reply CONFIRM to verify.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Clock,
      title: "Appointment Reminder",
      description: "24-hour reminder before your scheduled pickup",
      example: "Reminder: Your pickup is tomorrow at 10:00 AM. We'll text when we're 30 mins away!",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: MapPin,
      title: "On The Way Alert",
      description: "Real-time notification when our team is en route",
      example: "We're on our way! Our team will arrive at 123 Main St in approximately 30 minutes.",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Star,
      title: "Service Complete",
      description: "Confirmation when your service is finished",
      example: "Service complete! Thank you for choosing StoneRiver. Rate your experience: [link]",
      color: "from-purple-500 to-pink-600"
    },
  ];

  const benefits = [
    "Never miss an appointment",
    "Know exactly when we'll arrive",
    "Get instant booking confirmations",
    "Receive special offers and promotions",
    "Easy two-way communication",
    "Opt-out anytime with a simple text"
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
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary text-sm uppercase tracking-wide">SMS Notifications</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6">
              Stay{" "}
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Connected</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              Get real-time updates about your junk removal service via text message.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Notification Types */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              What You'll Receive
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay informed every step of the way
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {notificationTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <type.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{type.title}</h3>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-xs font-bold text-gray-500 uppercase">Example Message</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{type.example}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe Form */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          {!isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary via-orange-600 to-red-600 rounded-3xl p-12 text-center text-white shadow-2xl"
            >
              <Bell className="w-20 h-20 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Enable SMS Notifications
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Get instant updates about your service appointments
              </p>

              <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                <div className="flex gap-3 mb-6">
                  <Input
                    type="tel"
                    placeholder="(612) 685-4696"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-14 bg-white text-gray-900 text-lg flex-1"
                  />
                  <Button
                    type="submit"
                    className="bg-white text-primary hover:bg-gray-100 font-black h-14 px-8"
                  >
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-white/70">
                  By subscribing, you agree to receive SMS notifications. Standard message rates may apply. Reply STOP to opt-out anytime.
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border-2 border-green-500 rounded-3xl p-12 text-center"
            >
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-green-900 mb-4">
                You're All Set!
              </h2>
              <p className="text-xl text-green-800 mb-6">
                SMS notifications have been enabled for {phone}
              </p>
              <p className="text-green-700">
                You'll receive updates about your appointments and service status.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Why Enable Notifications?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border-2 border-blue-200"
              >
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="font-bold text-gray-900">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Common Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "How do I opt-out of SMS notifications?",
                a: "Simply reply STOP to any message and you'll be immediately unsubscribed. You can re-subscribe anytime."
              },
              {
                q: "Will I be charged for these messages?",
                a: "StoneRiver doesn't charge for SMS notifications, but standard message and data rates from your carrier may apply."
              },
              {
                q: "How often will I receive messages?",
                a: "You'll only receive messages related to your active service appointments - typically 3-4 messages per booking."
              },
              {
                q: "Can I reply to the messages?",
                a: "Yes! Our SMS system supports two-way communication. Feel free to reply with questions or updates."
              },
              {
                q: "Is my phone number secure?",
                a: "Absolutely. We never share your phone number with third parties and only use it for service-related communications."
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border-2 border-gray-200"
              >
                <h3 className="text-lg font-black text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Ready to Stay Connected?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Enable SMS notifications and never miss an update about your service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/booking"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-gray-100 font-black text-lg px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase"
            >
              Book a Service
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

export default Notifications;
