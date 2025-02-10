import axios from 'axios';

const SUITECRM_URL = 'http://135.181.101.154:8080';

class SuiteCRMClient {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: SUITECRM_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('SuiteCRM API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Test connection and version
  async testConnection() {
    try {
      const response = await this.axiosInstance.get('/rest/v11_5/meta/version');
      return response.data;
    } catch (error) {
      console.error('Failed to connect to SuiteCRM:', error);
      throw error;
    }
  }

  // Get CSRF token
  async getCsrfToken() {
    try {
      const response = await this.axiosInstance.get('/rest/v11_5/csrf');
      return response.data;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      throw error;
    }
  }

  // Test authentication
  async login(username: string, password: string) {
    try {
      const csrfToken = await this.getCsrfToken();
      const response = await this.axiosInstance.post('/rest/v11_5/oauth2/token', {
        grant_type: 'password',
        username,
        password,
        client_id: 'sugar',
        platform: 'api'
      }, {
        headers: {
          'X-CSRF-TOKEN': csrfToken.token
        }
      });
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }
}

export const suiteCrmClient = new SuiteCRMClient();
