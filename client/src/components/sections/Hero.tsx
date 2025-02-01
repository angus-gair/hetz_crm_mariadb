import { siteConfig } from "@/config";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { title, subtitle } = siteConfig.hero;

  return (
    <section id="home" className="w-full py-8 md:py-16 lg:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {subtitle}
          </p>
          <div className="flex flex-col gap-4 min-w-[200px] sm:flex-row sm:gap-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              asChild
            >
              <a href="#portfolio">View Portfolio</a>
            </Button>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              asChild
            >
              <a href="#consultation">Get a Quote</a>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="relative aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Hero Image 1</span>
          </div>
          <div className="relative aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Hero Image 2</span>
          </div>
        </div>
      </div>
    </section>
  );
}