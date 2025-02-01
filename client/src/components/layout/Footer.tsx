import { siteConfig } from "@/config";

export function Footer() {
  const { name, contact, social } = siteConfig;
  const currentYear = new Date().getFullYear();

  const scrollToSection = (href: string) => {
    const sectionId = href.replace('#', '');
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64; // Height of the navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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
              <a 
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#home');
                }}
                className="text-sm text-gray-500 hover:text-primary"
              >
                Home
              </a>
              <a 
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#about');
                }}
                className="text-sm text-gray-500 hover:text-primary"
              >
                About Us
              </a>
              <a 
                href="#portfolio"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#portfolio');
                }}
                className="text-sm text-gray-500 hover:text-primary"
              >
                Portfolio
              </a>
              <a 
                href="#consultation"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#consultation');
                }}
                className="text-sm text-gray-500 hover:text-primary"
              >
                Contact
              </a>
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