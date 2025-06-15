
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">TrustLayer</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Streamline Your
          <span className="text-blue-600 block">Contractor-Client</span>
          Collaboration
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          The all-in-one platform that brings contractors and clients together. 
          Manage projects, track progress, and communicate seamlessly in one trusted workspace.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="border-blue-200 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50">
            Watch Demo
          </Button>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>1000+ Active Users</span>
          </div>
          <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
          <span>No Setup Fees</span>
          <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
          <span>Cancel Anytime</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
