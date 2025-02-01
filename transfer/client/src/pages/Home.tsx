import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { Testimonials } from "@/components/sections/Testimonials";
import { ProgressTracker } from "@/components/sections/ProgressTracker";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { CollaborativeDesign } from "@/components/sections/CollaborativeDesign";
import { CostCalculator } from "@/components/sections/CostCalculator";
import { ConsultationScheduler } from "@/components/sections/ConsultationScheduler";

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section id="home">
        <Hero />
      </section>

      {/* Features Section */}
      <section className="py-20">
        <Features />
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Portfolio</h2>
          <GalleryGrid />
        </div>
      </section>

      {/* Progress Tracker Section */}
      <section className="py-20">
        <ProgressTracker />
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <Testimonials />
      </section>

      {/* Design Session Section */}
      <section id="design" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold italic text-gray-600 text-center mb-12">Your Vision, Our Expertise</h2>
          <CollaborativeDesign />
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" className="mx-auto h-20 w-20 text-primary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M246 39.29c-37.7-.24-76 18.71-85.2 53.61-46.2-32.1-139.01 45.9-68.26 95.2-93.627-5.8-103.35 116.9 43.86 70.8 15.9 18.7 43.8 30.1 73.9 34 1.1-.9 2.2-1.8 3.4-2.6-9.8-19.6-20-34.6-39.6-47h-46.8v-73.6L119 174l-19-37.1 125.9-64.4 125.9 64.4-19 37.1-8.3-4.3V186c12-12.2 28.4-16.7 43.7-14.5 24.1 3.6 46.9 24.4 45.7 61.1 16.7-3.1 28.7 1.1 36.6 8.4 5.3 4.8 8.9 11.4 10.7 18.7 31.3-22 14.3-64.8-37.6-60.5 14.8-55.7-39.5-107.6-95.8-98.4-6.8-41.85-44-61.28-81.8-61.51z" />
            </svg>
            <h1 className="mt-4 text-4xl font-bold text-gray-900">Building More Than Playhouses</h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              CubbyLuxe began with a simple yet powerful idea: to create magical spaces that spark joy and inspire creativity. Founded by a team of dreamers, builders, and parents, we believe every child deserves a place where their imagination can run wild.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">What sets us apart</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 pt-6">
                  <h3 className="text-xl font-semibold mb-2">Quality Craftsmanship</h3>
                  <p className="text-gray-600">Every cubby house is handcrafted with care, ensuring it's as sturdy as it is beautiful.</p>
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 pt-6">
                  <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                  <p className="text-gray-600">Our designs blend creativity with practicality, making each play space as unique as the family it belongs to.</p>
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 pt-6">
                  <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
                  <p className="text-gray-600">We use eco-friendly materials and sustainable practices to create spaces that respect the environment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 pt-6 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-4xl text-primary">S</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Sarah Johnson</h3>
                <p className="text-primary">Lead Designer</p>
                <p className="mt-2 text-gray-600">With 15 years of architectural experience, Sarah brings creativity and innovation to every design.</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 pt-6 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-4xl text-primary">M</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Mike Thompson</h3>
                <p className="text-primary">Master Craftsman</p>
                <p className="mt-2 text-gray-600">Mike ensures every cubby house meets our high standards of quality and safety.</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 pt-6 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-4xl text-primary">E</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Emily Chen</h3>
                <p className="text-primary">Customer Experience</p>
                <p className="mt-2 text-gray-600">Emily works closely with families to bring their dream playhouse visions to life.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Connect With Us</h2>
          <p className="text-xl text-gray-600 mb-8">Follow our journey and join our community of happy families.</p>
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <h3 className="font-semibold">Instagram</h3>
              <p className="text-primary">@cubbyluxe</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Facebook</h3>
              <p className="text-primary">CubbyLuxe</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Pinterest</h3>
              <p className="text-primary">CubbyLuxe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <section id="calculator" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CostCalculator />
        </div>
      </section>

      {/* Consultation Section */}
      <section id="consultation" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ConsultationScheduler />
        </div>
      </section>
    </div>
  );
}
