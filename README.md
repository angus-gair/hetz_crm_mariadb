# CubbyLuxe - Custom Cubby House Design Platform

A professional web application for custom cubby house services, providing a comprehensive digital platform for client engagement, design visualization, and project management.

## Features

- Interactive Design Studio
- Project Portfolio Gallery
- Client Consultation Booking
- Real-time Cost Calculator
- Team Collaboration Tools

## Tech Stack

- React with TypeScript
- Vite for build optimization
- Express backend
- Tailwind CSS for styling
- shadcn/ui components
- PostgreSQL database

## Quick Start

1. Click "Use Template" to create your own copy
2. The template will automatically install all required dependencies
3. Update the environment variables in `.env` file:
   ```env
   VITE_COMPANY_NAME=YourCompanyName
   VITE_CONTACT_EMAIL=your@email.com
   VITE_CONTACT_PHONE=YourPhone
   ```
4. Add your company images to:
   - `public/images/portfolio/` - for gallery images (supported formats: jpg, png)
   - `public/images/team/` - for team member photos
   - `public/images/testimonials/` - for client testimonials

## Project Structure

```
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── config.ts
├── server/           # Backend Express server
├── public/           # Static assets
└── db/              # Database configuration
```

## Customization

1. Update `src/config.ts` with your company information
2. Modify the theme in `theme.json`
3. Add your own images to the `public/images` directory
4. Customize components in `client/src/components/sections`

## Development

The development server will start automatically when you open the project. You can also manually start it with:

```bash
npm run dev
```

This will start both the frontend and backend servers.

## License

This template is licensed under the MIT License.