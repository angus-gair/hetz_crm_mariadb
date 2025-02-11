import axios from 'axios';

// In development, proxy through our Express server which will handle routing to SuiteCRM
const SUITECRM_URL = '/api/suitecrm';

class SuiteCRMClient {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: SUITECRM_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json',
        'User-Agent': 'SuiteCRM-GraphQL-Client/1.0'
      }
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('SuiteCRM API Error Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          console.error('SuiteCRM API No Response:', error.request);
        } else {
          console.error('SuiteCRM API Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // Test connection and version
  async testConnection() {
    try {
      const response = await this.axiosInstance.get('/meta/now');
      return response.data;
    } catch (error) {
      console.error('Failed to connect to SuiteCRM V8 API, trying legacy endpoint...');
      try {
        const legacyResponse = await this.axiosInstance.post('/v4_1/rest', {
          method: 'get_server_info',
          input_type: 'JSON',
          response_type: 'JSON',
          rest_data: []
        });
        return legacyResponse.data;
      } catch (secondError) {
        console.error('Failed to connect to SuiteCRM legacy API:', secondError);
        throw secondError;
      }
    }
  }

  // Get OAuth token using client credentials
  async getToken() {
    try {
      const response = await this.axiosInstance.post('/oauth2/token', {
        grant_type: 'client_credentials',
        client_id: '3d55a713-12be-62ea-c814-67aaf6faa94f',
        client_secret: 'a4e27aa43c190b48b250c2e59f322761971eabfab923d1db8e86bcaecc7b1d08'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get OAuth token:', error);
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