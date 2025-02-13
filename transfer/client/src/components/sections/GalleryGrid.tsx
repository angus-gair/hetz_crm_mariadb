import React from "react";
import { Card } from "../ui/card";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "Adventure Playground",
    description: "Interactive play area with climbing walls and slides",
    image: "/gallery/playground1.jpg",
    category: "Outdoor"
  },
  {
    id: "2",
    title: "Learning Center",
    description: "Educational space with reading nooks and activity stations",
    image: "/gallery/learning1.jpg",
    category: "Indoor"
  },
  {
    id: "3",
    title: "Creative Corner",
    description: "Art and craft space with storage solutions",
    image: "/gallery/creative1.jpg",
    category: "Indoor"
  }
];

export const GalleryGrid = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Inspiration Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
              </div>
              <div className="p-4">
                <span className="text-sm text-primary font-medium">{item.category}</span>
                <h3 className="text-xl font-semibold mt-2">{item.title}</h3>
                <p className="text-gray-600 mt-2">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
