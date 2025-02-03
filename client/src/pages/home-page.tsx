import { Hero } from "@/components/sections/Hero";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { Features } from "@/components/sections/Features";
import { Testimonials } from "@/components/sections/Testimonials";
import { TeamSection } from "@/components/sections/TeamSection";
import { ConsultationScheduler } from "@/components/sections/ConsultationScheduler";
import { ConnectWithUs } from "@/components/sections/ConnectWithUs";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        {/* Hero section - White background */}
        <section id="home" className="relative bg-white z-10">
          <Hero />
        </section>

        {/* Portfolio section - Gray background */}
        <section id="portfolio" className="relative py-20 bg-gray-50 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <GalleryGrid />
          </div>
        </section>

        {/* Features section - White background */}
        <section id="features" className="relative py-20 bg-white z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Features />
          </div>
        </section>

        {/* Testimonials section - Gray background */}
        <section id="testimonials" className="relative py-20 bg-gray-50 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Testimonials />
          </div>
        </section>

        {/* Team section - White background */}
        <section id="team" className="relative py-20 bg-white z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <TeamSection />
          </div>
        </section>

        {/* Connect section - Gray background */}
        <section id="connect" className="relative py-20 bg-gray-50 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ConnectWithUs />
          </div>
        </section>

        {/* Consultation section - White background */}
        <section id="consultation" className="relative py-20 bg-white z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ConsultationScheduler />
          </div>
        </section>
      </main>
    </div>
  );
}