import { GiTreehouse } from "react-icons/gi";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <GiTreehouse className="mx-auto h-20 w-20 text-primary" />
            <h1 className="mt-4 text-4xl font-bold text-gray-900">Building More Than Playhouses</h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              CubbyLuxe began with a simple yet powerful idea: to create magical spaces that spark joy and inspire creativity. 
              Founded by a team of dreamers, builders, and parents, we believe every child deserves a place where their imagination can run wild.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What sets us apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Quality Craftsmanship</h3>
                <p className="text-gray-600">Every cubby house is handcrafted with care, ensuring it's as sturdy as it is beautiful.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">Our designs blend creativity with practicality, making each play space as unique as the family it belongs to.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
                <p className="text-gray-600">We use eco-friendly materials and sustainable practices to create spaces that respect the environment.</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mt-12">
            Our mission is more than building cubby houses—it's about creating lifelong memories. Join the CubbyLuxe family and let's build something extraordinary together.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Lead Designer",
                letter: "S",
                bio: "With 15 years of architectural experience, Sarah brings creativity and innovation to every design."
              },
              {
                name: "Mike Thompson",
                role: "Master Craftsman",
                letter: "M",
                bio: "Mike ensures every cubby house meets our high standards of quality and safety."
              },
              {
                name: "Emily Chen",
                role: "Customer Experience",
                letter: "E",
                bio: "Emily works closely with families to bring their dream playhouse visions to life."
              }
            ].map((member) => (
              <Card key={member.name} className="text-center p-6">
                <CardContent className="pt-6 space-y-4">
                  <Avatar className="w-24 h-24 mx-auto bg-gray-200">
                    <AvatarFallback className="text-4xl">{member.letter}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-gray-600">{member.role}</p>
                  </div>
                  <p className="text-gray-500 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Social Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Connect With Us</h2>
          <p className="text-xl text-gray-600 mb-8">
            Follow our journey and join our community of happy families.
          </p>
          <div className="flex justify-center gap-12">
            {[
              { platform: "Instagram", handle: "@cubbyluxe" },
              { platform: "Facebook", handle: "CubbyLuxe" },
              { platform: "Pinterest", handle: "CubbyLuxe" }
            ].map((social) => (
              <div key={social.platform} className="text-center">
                <h3 className="font-semibold text-lg">{social.platform}</h3>
                <p className="text-primary">{social.handle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
