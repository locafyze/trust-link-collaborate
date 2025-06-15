
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      // Redirect authenticated users to their dashboard
      if (profile.role === 'contractor') {
        navigate('/contractor-dashboard');
      } else {
        navigate('/client-dashboard');
      }
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">TrustLayer</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with top padding for fixed nav */}
      <div className="pt-16">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
