import { siteConfig } from "@/config";
import { Link } from "wouter";

export function Footer() {
  const { name, contact, social } = siteConfig;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-gray-500">
              Creating exceptional spaces that inspire and delight.
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm text-gray-500 hover:text-primary">
                Home
              </Link>
              <Link href="/about" className="text-sm text-gray-500 hover:text-primary">
                About Us
              </Link>
              <Link href="/portfolio" className="text-sm text-gray-500 hover:text-primary">
                Portfolio
              </Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">{contact.email}</p>
              <p className="text-sm text-gray-500">{contact.phone}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex space-x-4">
              {Object.entries(social).map(([platform, url]) => (
                url && (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-primary"
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>&copy; {currentYear} {name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
