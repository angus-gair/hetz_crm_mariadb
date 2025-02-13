import { Link } from "wouter";
import { Button } from "../ui/button";
import React from "react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="text-xl font-bold text-primary">CubbyLuxe</a>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/about">
              <a className="text-gray-600 hover:text-primary">About</a>
            </Link>
            <Link href="/gallery">
              <a className="text-gray-600 hover:text-primary">Gallery</a>
            </Link>
            <Link href="/pricing">
              <a className="text-gray-600 hover:text-primary">Pricing</a>
            </Link>
            <Button asChild variant="outline">
              <Link href="/contact">
                <a>Contact Us</a>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};