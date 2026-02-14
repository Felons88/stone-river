import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import TrustMarquee from "@/components/TrustMarquee";
import ServiceGrid from "@/components/ServiceGrid";
import Testimonials from "@/components/Testimonials";
import CustomerMetrics from "@/components/CustomerMetrics";
import StatsSection from "@/components/StatsSection";
import EnvironmentalImpact from "@/components/EnvironmentalImpact";
import LiveChat from "@/components/LiveChat";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <TrustMarquee />
      <ServiceGrid />
      <CustomerMetrics />
      <Testimonials />
      <StatsSection />
      <EnvironmentalImpact />
      <Footer />
      <LiveChat />
    </div>
  );
};

export default Index;
