import { sections } from "@/config";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export function Testimonials() {
  const { title, description, items } = sections.testimonials;
  
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
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {items.map((item, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <img
                    alt={item.title}
                    src={item.image}
                    className="aspect-square h-full w-full"
                  />
                </Avatar>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
              </div>
              <p className="mt-4 text-gray-500">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
