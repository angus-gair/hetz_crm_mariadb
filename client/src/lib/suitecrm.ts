import axios from 'axios';

// In development, proxy through our Express server which will handle routing to SuiteCRM
const SUITECRM_URL = '/api/suitecrm';

// OAuth2 config moved to environment variables
export class SuiteCRMClient {
  private axiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: SUITECRM_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json'
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
            try {
              await this.refreshToken();
              return this.axiosInstance(error.config);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              throw error;
            }
          }
        }
        throw error;
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
      const response = await axios.post(`${SUITECRM_URL}/V8/oauth2/token`, {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.api+json'
        }
      });

      if (!response.data.access_token) {
        throw new Error('No access token received');
      }

      this.accessToken = response.data.access_token;
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
      const response = await this.axiosInstance.get('/V8/meta/now');
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

  async createRecord(moduleName: string, data: any) {
    try {
      const response = await this.axiosInstance.post('/V8/module', {
        data: {
          type: moduleName,
          attributes: data
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to create record in module ${moduleName}:`, error);
      throw error;
    }
  }

  async updateRecord(moduleName: string, id: string, data: any) {
    try {
      const response = await this.axiosInstance.patch('/V8/module', {
        data: {
          type: moduleName,
          id: id,
          attributes: data
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update record ${id} in module ${moduleName}:`, error);
      throw error;
    }
  }

  async deleteRecord(moduleName: string, id: string) {
    try {
      await this.axiosInstance.delete(`/V8/module/${moduleName}/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete record ${id} from module ${moduleName}:`, error);
      throw error;
    }
  }
}

export const suiteCrmClient = new SuiteCRMClient();