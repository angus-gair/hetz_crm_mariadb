import { siteConfig } from "@/config";
import { SiInstagram, SiFacebook, SiPinterest } from "react-icons/si";

export function ConnectWithUs() {
  return (
    <section id="connect" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Connect With Us
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Follow us on social media for inspiration and updates
            </p>
          </div>

          <div className="flex space-x-16 mt-8">
            {/* Instagram */}
            <a
              href="https://instagram.com/cubbyluxe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <SiInstagram className="h-12 w-12" />
              <span className="text-sm">@cubbyluxe</span>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/CubbyLuxe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <SiFacebook className="h-12 w-12" />
              <span className="text-sm">CubbyLuxe</span>
            </a>

            {/* Pinterest */}
            <a
              href="https://pinterest.com/CubbyLuxe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <SiPinterest className="h-12 w-12" />
              <span className="text-sm">CubbyLuxe</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}