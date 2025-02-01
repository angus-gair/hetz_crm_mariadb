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

// Asset paths configuration
export const assetConfig = {
  imagesBasePath: import.meta.env.VITE_IMAGES_PATH || '/images',
  galleryPath: import.meta.env.VITE_GALLERY_PATH || '/gallery',
  testimonialsPath: import.meta.env.VITE_TESTIMONIALS_PATH || '/testimonials',
}

// These could also be moved to environment variables or a CMS
export const sections: Record<string, SectionContent> = {
  features: {
    title: import.meta.env.VITE_FEATURES_TITLE || "Why Choose Us",
    description: import.meta.env.VITE_FEATURES_DESCRIPTION || "We provide comprehensive solutions tailored to your needs",
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
    title: import.meta.env.VITE_GALLERY_TITLE || "Our Portfolio",
    description: import.meta.env.VITE_GALLERY_DESCRIPTION || "Explore our recent projects and achievements",
    items: [
      {
        title: "Project 1",
        description: "Description of project 1",
        image: `${assetConfig.galleryPath}/placeholder.svg`
      }
    ]
  },
  testimonials: {
    title: import.meta.env.VITE_TESTIMONIALS_TITLE || "What Our Clients Say",
    description: import.meta.env.VITE_TESTIMONIALS_DESCRIPTION || "Read testimonials from our satisfied clients",
    items: [
      {
        title: "John Doe",
        description: "Great service and professional team!",
        image: `${assetConfig.testimonialsPath}/placeholder.svg`
      }
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