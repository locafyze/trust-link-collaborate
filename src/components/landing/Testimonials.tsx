
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Interior Designer",
    company: "Modern Spaces LLC",
    avatar: "/placeholder.svg",
    rating: 5,
    text: "TrustLayer has transformed how we work with our clients. The project visibility and communication tools have reduced back-and-forth emails by 80%."
  },
  {
    name: "Mike Chen",
    role: "Project Manager",
    company: "BuildRight Construction",
    avatar: "/placeholder.svg",
    rating: 5,
    text: "Our clients love the transparency and real-time updates. We've seen a 40% increase in client satisfaction since switching to TrustLayer."
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director",
    company: "TechFlow Solutions",
    avatar: "/placeholder.svg",
    rating: 5,
    text: "As a client, I finally have clear visibility into project progress. The platform makes collaboration effortless and keeps everyone accountable."
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Contractors and Clients Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how TrustLayer is helping professionals deliver better results and build stronger relationships.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
