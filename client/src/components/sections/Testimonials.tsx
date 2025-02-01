import { sections } from "@/config";
import { Card } from "@/components/ui/card";

export function Testimonials() {
  const { title, description, items } = sections.testimonials;

  return (
    <div className="w-full">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            {title}
          </h2>
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {items.map((item, index) => (
            <Card key={index} className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex text-yellow-400 text-2xl">
                    {"★".repeat(5)}
                  </div>
                </div>
                <p className="text-gray-600 italic text-center text-lg">"{item.description}"</p>
                <p className="text-gray-800 font-semibold text-center">{item.title}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}