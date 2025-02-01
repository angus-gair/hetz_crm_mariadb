import { siteConfig } from "@/config";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { title, subtitle } = siteConfig.hero;

  return (
    <section id="home" className="relative w-full min-h-[60vh] flex items-center justify-center bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
            {subtitle}
          </p>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="bg-gray-100"
              asChild
            >
              <a href="#portfolio">View Portfolio</a>
            </Button>
            <Button
              asChild
            >
              <a href="#consultation">Get a Quote</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}