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
    description: import.meta.env.VITE_FEATURES_DESCRIPTION || "We provide comprehensive solutions tailored to your needs",
    items: [
      {
        title: "Expert Team",
        description: "Our experienced professionals deliver excellence",
        icon: "Users"
      }
    ]
  },
  testimonials: {
    title: import.meta.env.VITE_TESTIMONIALS_TITLE || "Creating Moments That Matter",
    description: import.meta.env.VITE_TESTIMONIALS_DESCRIPTION || "At CubbyLuxe, we don't just build cubby houses—we craft joy, laughter, and treasured memories. Each of our designs becomes the heart of family fun, inspiring imaginations and bringing loved ones closer together.",
    items: [
      {
        title: "The Reynolds Family",
        description: "Our cubby house is more than a play space—it's our daughter's favourite place to explore and imagine. Thank you, CubbyLuxe, for making her dreams come true!",
        image: `${assetConfig.testimonialsPath}/placeholder.svg`
      },
      {
        title: "The Carter Family",
        description: "The quality and attention to detail are outstanding. We've recommended CubbyLuxe to all our friends!",
        image: `${assetConfig.testimonialsPath}/placeholder.svg`
      }
    ],
    footer: "Your family's happiness is our ultimate reward. Let us help you create a play space that will be cherished for years to come."
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