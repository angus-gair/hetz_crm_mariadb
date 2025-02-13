import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Premium Custom Cubby Houses
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create magical spaces for children to learn, play, and grow with our expertly crafted custom cubby houses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="default" className="px-8">
              <a href="#consultation">Start Your Design</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8">
              <a href="#portfolio">View Gallery</a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
            <img 
              src="https://picsum.photos/800/600?random=7" 
              alt="Premium Cubby House Design"
              className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
            <img 
              src="https://picsum.photos/800/600?random=8" 
              alt="Luxury Play Space"
              className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}