import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Phone, Mail } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How much does junk removal cost?",
      answer: "Our pricing is based on the volume of junk and type of items. We charge by truck load (1/4, 1/2, 3/4, or full truck). Prices start at $150 for a 1/4 truck load. Use our Estimate Calculator for an instant quote, or contact us for a free on-site estimate."
    },
    {
      question: "Do you charge extra for tires or hazardous materials?",
      answer: "Yes, tires and hazardous materials require special disposal per Minnesota regulations. Tires are $15 each, and hazardous materials are $50 per item. This covers the additional disposal fees and handling required by law."
    },
    {
      question: "What areas do you serve?",
      answer: "We serve Central Minnesota and surrounding areas. If you're unsure whether we service your location, give us a call - we might be in your area already!"
    },
    {
      question: "Do you offer same-day service?",
      answer: "Yes! Same-day service is available based on our schedule. Call us in the morning and we'll do our best to get to you the same day. We understand that sometimes you need junk removed quickly."
    },
    {
      question: "What items do you NOT take?",
      answer: "We cannot accept: wet paint, asbestos, certain chemicals, biological waste, or radioactive materials. If you're unsure about an item, just ask! We'll let you know if we can take it or recommend proper disposal methods."
    },
    {
      question: "Do you donate or recycle items?",
      answer: "Absolutely! We're committed to eco-friendly practices. Usable items are donated to local charities and nonprofits. We recycle metals, electronics, and other materials whenever possible. Our goal is to keep as much as possible out of landfills."
    },
    {
      question: "Do I need to be present during pickup?",
      answer: "Not necessarily. As long as the items are accessible and we know exactly what to take, you don't need to be there. Many customers leave items in their garage or driveway and we handle the rest. Just make sure we have clear instructions."
    },
    {
      question: "How do I schedule a pickup?",
      answer: "Easy! Call us at (612) 685-4696, fill out our online quote form, or use our estimate calculator. We'll confirm your appointment time and send you a reminder before we arrive."
    },
    {
      question: "Are you licensed and insured?",
      answer: "Yes, we are fully licensed and insured for your protection. We carry liability insurance and workers' compensation insurance. You can have peace of mind knowing you're working with a professional, legitimate company."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, all major credit cards (Visa, MasterCard, American Express, Discover), and checks. Payment is due upon completion of the job."
    },
    {
      question: "Do you handle commercial junk removal?",
      answer: "Yes! We work with businesses of all sizes including offices, retail stores, restaurants, and warehouses. We offer flexible scheduling to minimize disruption to your business operations, including evening and weekend appointments."
    },
    {
      question: "Can you remove items from upstairs or basement?",
      answer: "Absolutely. Our team handles all the heavy lifting, including items from upstairs, basements, or attics. There is a small surcharge of $25 per flight of stairs to cover the additional labor."
    },
    {
      question: "How quickly can you provide a quote?",
      answer: "For an instant estimate, use our online calculator. For a more accurate quote, we can provide one over the phone in minutes by asking a few questions about your items. For large or complex jobs, we offer free on-site estimates."
    },
    {
      question: "What if I'm not sure what size truck I need?",
      answer: "No problem! Describe your items to us and we'll recommend the right truck size. Our team can also assess on-site and adjust if needed. We only charge for the space your items actually take up."
    },
    {
      question: "Do you clean up after removing the junk?",
      answer: "Yes! We sweep up the area where the items were and make sure we leave your space clean. We take pride in leaving your property better than we found it."
    }
  ];

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
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6 uppercase">
              FREQUENTLY ASKED{" "}
              <span className="text-primary">QUESTIONS</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
              Got questions? We've got answers! Find everything you need to know about our junk removal services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-primary flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 bg-gray-50"
                  >
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 uppercase">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-700">
              We're here to help! Contact us and we'll answer any questions you have.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="tel:+16126854696"
              className="flex items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary hover:shadow-lg transition-all group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-600 uppercase mb-1">Call Us</div>
                <div className="text-2xl font-black text-gray-900">(612) 685-4696</div>
                <div className="text-sm text-gray-600">Mon-Sat: 7am - 7pm</div>
              </div>
            </a>

            <a
              href="mailto:info@stoneriverjunk.com"
              className="flex items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary hover:shadow-lg transition-all group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-600 uppercase mb-1">Email Us</div>
                <div className="text-xl font-black text-gray-900">info@stoneriverjunk.com</div>
                <div className="text-sm text-gray-600">We respond within 24 hours</div>
              </div>
            </a>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 font-black text-lg px-10 py-5 rounded-2xl shadow-xl hover:scale-105 transition-all uppercase"
            >
              Get a Free Quote
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
