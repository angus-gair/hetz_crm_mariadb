import { siteConfig } from "@/config";
import { SiInstagram, SiFacebook, SiPinterest } from "react-icons/si";

export function ConnectWithUs() {
  return (
    <section id="connect" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex space-x-12">
            {/* Instagram */}
            <a
              href="https://instagram.com/cubbyluxe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <SiInstagram className="h-8 w-8" />
              <span className="text-sm">@cubbyluxe</span>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/CubbyLuxe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <SiFacebook className="h-8 w-8" />
              <span className="text-sm">CubbyLuxe</span>
            </a>

            {/* Pinterest */}
            <a
              href="https://pinterest.com/CubbyLuxe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <SiPinterest className="h-8 w-8" />
              <span className="text-sm">CubbyLuxe</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}