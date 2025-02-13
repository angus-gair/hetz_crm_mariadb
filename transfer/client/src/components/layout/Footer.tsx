import { Link } from "wouter";
import { FaInstagram, FaFacebookF, FaPinterest } from "react-icons/fa";
import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">CubbyLuxe</h3>
            <p className="text-muted-foreground">
              Creating magical spaces for children to learn, play, and grow.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-primary">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/gallery">
                  <a className="text-muted-foreground hover:text-primary">Gallery</a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="text-muted-foreground hover:text-primary">Pricing</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email: hello@cubbyluxe.com</li>
              <li>Phone: (555) 123-4567</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram size={24} />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF size={24} />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary"
                aria-label="Follow us on Pinterest"
              >
                <FaPinterest size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CubbyLuxe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};