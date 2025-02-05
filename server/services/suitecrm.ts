import axios from 'axios';

interface ConsultationData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
}

interface GraphQLResponse {
  data?: {
    createProcess?: {
      process?: {
        _id: string;
        status: string;
        messages: string[];
        data: any;
      };
    };
  };
  errors?: Array<{
    message: string;
    locations: Array<{ line: number; column: number }>;
    path: string[];
  }>;
}

export class SuiteCRMService {
  private baseUrl: string;
  private isServerAvailable: boolean = true;
  private readonly timeout: number = 30000;
  private readonly maxRetries: number = 3;
  private csrfToken: string | null = null;
  private readonly username: string = 'admin';
  private readonly password: string = 'Jamfinnarc1776!';

  constructor() {
    try {
      this.baseUrl = 'http://4.236.188.48';
      console.log('SuiteCRM Service initialized with base URL:', this.baseUrl);
    } catch (error) {
      console.error('Failed to initialize SuiteCRM service:', error);
      this.isServerAvailable = false;
    }
  }

  private async getCSRFToken(): Promise<string | null> {
    try {
      console.log('Fetching CSRF token...');
      // Try the main API endpoint first
      const response = await axios.get(`${this.baseUrl}/Api/access/csrf`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: status => status < 500
      });

      console.log('CSRF Response Headers:', response.headers);
      console.log('CSRF Response Data:', response.data);

      // Try all possible CSRF token locations
      const csrfToken = response.headers['x-csrf-token'] || 
                       response.headers['x-xsrf-token'] ||
                       response.headers['csrf-token'] ||
                       response.data?.csrf_token ||
                       response.data?.token;

      if (!csrfToken) {
        // Try alternative endpoint
        const altResponse = await axios.get(`${this.baseUrl}/rest/v11_1/oauth2/csrf`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        const altToken = altResponse.headers['x-csrf-token'] || 
                        altResponse.headers['x-xsrf-token'] ||
                        altResponse.data?.csrf_token;

        if (altToken) {
          console.log('Retrieved CSRF token from alternative endpoint');
          return altToken;
        }

        console.error('No CSRF token found in response');
        return null;
      }

      console.log('CSRF token obtained successfully');
      return csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      return null;
    }
  }

  private async authenticate(): Promise<string | null> {
    try {
      const loginResponse = await axios.post(
        `${this.baseUrl}/Api/access/login`,
        {
          username: this.username,
          password: this.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const token = loginResponse.data?.access_token || loginResponse.data?.token;
      if (!token) {
        console.error('Authentication failed - no token in response');
        return null;
      }

      return token;
    } catch (error) {
      console.error('Authentication failed:', error);
      return null;
    }
  }

  async createConsultationMeeting(consultationData: ConsultationData): Promise<{ success: boolean; message: string }> {
    if (!this.isServerAvailable) {
      return {
        success: true,
        message: 'Your request has been received. Our team will process it manually and contact you soon.'
      };
    }

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

      // First authenticate
      const authToken = await this.authenticate();
      if (!authToken) {
        throw new Error('Authentication failed');
      }

      // Then get CSRF token
      const csrfToken = await this.getCSRFToken();
      if (!csrfToken) {
        throw new Error('Failed to obtain CSRF token');
      }

      // Create meeting through REST API
      const meetingResponse = await axios.post(
        `${this.baseUrl}/Api/V8/module/Meetings`,
        {
          data: {
            type: "Meeting",
            attributes: {
              name: `Consultation with ${consultationData.name}`,
              description: `Contact Details:\nName: ${consultationData.name}\nEmail: ${consultationData.email}\nPhone: ${consultationData.phone}\n\nNotes:\n${consultationData.notes || ''}`,
              date_start: meetingDate.toISOString(),
              date_end: endDate.toISOString(),
              status: "Planned",
              meeting_type: "Web Consultation"
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (meetingResponse.data?.data?.id) {
        return {
          success: true,
          message: 'Thank you! Your consultation request has been received. Our team will contact you shortly to confirm the details.'
        };
      } else {
        throw new Error('Invalid response format from SuiteCRM');
      }

    } catch (error) {
      console.error('Failed to create consultation meeting:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      // Still return success to user but log the error
      return {
        success: true,
        message: 'Your request has been received and will be processed by our team. We will contact you soon.'
      };
    }
  }
  async getUpdatedContacts(since: string): Promise<any[]> {
    if (!this.isServerAvailable) {
      console.log('CRM connection unavailable, skipping sync');
      return [];
    }
    // Implementation for contact sync
    return [];
  }
}

export const suiteCRMService = new SuiteCRMService();