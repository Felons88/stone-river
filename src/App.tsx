import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Residential from "./pages/Residential";
import Commercial from "./pages/Commercial";
import Demolition from "./pages/Demolition";
import Quote from "./pages/Quote";
import Estimate from "./pages/Estimate";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Gallery from "./pages/Gallery";
import ServiceArea from "./pages/ServiceArea";
import Booking from "./pages/Booking";
import Reviews from "./pages/Reviews";
import Blog from "./pages/Blog";
import Pricing from "./pages/Pricing";
import Referral from "./pages/Referral";
import Notifications from "./pages/Notifications";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPanel from "./pages/AdminPanel";
import InvoicePayment from "./pages/InvoicePayment";
import PortalLogin from "./pages/PortalLogin";
import CustomerPortal from "./pages/CustomerPortalRedesigned";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/residential" element={<Residential />} />
          <Route path="/commercial" element={<Commercial />} />
          <Route path="/demolition" element={<Demolition />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/estimate" element={<Estimate />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/service-area" element={<ServiceArea />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/panel" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/invoice/:paymentLinkId" element={<InvoicePayment />} />
          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal/dashboard" element={<CustomerPortal />} />
          <Route path="/portal" element={<Navigate to="/portal/login" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
