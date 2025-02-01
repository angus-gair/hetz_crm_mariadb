export const siteConfig = {
  name: import.meta.env.VITE_COMPANY_NAME || "Company Name",
  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL || "contact@example.com",
    phone: import.meta.env.VITE_CONTACT_PHONE || "+1234567890",
  },
  social: JSON.parse(import.meta.env.VITE_SOCIAL_LINKS || '{"facebook":"","twitter":"","instagram":""}'),
  hero: {
    title: import.meta.env.VITE_HERO_TITLE || "Welcome to Our Company",
    subtitle: import.meta.env.VITE_HERO_SUBTITLE || "Your trusted partner in success",
  }
}

export type SectionContent = {
  title: string
  description: string
  items: Array<{
    title: string
    description: string
    icon?: string
    image?: string
  }>
}

// These could also be moved to environment variables or a CMS
export const sections: Record<string, SectionContent> = {
  features: {
    title: "Why Choose Us",
    description: "We provide comprehensive solutions tailored to your needs",
    items: [
      {
        title: "Expert Team",
        description: "Our experienced professionals deliver excellence",
        icon: "Users"
      },
      // Add more features as needed
    ]
  },
  gallery: {
    title: "Our Portfolio",
    description: "Explore our recent projects and achievements",
    items: [
      {
        title: "Project 1",
        description: "Description of project 1",
        image: "/gallery/project1.jpg"
      },
      // Add more gallery items
    ]
  },
  testimonials: {
    title: "What Our Clients Say",
    description: "Read testimonials from our satisfied clients",
    items: [
      {
        title: "John Doe",
        description: "Great service and professional team!",
        image: "/testimonials/john.jpg"
      },
      // Add more testimonials
    ]
  }
}

// CRM Integration Configuration
export const crmConfig = {
  baseUrl: import.meta.env.VITE_SUITECRM_URL || "http://localhost:8080",
  endpoints: {
    leads: "/api/v8/leads",
    contacts: "/api/v8/contacts",
    meetings: "/api/v8/meetings"
  }
}