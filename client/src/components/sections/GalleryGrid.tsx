import { sections } from "@/config";
import { Card } from "@/components/ui/card";
import Image from "@/components/ui/image";

export function GalleryGrid() {
  const { title, description, items } = sections.gallery;
  
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
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
            <Card key={index} className="overflow-hidden">
              {item.image && (
                <div className="aspect-video w-full">
                  <Image
                    src={item.image}
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
