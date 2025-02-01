import React from "react";
import { Button } from "../ui/button";

export const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            Design Your Perfect Play Space
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create, customize, and visualize your dream children's play environment with our advanced 3D design tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8">
              Start Designing
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              View Gallery
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
