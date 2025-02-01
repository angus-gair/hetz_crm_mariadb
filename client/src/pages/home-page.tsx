import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { Testimonials } from "@/components/sections/Testimonials";
import { ConsultationScheduler } from "@/components/sections/ConsultationScheduler";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <GalleryGrid />
      <Testimonials />
      <ConsultationScheduler />
    </div>
  );
}
