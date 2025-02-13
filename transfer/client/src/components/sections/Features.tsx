import React from "react";
import { Card } from "../ui/card";
import { Palette, Cube, Users } from "lucide-react";

const features = [
  {
    icon: <Palette className="h-8 w-8" />,
    title: "Customizable Designs",
    description: "Choose from a wide range of colors, materials, and layouts to create your perfect space."
  },
  {
    icon: <Cube className="h-8 w-8" />,
    title: "3D Visualization",
    description: "See your design come to life with our real-time 3D rendering technology."
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Collaborative Tools",
    description: "Work together with our design experts to refine and perfect your vision."
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose CubbyLuxe</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
