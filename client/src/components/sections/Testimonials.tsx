import { sections } from "@/config";
import { Card } from "@/components/ui/card";

export function Testimonials() {
  const { title, description, items, footer } = sections.testimonials;

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
          <p className="text-lg font-medium mt-8">Here's what our happy families have to say:</p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 mt-8">
          {items.map((item, index) => (
            <Card key={index} className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex text-yellow-400 text-2xl">
                    {"★".repeat(5)}
                  </div>
                </div>
                <p className="text-gray-600 italic text-center">"{item.description}"</p>
                <p className="text-gray-800 font-semibold text-center">{item.title}</p>
              </div>
            </Card>
          ))}
        </div>

        {footer && (
          <div className="mt-12 text-center max-w-[900px] mx-auto">
            <p className="text-gray-600 text-lg">{footer}</p>
          </div>
        )}
      </div>
    </section>
  );
}