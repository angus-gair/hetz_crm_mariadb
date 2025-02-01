import React from "react";
import { CostCalculator } from "@/components/sections/CostCalculator";
import { type FC } from "react";

const Calculator: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Cost Calculator</h1>
          <p className="mt-4 text-xl text-gray-600">
            Get an instant estimate for your custom cubby house
          </p>
        </div>

        <CostCalculator />
      </div>
    </div>
  );
};

export default Calculator;