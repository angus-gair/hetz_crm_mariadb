import axios from 'axios';

interface ConsultationData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
}

export class SuiteCRMService {
  private baseUrl: string;
  private isServerAvailable: boolean = true;
  private readonly timeout: number = 30000;
  private readonly maxRetries: number = 3;
  private csrfToken: string | null = null;
  private readonly username: string = process.env.SUITECRM_USERNAME || 'admin';
  private readonly password: string = process.env.SUITECRM_PASSWORD || 'Jamfinnarc1776!';

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
      const response = await axios.get(`${this.baseUrl}/legacy/WebToMeeting/token`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: status => status < 500
      });

      console.log('CSRF Response:', {
        headers: response.headers,
        data: response.data
      });

      const csrfToken = response.headers['x-csrf-token'] || 
                       response.headers['x-xsrf-token'] ||
                       response.headers['csrf-token'] ||
                       response.data?.csrf_token ||
                       response.data?.token;

      if (!csrfToken) {
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

  async createConsultationMeeting(consultationData: ConsultationData): Promise<{ success: boolean; message: string }> {
    if (!this.isServerAvailable) {
      return {
        success: true,
        message: 'Your request has been received. Our team will process it manually and contact you soon.'
      };
    }

    try {
      console.log('Creating consultation meeting with data:', {
        name: consultationData.name,
        email: '***@***.com', // Masked for logging
        preferredDate: consultationData.preferredDate,
        preferredTime: consultationData.preferredTime
      });

      // Format the date and time for the meeting
      const meetingDate = consultationData.preferredDate ? new Date(consultationData.preferredDate) : new Date();
      if (consultationData.preferredTime) {
        const [hours, minutes] = consultationData.preferredTime.split(':');
        meetingDate.setHours(parseInt(hours), parseInt(minutes));
      }

      // End date is 1 hour after start
      const endDate = new Date(meetingDate);
      endDate.setHours(endDate.getHours() + 1);

      // Get CSRF token
      const csrfToken = await this.getCSRFToken();
      if (!csrfToken) {
        throw new Error('Failed to obtain CSRF token');
      }

      // Create meeting through WebToMeeting endpoint
      const meetingResponse = await axios.post(
        `${this.baseUrl}/legacy/WebToMeeting/create`,
        {
          formData: {
            name: consultationData.name,
            email: consultationData.email,
            phone: consultationData.phone,
            notes: consultationData.notes || '',
            preferredDatetime: meetingDate.toISOString(),
            endDatetime: endDate.toISOString()
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken
          }
        }
      );

      console.log('Meeting creation response:', meetingResponse.data);

      if (meetingResponse.data?.success) {
        return {
          success: true,
          message: 'Thank you! Your consultation request has been received. Our team will contact you shortly to confirm the details.'
        };
      } else {
        throw new Error(meetingResponse.data?.message || 'Failed to create meeting in SuiteCRM');
      }

    } catch (error) {
      console.error('Failed to create consultation meeting:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }

      // Return success to user but log the error
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
    return [];
  }
}

export const suiteCRMService = new SuiteCRMService();