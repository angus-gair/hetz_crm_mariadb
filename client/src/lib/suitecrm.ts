import axios from 'axios';

// In development, proxy through our Express server which will handle routing to SuiteCRM
const SUITECRM_URL = '/api/suitecrm';

// OAuth2 config - these should be moved to environment variables
const OAUTH2_CONFIG = {
  clientId: '3d55a713-12be-62ea-c814-67aaf6faa94f',
  clientSecret: 'a4e27aa43c190b48b250c2e59f322761971eabfab923d1db8e86bcaecc7b1d08'
};

export class SuiteCRMClient {
  private axiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: SUITECRM_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json',
        'User-Agent': 'SuiteCRM-GraphQL-Client/1.0'
      }
    });

    // Add request interceptor for token management
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Check if we need to refresh the token
        if (this.shouldRefreshToken()) {
          await this.refreshToken();
        }

        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response) {
          console.error('SuiteCRM API Error Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });

          // If unauthorized and we have credentials, try to get a new token
          if (error.response.status === 401 && !error.config._retry) {
            error.config._retry = true;
            await this.refreshToken();
            return this.axiosInstance(error.config);
          }
        } else if (error.request) {
          console.error('SuiteCRM API No Response:', error.request);
        } else {
          console.error('SuiteCRM API Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  private shouldRefreshToken(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return true;
    // Refresh if token expires in less than 5 minutes
    return Date.now() >= (this.tokenExpiry - 300000);
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await axios.post(`${SUITECRM_URL}/oauth2/token`, {
        grant_type: 'client_credentials',
        client_id: OAUTH2_CONFIG.clientId,
        client_secret: OAUTH2_CONFIG.clientSecret
      });

      this.accessToken = response.data.access_token;
      // Set expiry time (current time + expires_in seconds)
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    } catch (error) {
      console.error('Failed to refresh OAuth token:', error);
      this.accessToken = null;
      this.tokenExpiry = null;
      throw error;
    }
  }

  // Test connection and version
  async testConnection() {
    try {
      const response = await this.axiosInstance.get('/meta/now');
      return response.data;
    } catch (error) {
      console.error('Failed to connect to SuiteCRM V8 API');
      throw error;
    }
  }

  // Module operations
  async getModules() {
    try {
      const response = await this.axiosInstance.get('/V8/meta/modules');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      throw error;
    }
  }

  async getModuleFields(moduleName: string) {
    try {
      const response = await this.axiosInstance.get(`/V8/meta/fields/${moduleName}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch fields for module ${moduleName}:`, error);
      throw error;
    }
  }

  async getRecord(moduleName: string, id: string) {
    try {
      const response = await this.axiosInstance.get(`/V8/module/${moduleName}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch record ${id} from module ${moduleName}:`, error);
      throw error;
    }
  }

  async login(username: string, password: string) {
    try {
      const response = await this.axiosInstance.post('/oauth2/token', {
        grant_type: 'password',
        username,
        password,
        client_id: 'sugar',
        platform: 'base'
      });
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }
}

export const suiteCrmClient = new SuiteCRMClient();