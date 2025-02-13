import React from "react";
import { type FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CollaborativeDesign } from "@/components/sections/CollaborativeDesign";

const Design: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Design Studio</h1>
          <p className="mt-4 text-xl text-gray-600">
            Create your perfect cubby house with our interactive design tools
          </p>
        </div>
        <CollaborativeDesign />
      </div>
    </div>
  );
};

export default Design;