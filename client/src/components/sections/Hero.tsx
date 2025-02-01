import { siteConfig } from "@/config";
import { Button } from "@/components/ui/button";
import Image from "@/components/ui/image";

export function Hero() {
  const { title, subtitle } = siteConfig.hero;

  return (
    <section id="home" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Lorem Ipsum Dolor
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="outline"
              className="min-w-[150px]"
              asChild
            >
              <a href="#portfolio">View Portfolio</a>
            </Button>
            <Button
              className="min-w-[150px]"
              asChild
            >
              <a href="#consultation">Get a Quote</a>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/placeholder-1.jpg"
              alt="Cubby House Example 1"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <img
              src="/placeholder-2.jpg"
              alt="Cubby House Example 2"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}