# CubbyLuxe Website Files Transfer Package

This package contains all the necessary files for the CubbyLuxe website frontend. The structure is organized as follows:

```
/client
  /src
    /components
      /layout
        - Navbar.tsx
        - Footer.tsx
      /sections
        - Hero.tsx
        - Features.tsx
        - Testimonials.tsx
        - ProgressTracker.tsx
        - GalleryGrid.tsx
        - CollaborativeDesign.tsx
        - CostCalculator.tsx
        - ConsultationScheduler.tsx
        - ShareButtons.tsx
        - DesignAnnotations.tsx
        - ModelViewer.tsx
      /ui
        - [shadcn components]
    /pages
      - Home.tsx
      - AboutUs.tsx
    - App.tsx
    - main.tsx
    - index.css

/config
  - theme.json
  - tailwind.config.ts
  - postcss.config.js
  - vite.config.ts
```

## Setup Instructions

1. Copy all files maintaining the directory structure
2. Install required dependencies
3. Update environment variables
4. Start the development server

## Required Dependencies
See package.json for the complete list of dependencies.

## Environment Variables
Create a `.env` file with the following variables:
```
VITE_API_URL=your_api_url