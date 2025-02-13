import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
};

const galleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "Enchanted Castle",
    description: "A magical castle-themed cubby house with climbing features",
    image: "/images/portfolio/cubby1.jpg",
    category: "Castle"
  },
  {
    id: "2",
    title: "Forest Retreat",
    description: "Natural wood finish with integrated outdoor play area",
    image: "/images/portfolio/cubby2.jpg",
    category: "Modern"
  },
  {
    id: "3",
    title: "Seaside Haven",
    description: "Beach-inspired design with weatherproof features",
    image: "/images/portfolio/cubby3.jpg",
    category: "Cottage"
  },
  {
    id: "4",
    title: "Woodland Lodge",
    description: "Rustic design with natural elements",
    image: "/images/portfolio/cubby4.jpg",
    category: "Modern"
  },
  {
    id: "5",
    title: "Princess Palace",
    description: "Elegant design with royal touches",
    image: "/images/portfolio/cubby5.jpg",
    category: "Castle"
  },
  {
    id: "6",
    title: "Coastal Retreat",
    description: "Beachside inspired playhouse",
    image: "/images/portfolio/cubby6.jpg",
    category: "Cottage"
  }
];

const categories = ["All", "Castle", "Modern", "Cottage"];

export function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <section className="py-20 bg-secondary/10">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Gallery</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Explore our collection of custom-designed cubby houses
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="min-w-[100px]"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}