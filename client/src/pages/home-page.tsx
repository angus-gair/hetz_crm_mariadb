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
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-background">
          <Hero />
        </section>

        {/* Gallery section */}
        <section className="py-20 bg-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <GalleryGrid />
          </div>
        </section>

        {/* Features section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Features />
          </div>
        </section>

        {/* Testimonials section */}
        <section className="py-20 bg-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Testimonials />
          </div>
        </section>

        {/* Team section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <TeamSection />
          </div>
        </section>

        {/* Connect section */}
        <section className="py-20 bg-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ConnectWithUs />
          </div>
        </section>

        {/* Consultation section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ConsultationScheduler />
          </div>
        </section>
      </main>
    </div>
  );
}