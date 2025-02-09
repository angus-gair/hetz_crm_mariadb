# Strapi CMS for CubbyLuxe

This directory contains the Strapi CMS configuration for the CubbyLuxe website. Strapi is used to manage dynamic content such as:
- Gallery images
- Testimonials
- Team members
- Page content

## Setup Instructions

1. Navigate to the strapi directory:
```bash
cd strapi
```

2. Install dependencies:
```bash
npm install
```

3. Start the Strapi server:
```bash
npm run develop
```

4. Create your admin account:
- Open http://localhost:1337/admin in your browser
- Follow the registration process to create your first administrator account

## Content Types

The following content types are available:
- Gallery Images: Manage the portfolio of cubby house images
- Testimonials: Customer reviews and feedback
- Team Members: Staff profiles and information
- Pages: General website content and sections

## Environment Variables

Make sure to set up the following environment variables:
- STRAPI_API_URL: The URL where Strapi is running
- STRAPI_API_TOKEN: Your API token for authentication
