import axios from 'axios';

interface StrapiConfig {
  baseUrl: string;
  apiToken: string;
}

class StrapiService {
  private config: StrapiConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.STRAPI_API_URL || 'http://localhost:1337',
      apiToken: process.env.STRAPI_API_TOKEN || '',
    };
  }

  private get apiClient() {
    return axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Gallery images
  async getGalleryImages() {
    try {
      const response = await this.apiClient.get('/api/gallery-images');
      return response.data;
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw error;
    }
  }

  // Testimonials
  async getTestimonials() {
    try {
      const response = await this.apiClient.get('/api/testimonials');
      return response.data;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  }

  // Team members
  async getTeamMembers() {
    try {
      const response = await this.apiClient.get('/api/team-members');
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  // General content
  async getPageContent(identifier: string) {
    try {
      const response = await this.apiClient.get(`/api/pages?filters[identifier]=${identifier}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page content:', error);
      throw error;
    }
  }
}

export const strapiService = new StrapiService();
