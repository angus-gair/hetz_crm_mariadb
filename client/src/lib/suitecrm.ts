import axios from 'axios';

const SUITECRM_URL = import.meta.env.VITE_SUITECRM_URL || 'http://localhost:8080';

class SuiteCRMClient {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: SUITECRM_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json',
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
      // First try the V8 API endpoint
      const response = await this.axiosInstance.get('/Api/V8/meta/now');
      return response.data;
    } catch (error) {
      console.error('Failed to connect to SuiteCRM V8 API, trying legacy endpoint...');
      try {
        // Fallback to legacy API endpoint
        const legacyResponse = await this.axiosInstance.post('/service/v4_1/rest.php', {
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

  // Get CSRF token
  async getCsrfToken() {
    try {
      const response = await this.axiosInstance.get('/Api/V8/meta/csrf');
      return response.data;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      throw error;
    }
  }

  // Test authentication
  async login(username: string, password: string) {
    try {
      const response = await this.axiosInstance.post('/Api/V8/oauth2/token', {
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