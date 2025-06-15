
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, MessageCircle, FileText, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Project Management",
    description: "Track milestones, deadlines, and deliverables with ease. Keep everyone aligned on project goals and timelines."
  },
  {
    icon: MessageCircle,
    title: "Real-time Communication",
    description: "Built-in messaging and video calls. Reduce email clutter and keep all project communication in one place."
  },
  {
    icon: FileText,
    title: "Document Sharing",
    description: "Secure file sharing with version control. Ensure everyone has access to the latest project documents."
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Accurate time logging and reporting. Transparent billing and project progress for clients."
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Visual dashboards and reports. Get insights into project performance and team productivity."
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with data encryption. GDPR compliant and SOC 2 certified."
  }
];

const Features = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Successful Collaboration
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            TrustLayer provides contractors and clients with powerful tools to manage projects, 
            communicate effectively, and deliver results on time.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
