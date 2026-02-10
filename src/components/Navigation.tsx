import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/services", label: "Services" },
    { href: "/estimate", label: "Calculator" },
    { href: "/about", label: "About" },
    { href: "/reviews", label: "Reviews" },
    { href: "/booking", label: "Contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-white border-b border-gray-200 shadow-md"
          : "py-5 bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Mountain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-black tracking-tight text-gray-900">
            StoneRiver
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`transition-colors text-base font-semibold ${
                location.pathname === link.href
                  ? "text-primary"
                  : "text-gray-700 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <a href="tel:+16126854696" className="text-lg font-bold text-gray-900 hover:text-primary transition-colors">
            📞 (612) 685-4696
          </a>
          <Button
            asChild
            className="bg-primary text-white hover:bg-primary/90 font-bold px-8 py-6 text-base uppercase shadow-xl"
          >
            <Link to="/quote">GET A QUOTE!</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-b border-gray-200"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-medium py-2 transition-colors ${
                    location.pathname === link.href
                      ? "text-primary font-bold"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-2 border-t border-gray-200">
                <a href="tel:+16126854696" className="text-lg font-bold text-gray-900 hover:text-primary transition-colors text-center">
                  📞 (612) 685-4696
                </a>
                <Button asChild className="bg-primary text-white hover:bg-primary/90 font-bold w-full uppercase">
                  <Link to="/quote" onClick={() => setIsMobileMenuOpen(false)}>GET A QUOTE!</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navigation;
