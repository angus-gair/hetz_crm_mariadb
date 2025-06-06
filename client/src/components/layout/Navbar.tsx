import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "#home" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "About Us", href: "#about" },
    { name: "Contact Form", href: "#form" },
    { name: "Book a Consultation", href: "#consultation" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            setActiveSection(sectionId);
            history.replaceState(null, '', `#${sectionId}`);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

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
    setIsOpen(false);
  };

  return (
    <nav className="w-full bg-white border-b sticky top-0 z-50">
      <div className="container px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <a
              href="#home"
              className="flex items-center space-x-2"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#home');
              }}
            >
              <span className="text-xl font-bold">CubbyLuxe</span>
            </a>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${activeSection === item.href.replace('#', '') 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {item.name}
              </a>
            ))}
            <Link href="/admin" className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-100">
              Admin
            </Link>
            <Link href="/crm-test" className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-100">
              CRM Test
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className={`block rounded-md px-3 py-2 text-base font-medium
                  ${activeSection === item.href.replace('#', '')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {item.name}
              </a>
            ))}
            <Link href="/admin" className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100">
              Admin
            </Link>
            <Link href="/crm-test" className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100">
              CRM Test
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}