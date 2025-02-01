import React, { useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

interface CalculatorInputs {
  size: number;
  features: number;
  materials: string;
}

export const CostCalculator = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    size: 100,
    features: 3,
    materials: "standard"
  });

  const calculateCost = () => {
    const baseRate = 100; // Cost per square foot
    const featureCost = 1000; // Cost per feature
    const materialMultiplier = inputs.materials === "premium" ? 1.5 : 1;

    return (inputs.size * baseRate + inputs.features * featureCost) * materialMultiplier;
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Cost Calculator</h2>
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label>Space Size (sq ft)</Label>
                <Slider
                  value={[inputs.size]}
                  onValueChange={(value) => setInputs({ ...inputs, size: value[0] })}
                  min={50}
                  max={500}
                  step={10}
                  className="mt-2"
                />
                <span className="text-sm text-gray-600 mt-1 block">
                  {inputs.size} sq ft
                </span>
              </div>

              <div>
                <Label>Number of Features</Label>
                <Slider
                  value={[inputs.features]}
                  onValueChange={(value) => setInputs({ ...inputs, features: value[0] })}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
                <span className="text-sm text-gray-600 mt-1 block">
                  {inputs.features} features
                </span>
              </div>

              <div>
                <Label>Material Quality</Label>
                <select
                  className="w-full mt-2 p-2 border rounded-md"
                  value={inputs.materials}
                  onChange={(e) => setInputs({ ...inputs, materials: e.target.value })}
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div className="pt-6 border-t">
                <div className="text-2xl font-bold text-center">
                  Estimated Cost: ${calculateCost().toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  *This is an estimate. Final costs may vary based on specific requirements.
                </p>
              </div>

              <Button className="w-full">Request Detailed Quote</Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
