export const siteConfig = {
  name: import.meta.env.VITE_COMPANY_NAME || "Company Name",
  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL || "contact@example.com",
    phone: import.meta.env.VITE_CONTACT_PHONE || "+1234567890",
  },
  social: {
    instagram: "https://instagram.com/cubbyluxe",
    facebook: "https://facebook.com/CubbyLuxe",
    pinterest: "https://pinterest.com/CubbyLuxe"
  },
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
    style?: string
  }>
}

// Asset paths configuration
export const assetConfig = {
  imagesBasePath: import.meta.env.VITE_IMAGES_PATH || '/images',
  galleryPath: import.meta.env.VITE_GALLERY_PATH || '/gallery',
  testimonialsPath: import.meta.env.VITE_TESTIMONIALS_PATH || '/testimonials',
}

export const sections: Record<string, SectionContent> = {
  features: {
    title: import.meta.env.VITE_FEATURES_TITLE || "Why Choose Us",
    description: import.meta.env.VITE_FEATURES_DESCRIPTION || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    items: [
      {
        title: "Quality Craftsmanship",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        icon: "Hammer"
      },
      {
        title: "Safety First",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        icon: "Shield"
      },
      {
        title: "Custom Design",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        icon: "Pencil"
      },
      {
        title: "Lifetime Warranty",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        icon: "Star"
      }
    ]
  },
  testimonials: {
    title: import.meta.env.VITE_TESTIMONIALS_TITLE || "What Our Clients Say",
    description: import.meta.env.VITE_TESTIMONIALS_DESCRIPTION || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    items: [
      {
        title: "The Reynolds Family",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: `${assetConfig.testimonialsPath}/placeholder.svg`
      },
      {
        title: "The Carter Family",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: `${assetConfig.testimonialsPath}/placeholder.svg`
      }
    ],
    footer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  gallery: {
    title: import.meta.env.VITE_GALLERY_TITLE || "Our Portfolio",
    description: import.meta.env.VITE_GALLERY_DESCRIPTION || "Explore our recent projects and achievements",
    items: [
      {
        title: "Modern Design Project",
        description: "A contemporary approach to space utilization",
        image: `${assetConfig.galleryPath}/placeholder.svg`,
        style: "style1"
      },
      {
        title: "Renovation Excellence",
        description: "Complete home transformation project",
        image: `${assetConfig.galleryPath}/placeholder.svg`,
        style: "style2"
      },
      {
        title: "Custom Build",
        description: "Unique architectural design implementation",
        image: `${assetConfig.galleryPath}/placeholder.svg`,
        style: "style3"
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