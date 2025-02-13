# Layout Components

This directory contains the main layout components for the CubbyLuxe application.

## Components

### Navbar
Main navigation component that includes:
- Logo/branding
- Navigation links
- Action buttons

Dependencies:
- wouter (Link)
- @/components/ui/button (Button component)

### Footer
Footer component that includes:
- Social media links
- Copyright information
- Navigation links

Dependencies:
- wouter (Link)
- react-icons/fa (FaInstagram, FaFacebookF, FaPinterest)

## Usage

Import the components in your app layout:

```tsx
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout() {
  return (
    <>
      <Navbar />
      {/* Your app content */}
      <Footer />
    </>
  );
}
```

## Component Structure
```
layout/
├── Navbar.tsx - Main navigation component
├── Footer.tsx - Footer component 
└── README.md - Documentation