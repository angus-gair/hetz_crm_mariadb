import axios from 'axios';

// Interfaces for SuiteCRM data types
interface ConsultationData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: null | string;
  refresh_token?: string;
}

// Define type for endpoint status
export type EndpointStatus = {
  name: string;
  status: number;
  statusText: string;
  error?: string;
  data?: any;
};

export class SuiteCRMService {
  private baseUrl: string;
  private readonly timeout: number = 30000;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<string> | null = null;
  private lastLoginAttempt: number = 0;
  private readonly loginRetryDelay: number = 5000; // 5 seconds (reduced for testing)

  constructor() {
    let url = process.env.SUITECRM_URL || '';
    // Remove trailing slashes and ensure proper formatting
    url = url.replace(/\/+$/, '');
    if (!url.startsWith('http')) {
      url = `http://${url}`;
    }
    this.baseUrl = url;
    console.log('[SuiteCRM] Service initialized with base URL:', this.baseUrl);
  }

  // Get a valid token for API requests, refreshing if necessary
  private async getValidToken(): Promise<string> {
    // If there's already a refresh in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // If token is still valid, return it (5 min buffer before expiry)
    if (this.accessToken && this.tokenExpiry && Date.now() < (this.tokenExpiry - 300000)) {
      return this.accessToken;
    }

    // Start a new refresh
    this.refreshPromise = this.refreshToken();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  // Refresh OAuth token using password grant
  private async refreshToken(): Promise<string> {
    const clientId = process.env.SUITECRM_CLIENT_ID;
    const clientSecret = process.env.SUITECRM_CLIENT_SECRET;
    const username = process.env.SUITECRM_USERNAME;
    const password = process.env.SUITECRM_PASSWORD;

    if (!clientId || !clientSecret) {
      throw new Error('SuiteCRM client credentials not configured');
    }

    if (!username || !password) {
      throw new Error('SuiteCRM username/password not configured');
    }

    try {
      console.log('[SuiteCRM] Refreshing OAuth token with Password Grant...');
      
      const now = Date.now();
      if (this.lastLoginAttempt && (now - this.lastLoginAttempt) < this.loginRetryDelay) {
        throw new Error('Token refresh attempted too frequently');
      }
      this.lastLoginAttempt = now;
      
      // Using the full path for token endpoint as provided by the user
      // Use the correct token endpoint format from documentation
      // SuiteCRM documentation specifies: {{suitecrm.url}}/Api/access_token
      // But the user's environment might use a different path - try multiple formats
      const tokenEndpointPaths = [
        '/Api/access_token',
        '/legacy/Api/access_token',
        '/rest/v10/oauth2/token',
        '/V8/oauth2/token'
      ];
      
      // Get the base URLs to try - we'll attempt multiple formats
      const baseUrls = [
        this.baseUrl,
        // If URL already includes "legacy", try without that path
        this.baseUrl.includes('/legacy') ? this.baseUrl.replace('/legacy', '') : null
      ].filter(Boolean) as string[];
      
      // Generate all possible token URLs to try
      const tokenUrls = baseUrls.flatMap(baseUrl => 
        tokenEndpointPaths.map(path => `${baseUrl}${path}`)
      );
      
      console.log('[SuiteCRM] Will try token URLs in this order:', tokenUrls);
      
      // Try each URL in sequence until one works
      let tokenError = null;
      let response = null;
      
      for (const tokenUrl of tokenUrls) {
        console.log('[SuiteCRM] Trying token URL:', tokenUrl);
        try {
          // For basic OAuth2 compatibility, try both application/json and form encoding
          const contentTypes = [
            'application/json',
            'application/x-www-form-urlencoded'
          ];
          
          // Try each content type
          for (const contentType of contentTypes) {
            try {
              console.log(`[SuiteCRM] Trying with Content-Type: ${contentType}`);
              
              // Format request data based on content type
              const requestData = contentType === 'application/json' 
                ? {
                    grant_type: 'password',
                    client_id: clientId,
                    client_secret: clientSecret,
                    username: username,
                    password: password
                  }
                : new URLSearchParams({
                    grant_type: 'password',
                    client_id: clientId,
                    client_secret: clientSecret,
                    username: username,
                    password: password
                  });
              
              response = await axios.post<TokenResponse>(
                tokenUrl,
                requestData,
                {
                  headers: {
                    'Content-Type': contentType,
                    'Accept': 'application/vnd.api+json, application/json'
                  },
                  timeout: this.timeout
                }
              );
              
              // If we get here, the request was successful
              console.log('[SuiteCRM] Successful token request with URL:', tokenUrl);
              break;
            } catch (contentTypeError: any) {
              console.log(`[SuiteCRM] Failed with Content-Type ${contentType}:`, contentTypeError.message);
              // Continue to next content type
            }
          }
          
          // If we got a response, break out of the URL loop
          if (response) break;
        } catch (urlError: any) {
          console.log(`[SuiteCRM] Token URL ${tokenUrl} failed:`, urlError.message);
          tokenError = urlError;
          // Continue to next URL
        }
      }
      
      // If we tried all URLs and none worked, throw the last error
      if (!response) {
        throw new Error(`All token URLs failed. Last error: ${tokenError?.message || 'Unknown error'}`);
      }

      if (!response.data.access_token) {
        throw new Error('No access token received');
      }

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      console.log('[SuiteCRM] Successfully refreshed OAuth token');
      return this.accessToken;
    } catch (error: any) {
      console.error('[SuiteCRM] Failed to obtain OAuth token:', error.message);
      this.accessToken = null;
      this.tokenExpiry = null;
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Make authenticated requests to SuiteCRM API
  private async makeRequest<T = any>(endpoint: string, options: any = {}): Promise<T> {
    try {
      const token = await this.getValidToken();
      const response = await axios({
        ...options,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Clear token on unauthorized to force a refresh on next attempt
        this.accessToken = null;
        this.tokenExpiry = null;
      }
      console.error(`[SuiteCRM] API Request failed for ${endpoint}:`, error.message);
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  // Test SuiteCRM API connection with detailed endpoint status
  async testConnection(): Promise<{
    success: boolean;
    message?: string;
    endpoints?: EndpointStatus[];
  }> {
    const endpoints: EndpointStatus[] = [];
    let overallSuccess = false;

    try {
      // Step 1: Test OAuth token endpoint first
      console.log('[SuiteCRM] Testing OAuth token acquisition...');
      try {
        const token = await this.getValidToken();
        endpoints.push({
          name: 'V8 Token Endpoint',
          status: 200,
          statusText: 'OK',
          data: { token_acquired: true }
        });
        
        // Step 2: Test a basic metadata endpoint
        console.log('[SuiteCRM] Testing metadata endpoint...');
        try {
          const testEndpoint = '/Api/V8/meta/modules';
          const response = await axios.get(
            `${this.baseUrl}${testEndpoint}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.api+json'
              },
              timeout: this.timeout
            }
          );
          
          endpoints.push({
            name: 'V8 Metadata Endpoint',
            status: response.status,
            statusText: response.statusText,
            data: { modules: Object.keys(response.data.modules || {}).length }
          });
          
          // If we get here, the connection test is successful
          overallSuccess = true;
        } catch (metaError: any) {
          endpoints.push({
            name: 'V8 Metadata Endpoint',
            status: metaError.response?.status || 500,
            statusText: metaError.response?.statusText || 'Error',
            error: metaError.message
          });
        }
      } catch (tokenError: any) {
        endpoints.push({
          name: 'V8 Token Endpoint',
          status: tokenError.response?.status || 500,
          statusText: tokenError.response?.statusText || 'Error',
          error: tokenError.message
        });
      }
      
      return {
        success: overallSuccess,
        message: overallSuccess 
          ? 'Successfully connected to SuiteCRM API' 
          : 'Failed to connect to one or more SuiteCRM endpoints',
        endpoints
      };
    } catch (error: any) {
      console.error('[SuiteCRM] Connection test failed:', error);
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
        endpoints
      };
    }
  }

  // Create a new meeting (consultation) in SuiteCRM using API V8
  async createConsultationMeeting(consultationData: ConsultationData): Promise<{ success: boolean; message: string }> {
    try {
      // Format the date and time for the meeting
      const meetingDate = consultationData.preferredDate ? new Date(consultationData.preferredDate) : new Date();
      if (consultationData.preferredTime) {
        const [hours, minutes] = consultationData.preferredTime.split(':');
        meetingDate.setHours(parseInt(hours), parseInt(minutes));
      }

      // End date is 1 hour after start
      const endDate = new Date(meetingDate);
      endDate.setHours(endDate.getHours() + 1);

      // Format dates for SuiteCRM (ISO format for API V8)
      const formatDate = (date: Date) => {
        return date.toISOString();
      };

      // Create meeting using API V8 
      const meetingData = {
        data: {
          type: "Meetings",
          attributes: {
            name: `Consultation with ${consultationData.name}`,
            date_start: formatDate(meetingDate),
            date_end: formatDate(endDate),
            status: "Planned",
            description: `Contact Info:\nEmail: ${consultationData.email}\nPhone: ${consultationData.phone}\n\nNotes: ${consultationData.notes || 'No additional notes'}`,
            type: "Consultation"
          }
        }
      };

      console.log('[SuiteCRM] Sending meeting creation request');

      const response = await this.makeRequest('/Api/V8/module', {
        method: 'POST',
        data: meetingData
      });

      console.log('[SuiteCRM] Meeting creation response:', response);

      if (response.data?.id) {
        return {
          success: true,
          message: 'Thank you! Your consultation request has been received. Our team will contact you shortly to confirm the details.'
        };
      } else {
        throw new Error('Failed to create meeting: Invalid response from SuiteCRM');
      }

    } catch (error) {
      console.error('[SuiteCRM] Failed to create consultation meeting:', error instanceof Error ? error.message : String(error));
      if (axios.isAxiosError(error)) {
        console.error('[SuiteCRM] Response details:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }

      return {
        success: false,
        message: 'We encountered an issue scheduling your consultation. Please try again later or contact us directly.'
      };
    }
  }

  // Create a contact in SuiteCRM
  async createContact(contactData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    message?: string;
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Create contact using API V8
      const data = {
        data: {
          type: "Contacts",
          attributes: {
            first_name: contactData.firstName,
            last_name: contactData.lastName,
            email1: contactData.email,
            phone_work: contactData.phone || '',
            description: contactData.message || ''
          }
        }
      };

      console.log('[SuiteCRM] Creating contact:', contactData.firstName, contactData.lastName);

      const response = await this.makeRequest('/Api/V8/module', {
        method: 'POST',
        data: data
      });

      if (response.data?.id) {
        return {
          success: true,
          id: response.data.id
        };
      } else {
        throw new Error('Failed to create contact: Invalid response from SuiteCRM');
      }
    } catch (error: any) {
      console.error('[SuiteCRM] Failed to create contact:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get modules from SuiteCRM
  async getModules(): Promise<any> {
    try {
      return await this.makeRequest('/Api/V8/meta/modules');
    } catch (error) {
      console.error('[SuiteCRM] Failed to get modules:', error);
      throw error;
    }
  }

  // Get module fields
  async getModuleFields(moduleName: string): Promise<any> {
    try {
      return await this.makeRequest(`/Api/V8/meta/fields/${moduleName}`);
    } catch (error) {
      console.error(`[SuiteCRM] Failed to get fields for module ${moduleName}:`, error);
      throw error;
    }
  }

  // Get module records
  async getModuleRecords(moduleName: string, params: {
    page?: number;
    size?: number;
    filter?: string;
  } = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page[number]', params.page.toString());
      if (params.size) queryParams.append('page[size]', params.size.toString());
      if (params.filter) queryParams.append('filter', params.filter);
      
      const endpoint = `/Api/V8/module/${moduleName}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error(`[SuiteCRM] Failed to get records for module ${moduleName}:`, error);
      throw error;
    }
  }
}

export const suiteCRMService = new SuiteCRMService();