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
        {/* Hero section - White background */}
        <section id="home" className="bg-[#FFFFFF]">
          <Hero />
        </section>

        {/* Portfolio section - Gray background */}
        <section id="portfolio" className="py-20 bg-[#F8FAFC]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <GalleryGrid />
          </div>
        </section>

        {/* Features section - White background */}
        <section id="features" className="py-20 bg-[#FFFFFF]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Features />
          </div>
        </section>

        {/* Testimonials section - Gray background */}
        <section id="testimonials" className="py-20 bg-[#F8FAFC]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Testimonials />
          </div>
        </section>

        {/* Team section - White background */}
        <section id="team" className="py-20 bg-[#FFFFFF]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <TeamSection />
          </div>
        </section>

        {/* Connect section - Gray background */}
        <section id="connect" className="py-20 bg-[#F8FAFC]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ConnectWithUs />
          </div>
        </section>

        {/* Consultation section - White background */}
        <section id="consultation" className="py-20 bg-[#FFFFFF]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ConsultationScheduler />
          </div>
        </section>
      </main>
    </div>
  );
}