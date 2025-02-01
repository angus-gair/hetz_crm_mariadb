import { siteConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { SiInstagram, SiFacebook, SiPinterest } from "react-icons/si";

export function ConnectWithUs() {
  const { social } = siteConfig;
  
  return (
    <section id="connect" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Connect With Us
          </h2>
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Follow us on social media for inspiration and updates
          </p>
          <div className="flex space-x-6 mt-8">
            {social.instagram && (
              <Button variant="outline" size="lg" asChild>
                <a 
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <SiInstagram className="h-5 w-5" />
                  <span>Instagram</span>
                </a>
              </Button>
            )}
            {social.facebook && (
              <Button variant="outline" size="lg" asChild>
                <a 
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <SiFacebook className="h-5 w-5" />
                  <span>Facebook</span>
                </a>
              </Button>
            )}
            {social.pinterest && (
              <Button variant="outline" size="lg" asChild>
                <a 
                  href={social.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <SiPinterest className="h-5 w-5" />
                  <span>Pinterest</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
