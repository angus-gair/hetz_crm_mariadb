import { type FC, useState } from "react";
import { sections } from "@/config";
import { Card } from "@/components/ui/card";
import Image from "@/components/ui/image";
import { Button } from "@/components/ui/button";

type StyleFilter = "all" | "style1" | "style2" | "style3" | "style4";

export const GalleryGrid: FC = () => {
  const { title, description, items } = sections.gallery;
  const [activeFilter, setActiveFilter] = useState<StyleFilter>("all");

  const filters: { id: StyleFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "style1", label: "Style 1" },
    { id: "style2", label: "Style 2" },
    { id: "style3", label: "Style 3" },
    { id: "style4", label: "Style 4" },
  ];

  const filteredItems = items.filter(item => 
    activeFilter === "all" || item.style === activeFilter
  );

  return (
    <section id="portfolio" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            {title}
          </h2>
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {description}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.id)}
                className="min-w-[100px]"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {filteredItems.map((item, index) => (
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