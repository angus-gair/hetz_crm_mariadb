// Site configuration types
interface SiteConfig {
  name: string;
  contact: {
    email: string;
    phone: string;
  };
  social: {
    instagram: string;
    facebook: string;
    pinterest: string;
  };
  hero: {
    title: string;
    subtitle: string;
  };
}

// Section content type with optional fields for different content types
export interface SectionContent {
  title: string;
  description: string;
  items: Array<{
    title: string;
    description: string;
    icon?: string;
    image?: string;
    style?: string;
    role?: string;
    phone?: string;
    email?: string;
  }>;
}

// Asset paths configuration
interface AssetConfig {
  imagesBasePath: string;
  galleryPath: string;
  testimonialsPath: string;
  teamPath: string;
}

// CRM Integration Configuration
interface CRMConfig {
  baseUrl: string;
  endpoints: {
    [key: string]: string;
  };
}

// Site Configuration
export const siteConfig: SiteConfig = {
  name: import.meta.env.VITE_COMPANY_NAME || "CubbyLuxe",
  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL || "info@cubbyluxe.com",
    phone: import.meta.env.VITE_CONTACT_PHONE || "0468 333 745",
  },
  social: {
    instagram: "https://instagram.com/cubbyluxe",
    facebook: "https://facebook.com/CubbyLuxe",
    pinterest: "https://pinterest.com/CubbyLuxe"
  },
  hero: {
    title: import.meta.env.VITE_HERO_TITLE || "Crafting Magical Spaces for Little Dreamers",
    subtitle: import.meta.env.VITE_HERO_SUBTITLE || "Premium custom cubby houses designed to inspire imagination and create lasting memories.",
  }
}

// Asset Configuration
export const assetConfig: AssetConfig = {
  imagesBasePath: '/images',
  galleryPath: '/images/portfolio',
  testimonialsPath: '/images/testimonials',
  teamPath: '/images/team'
}

// Sections Configuration
export const sections: Record<string, SectionContent> = {
  features: {
    title: import.meta.env.VITE_FEATURES_TITLE || "Why Choose CubbyLuxe",
    description: import.meta.env.VITE_FEATURES_DESCRIPTION || "We combine creativity, craftsmanship, and safety to create the perfect play space for your children.",
    items: [
      {
        title: "Quality Craftsmanship",
        description: "Each cubby house is handcrafted with premium materials and attention to detail.",
        icon: "Hammer"
      },
      {
        title: "Safety First",
        description: "Built to exceed Australian safety standards with child-friendly materials.",
        icon: "Shield"
      },
      {
        title: "Custom Design",
        description: "Personalized designs that match your space and your child's dreams.",
        icon: "Pencil"
      },
      {
        title: "Lifetime Warranty",
        description: "Built to last with comprehensive warranty coverage.",
        icon: "Star"
      }
    ]
  },
  testimonials: {
    title: import.meta.env.VITE_TESTIMONIALS_TITLE || "What Our Families Say",
    description: import.meta.env.VITE_TESTIMONIALS_DESCRIPTION || "Join hundreds of happy families who have chosen CubbyLuxe for their children's dream play space.",
    items: [
      {
        title: "The Reynolds Family",
        description: "The team at CubbyLuxe went above and beyond. Our kids absolutely love their new cubby house!",
        image: `${assetConfig.testimonialsPath}/reynolds.jpg`
      },
      {
        title: "The Carter Family",
        description: "Outstanding quality and service. The custom design process was fantastic.",
        image: `${assetConfig.testimonialsPath}/carter.jpg`
      }
    ]
  },
  gallery: {
    title: import.meta.env.VITE_GALLERY_TITLE || "Our Latest Creations",
    description: import.meta.env.VITE_GALLERY_DESCRIPTION || "Browse through our collection of custom-designed cubby houses.",
    items: [
      {
        title: "Enchanted Castle",
        description: "A magical two-story cubby house with slide and climbing wall",
        image: `/images/portfolio/Cubby_1.jpg`,
        style: "style1"
      },
      {
        title: "Treehouse Haven",
        description: "Natural wooden design with rope bridge and secret hideout",
        image: `/images/portfolio/Cubby_22.jpg`,
        style: "style2"
      },
      {
        title: "Modern Playhouse",
        description: "Contemporary design with multiple play areas",
        image: `/images/portfolio/Cubby_26.jpg`,
        style: "style3"
      }
    ]
  },
  team: {
    title: import.meta.env.VITE_TEAM_TITLE || "Meet Our Team",
    description: import.meta.env.VITE_TEAM_DESCRIPTION || "The passionate experts behind our magical creations.",
    items: [
      {
        title: "Sarah Johnson",
        role: "Lead Designer",
        description: "With 15 years of architectural experience, Sarah brings creativity and innovation to every design.",
        image: `${assetConfig.teamPath}/sarah.jpg`
      },
      {
        title: "Mike Thompson",
        role: "Master Craftsman",
        description: "Mike ensures every cubby house meets our high standards of quality and safety.",
        image: `${assetConfig.teamPath}/mike.jpg`
      },
      {
        title: "Emily Chen",
        role: "Customer Experience",
        description: "Emily works closely with families to bring their dream playhouse visions to life.",
        image: `${assetConfig.teamPath}/emily.jpg`
      }
    ]
  },
  consultation: {
    title: import.meta.env.VITE_CONSULTATION_TITLE || "Book a Free Consultation",
    description: import.meta.env.VITE_CONSULTATION_DESCRIPTION || "Let's discuss your dream cubby house. Schedule a consultation with our design experts.",
    items: []
  }
}

// CRM Integration Configuration
export const crmConfig: CRMConfig = {
  baseUrl: import.meta.env.VITE_SUITECRM_URL || "http://localhost:8080",
  endpoints: {
    leads: "/api/v8/leads",
    contacts: "/api/v8/contacts",
    meetings: "/api/v8/meetings"
  }
}

// Environment variables reference (for documentation)
/*
Required environment variables:
VITE_COMPANY_NAME - Company name
VITE_CONTACT_EMAIL - Contact email
VITE_CONTACT_PHONE - Contact phone
VITE_IMAGES_PATH - Base path for images
VITE_GALLERY_PATH - Path for gallery images
VITE_TESTIMONIALS_PATH - Path for testimonial images
VITE_TEAM_PATH - Path for team member images
VITE_SUITECRM_URL - CRM base URL

Optional environment variables for section customization:
VITE_HERO_TITLE - Hero section title
VITE_HERO_SUBTITLE - Hero section subtitle
VITE_FEATURES_TITLE - Features section title
VITE_FEATURES_DESCRIPTION - Features section description
VITE_TESTIMONIALS_TITLE - Testimonials section title
VITE_TESTIMONIALS_DESCRIPTION - Testimonials section description
VITE_GALLERY_TITLE - Gallery section title
VITE_GALLERY_DESCRIPTION - Gallery section description
VITE_TEAM_TITLE - Team section title
VITE_TEAM_DESCRIPTION - Team section description
VITE_CONSULTATION_TITLE - Consultation section title
VITE_CONSULTATION_DESCRIPTION - Consultation section description
*/