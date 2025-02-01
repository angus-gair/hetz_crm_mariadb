import { siteConfig } from "@/config";

export function Hero() {
  const { title, subtitle } = siteConfig.hero;
  
  return (
    <section className="relative w-full min-h-[60vh] flex items-center justify-center bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
            {subtitle}
          </p>
          <div className="space-x-4">
            <a
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              href="#consultation"
            >
              Schedule a Consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
