# Pages Directory Structure

This directory contains all the page components for the CubbyLuxe frontend application.

## Pages Overview

1. `Home.tsx`
   - Main landing page
   - Dependencies:
     - @/components/sections/Hero
     - @/components/sections/Features
     - @/components/sections/Testimonials
     - @/components/sections/ProgressTracker
     - @/components/sections/GalleryGrid
     - @/components/sections/CollaborativeDesign
     - @/components/sections/CostCalculator
     - @/components/sections/ConsultationScheduler

2. `AboutUs.tsx`
   - Company information page
   - Dependencies:
     - react-icons/gi
     - @/components/ui/card
     - @/components/ui/avatar

3. `Calculator.tsx`
   - Cost estimation page
   - Dependencies:
     - @/components/sections/CostCalculator
     - react (React, FC type)
   - Features:
     - Responsive layout
     - Tailwind styling with design system
     - Static content with interactive calculator component

4. `Dashboard.tsx`
   - Analytics dashboard with static data
   - Dependencies:
     - lucide-react (Loader2)
     - @/components/ui/card
     - @/components/ui/table
   - Features:
     - Static analytics display
     - Responsive grid layout
     - Sample data included
     - No backend dependencies

5. `Design.tsx`
   - Interactive design interface
   - Dependencies:
     - react (useState)
     - @/components/ui/card
     - @/components/sections/CollaborativeDesign
   - Features:
     - Interactive design workspace
     - Real-time preview
     - Responsive layout
     - No backend dependencies

## Required Component Dependencies
All pages require the following UI dependencies:
- Tailwind CSS for styling
- shadcn/ui components
- React Icons

## Notes for Transfer
- Ensure all component imports use the @/ alias path
- Keep the same directory structure to maintain import paths
- All pages are purely frontend components with no backend dependencies
- Theme configuration is handled through theme.json in the root directory