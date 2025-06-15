
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-white" />
          <span className="text-2xl font-bold text-white">TrustLayer</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to Transform Your
          <span className="block">Project Collaboration?</span>
        </h2>
        
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join thousands of contractors and clients who trust TrustLayer to deliver 
          exceptional results. Start your free trial today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full text-lg font-semibold">
            Schedule a Demo
          </Button>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-blue-100">
          <span>✓ 14-day free trial</span>
          <div className="hidden sm:block w-1 h-1 bg-blue-300 rounded-full"></div>
          <span>✓ No credit card required</span>
          <div className="hidden sm:block w-1 h-1 bg-blue-300 rounded-full"></div>
          <span>✓ Setup in minutes</span>
        </div>
      </div>
    </section>
  );
};

export default CTA;
