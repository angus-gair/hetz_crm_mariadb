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
    // Default URL based on test script - will be replaced by env var if available
    let url = process.env.SUITECRM_URL || 'https://157.180.44.137';
    // Remove trailing slashes and ensure proper formatting
    url = url.replace(/\/+$/, '');
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
    // Use values from test script as defaults
    const clientId = process.env.SUITECRM_CLIENT_ID || 'b61a3ede-0d51-ebe4-f0d1-67e261f5692e';
    const clientSecret = process.env.SUITECRM_CLIENT_SECRET || 'Jamfinnarc1776!';
    const username = process.env.SUITECRM_USERNAME || 'admin';
    const password = process.env.SUITECRM_PASSWORD || 'Admin123';

    if (!clientId || !clientSecret) {
      throw new Error('SuiteCRM client credentials not configured');
    }

    try {
      console.log('[SuiteCRM] Refreshing OAuth token...');
      
      const now = Date.now();
      if (this.lastLoginAttempt && (now - this.lastLoginAttempt) < this.loginRetryDelay) {
        throw new Error('Token refresh attempted too frequently');
      }
      this.lastLoginAttempt = now;
      
      // Based on the test script, use /legacy/Api/access_token as the token endpoint
      const tokenUrl = `${this.baseUrl}/legacy/Api/access_token`;
      
      console.log('[SuiteCRM] Using token URL:', tokenUrl);
      
      // Use form-encoded for token request based on test script
      const formData = new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password
      });
      
      const response = await axios.post<TokenResponse>(
        tokenUrl,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: this.timeout
        }
      );
      
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
          'Accept': 'application/json',
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

  // Test SuiteCRM API connection
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
          name: 'Token Endpoint',
          status: 200,
          statusText: 'OK',
          data: { token_acquired: true }
        });
        
        // Step 2: Test the REST API V8 metadata endpoint
        console.log('[SuiteCRM] Testing REST API V8 metadata endpoint...');
        try {
          const response = await axios.get(
            `${this.baseUrl}/legacy/Api/V8/meta/modules`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              },
              timeout: this.timeout
            }
          );
          
          endpoints.push({
            name: 'REST API V8 Metadata Endpoint',
            status: response.status,
            statusText: response.statusText,
            data: { modules: Object.keys(response.data.modules || {}).length }
          });
          
          // If we get here, the REST API is working
          overallSuccess = true;
        } catch (restError: any) {
          console.log('[SuiteCRM] REST API test failed, error:', restError.message);
          endpoints.push({
            name: 'REST API V8 Metadata Endpoint',
            status: restError.response?.status || 500,
            statusText: restError.response?.statusText || 'Error',
            error: restError.message
          });
        }
      } catch (tokenError: any) {
        endpoints.push({
          name: 'Token Endpoint',
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

      const response = await this.makeRequest('/legacy/Api/V8/module', {
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

      const response = await this.makeRequest('/legacy/Api/V8/module', {
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

  // Create a lead in SuiteCRM (for contact form submissions)
  async createLead(leadData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    message?: string;
    company?: string;
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Create lead using API V8 based on the test script format
      const data = {
        data: {
          type: "Leads",
          attributes: {
            first_name: leadData.firstName,
            last_name: leadData.lastName,
            email1: leadData.email,
            phone_work: leadData.phone || '',
            description: leadData.message || '',
            account_name: leadData.company || 'Website Lead',
            lead_source: 'Web Site',
            status: 'New'
          }
        }
      };

      console.log('[SuiteCRM] Creating lead:', leadData.firstName, leadData.lastName);

      const response = await this.makeRequest('/legacy/Api/V8/module', {
        method: 'POST',
        data: data
      });

      if (response.data?.id) {
        return {
          success: true,
          id: response.data.id
        };
      } else {
        throw new Error('Failed to create lead: Invalid response from SuiteCRM');
      }
    } catch (error: any) {
      console.error('[SuiteCRM] Failed to create lead:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get modules from SuiteCRM
  async getModules(): Promise<any> {
    try {
      return await this.makeRequest('/legacy/Api/V8/meta/modules');
    } catch (error) {
      console.error('[SuiteCRM] Failed to get modules:', error);
      throw error;
    }
  }

  // Get module fields
  async getModuleFields(moduleName: string): Promise<any> {
    try {
      return await this.makeRequest(`/legacy/Api/V8/meta/fields/${moduleName}`);
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
      
      const endpoint = `/legacy/Api/V8/module/${moduleName}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error(`[SuiteCRM] Failed to get records for module ${moduleName}:`, error);
      throw error;
    }
  }

  // Get meetings for a specific date range
  async getMeetingsForDateRange(startDate: string, endDate: string): Promise<any[]> {
    try {
      console.log(`[SuiteCRM] Fetching meetings between ${startDate} and ${endDate}`);
      
      // Build filter parameters based on SuiteCRM API documentation
      // Using the filter format: filter[operator]=and&filter[date_start][gte]=startDate&filter[date_start][lte]=endDate
      const queryParams = new URLSearchParams();
      queryParams.append('filter[operator]', 'and');
      queryParams.append('filter[date_start][gte]', startDate);
      queryParams.append('filter[date_start][lte]', endDate);
      
      // Get meetings with the date filter
      const endpoint = `/legacy/Api/V8/module/Meetings?${queryParams.toString()}`;
      const response = await this.makeRequest(endpoint);
      
      console.log(`[SuiteCRM] Found ${response.data?.length || 0} meetings for the date range`);
      
      // If no data or empty array, return empty array
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // Transform the data to a cleaner format for the front-end
      return response.data.map((meeting: any) => ({
        id: meeting.id,
        name: meeting.attributes?.name || 'Untitled Meeting',
        dateStart: meeting.attributes?.date_start || '',
        dateEnd: meeting.attributes?.date_end || '',
        duration: {
          hours: parseInt(meeting.attributes?.duration_hours || '0', 10),
          minutes: parseInt(meeting.attributes?.duration_minutes || '0', 10)
        },
        status: meeting.attributes?.status || 'Planned',
        type: meeting.attributes?.type || '',
        description: meeting.attributes?.description || '',
        location: meeting.attributes?.location || ''
      }));
    } catch (error) {
      console.error('[SuiteCRM] Failed to get meetings for date range:', error);
      throw error;
    }
  }
}

export const suiteCRMService = new SuiteCRMService();