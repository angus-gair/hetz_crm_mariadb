import React from "react";
import { Card } from "../ui/card";
import { Avatar } from "../ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Parent",
    image: "/avatars/sarah.jpg",
    content: "CubbyLuxe helped us create the perfect playroom for our kids. The 3D visualization made it easy to understand exactly what we were getting."
  },
  {
    name: "Michael Chen",
    role: "Interior Designer",
    image: "/avatars/michael.jpg",
    content: "As a professional designer, I'm impressed by the level of customization and attention to detail that CubbyLuxe offers."
  },
  {
    name: "Emily Williams",
    role: "School Director",
    image: "/avatars/emily.jpg",
    content: "The collaborative tools made it simple to work with our team and create an engaging play space for our students."
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <Avatar.Image src={testimonial.image} alt={testimonial.name} />
                  <Avatar.Fallback>{testimonial.name[0]}</Avatar.Fallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">{testimonial.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
