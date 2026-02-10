import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Users, DollarSign, Share2, Copy, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Referral = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [referralCode] = useState("STONE" + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareText = `Check out StoneRiver Junk Removal! Use my code ${referralCode} for $25 off your first service. https://stoneriverjunk.com`;
    if (navigator.share) {
      navigator.share({
        title: 'StoneRiver Junk Removal',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "$25 for You",
      description: "Get $25 off your next service for every successful referral"
    },
    {
      icon: Gift,
      title: "$25 for Them",
      description: "Your friend gets $25 off their first junk removal service"
    },
    {
      icon: Users,
      title: "Unlimited Referrals",
      description: "No limit! Refer as many friends and family as you want"
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Share Your Code",
      description: "Send your unique referral code to friends and family",
      icon: "📤"
    },
    {
      step: "2",
      title: "They Book Service",
      description: "Your friend uses your code when booking their first service",
      icon: "📅"
    },
    {
      step: "3",
      title: "You Both Save",
      description: "After their service is complete, you both get $25 credit",
      icon: "💰"
    },
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
              <Gift className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary text-sm uppercase tracking-wide">Referral Program</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6">
              Give $25, Get{" "}
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">$25</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              Share the love! Refer friends and family to StoneRiver and you both save.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Referral Code */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary via-orange-600 to-red-600 rounded-3xl p-12 text-center text-white shadow-2xl"
          >
            <h2 className="text-3xl font-black mb-4">Your Referral Code</h2>
            <p className="text-white/90 mb-8">Share this code with friends and family</p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6">
              <div className="text-6xl font-black tracking-wider mb-4">{referralCode}</div>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleCopyCode}
                  className="bg-white text-primary hover:bg-gray-100 font-bold"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleShare}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="font-bold mb-4">Send via Email</h3>
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-gray-900 flex-1"
                />
                <Button className="bg-white text-primary hover:bg-gray-100 font-bold">
                  <Mail className="w-5 h-5 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to start earning rewards
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center relative"
              >
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-1 bg-gradient-to-r from-primary to-orange-600" />
                )}
                <div className="text-6xl mb-4">{step.icon}</div>
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4 relative z-10">
                  {step.step}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Stats */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border-2 border-gray-200 p-12"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">Your Referral Dashboard</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl">
                <div className="text-4xl font-black text-primary mb-2">0</div>
                <div className="text-gray-600 font-semibold">Referrals Sent</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                <div className="text-4xl font-black text-green-600 mb-2">0</div>
                <div className="text-gray-600 font-semibold">Successful Referrals</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl">
                <div className="text-4xl font-black text-orange-600 mb-2">$0</div>
                <div className="text-gray-600 font-semibold">Total Earned</div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
              <p className="text-blue-900 font-semibold">
                💡 <strong>Pro Tip:</strong> Share your code on social media, in community groups, or with neighbors to maximize your rewards!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Program Terms</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Referral credit is applied after the referred customer's first completed service</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>$25 credit can be used toward any future StoneRiver service</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Referred customer must be a new customer (first-time service)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Credits do not expire and can be combined with other offers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Minimum service charge of $100 required to use referral credit</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>StoneRiver reserves the right to modify or terminate the program at any time</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Start Referring Today!
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Share your code and start earning rewards with every referral.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleCopyCode}
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-black text-lg px-10 py-6"
            >
              <Copy className="w-5 h-5 mr-2" />
              Copy My Code
            </Button>
            <a
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10 font-black text-lg px-10 py-6 rounded-xl transition-all"
            >
              Book a Service
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Referral;
