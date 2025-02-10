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
        'Accept': 'application/json',
      }
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('SuiteCRM API Error Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          // The request was made but no response was received
          console.error('SuiteCRM API No Response:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
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
      const response = await this.axiosInstance.get('/Api/access/token');
      return response.data;
    } catch (error) {
      console.error('Failed to connect to SuiteCRM V8 API, trying legacy endpoint...');
      try {
        // Fallback to legacy API endpoint
        const legacyResponse = await this.axiosInstance.get('/service/v4_1/rest.php');
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
      const response = await this.axiosInstance.get('/Api/access/token');
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
      const response = await this.axiosInstance.post('/Api/access/token', {
        grant_type: 'password',
        username,
        password,
        client_id: 'sugar',
        platform: 'base'
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