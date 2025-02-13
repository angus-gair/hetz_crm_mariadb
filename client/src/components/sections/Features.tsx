import { sections } from "@/config";
import { LucideIcon, Shield, Star, Pencil, Hammer } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Shield: Shield,
  Star: Star,
  Pencil: Pencil,
  Hammer: Hammer,
};

export function Features() {
  const { title, description, items } = sections.features;

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            {title}
          </h2>
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {description}
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mt-12">
          {items.map((item, index) => {
            const Icon = item.icon ? iconMap[item.icon] : Shield;
            return (
              <div key={index} className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-sm text-gray-500 text-center">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}