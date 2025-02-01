import { Hero } from "@/components/sections/Hero";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { Features } from "@/components/sections/Features";
import { Testimonials } from "@/components/sections/Testimonials";
import { TeamSection } from "@/components/sections/TeamSection";
import { ConsultationScheduler } from "@/components/sections/ConsultationScheduler";
import { ConnectWithUs } from "@/components/sections/ConnectWithUs";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <div className="space-y-20 md:space-y-32">
        <section className="py-16 md:py-24 bg-gray-50">
          <GalleryGrid />
        </section>
        <section className="py-16 md:py-24">
          <Features />
        </section>
        <section className="py-16 md:py-24 bg-gray-50">
          <Testimonials />
        </section>
        <section className="py-16 md:py-24">
          <TeamSection />
        </section>
        <section className="py-16 md:py-24 bg-gray-50">
          <ConnectWithUs />
        </section>
        <section className="py-16 md:py-24">
          <ConsultationScheduler />
        </section>
      </div>
    </div>
  );
}