import React from "react";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { CheckCircle, Circle } from "lucide-react";

interface Step {
  title: string;
  description: string;
  completed: boolean;
}

const steps: Step[] = [
  {
    title: "Design Creation",
    description: "Create your custom play space design",
    completed: true
  },
  {
    title: "Material Selection",
    description: "Choose materials and colors",
    completed: true
  },
  {
    title: "Review & Refine",
    description: "Review and make adjustments",
    completed: false
  },
  {
    title: "Final Approval",
    description: "Approve the final design",
    completed: false
  }
];

export const ProgressTracker = () => {
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Track Your Progress</h2>
        <Card className="max-w-2xl mx-auto p-6">
          <Progress value={progress} className="mb-8" />
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start">
                {step.completed ? (
                  <CheckCircle className="h-6 w-6 text-primary mt-1" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400 mt-1" />
                )}
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};
