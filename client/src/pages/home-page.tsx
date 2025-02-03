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
      <main>
        <Hero />
        <section id="portfolio" className="bg-gray-50">
          <GalleryGrid />
        </section>
        <section id="features">
          <Features />
        </section>
        <section id="testimonials" className="bg-gray-50">
          <Testimonials />
        </section>
        <section id="team">
          <TeamSection />
        </section>
        <section id="connect" className="bg-gray-50">
          <ConnectWithUs />
        </section>
        <section id="consultation">
          <ConsultationScheduler />
        </section>
      </main>
    </div>
  );
}