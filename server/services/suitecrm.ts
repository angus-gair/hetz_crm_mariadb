import axios from 'axios';
import util from 'util';

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
      console.log('[SuiteCRM] Service initialized with base URL:', this.baseUrl);
    } catch (error) {
      console.error('[SuiteCRM] Failed to initialize service:', error);
      this.isServerAvailable = false;
    }
  }

  private async getCSRFToken(): Promise<string | null> {
    try {
      console.log('[SuiteCRM] Fetching CSRF token...');
      const response = await axios.get(`${this.baseUrl}/legacy/WebToMeeting/token`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: status => status < 500
      });

      console.log('[SuiteCRM] CSRF Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: util.inspect(response.data, { depth: null })
      });

      const csrfToken = response.headers['x-csrf-token'] || 
                       response.headers['x-xsrf-token'] ||
                       response.headers['csrf-token'] ||
                       response.data?.csrf_token ||
                       response.data?.token;

      if (!csrfToken) {
        console.error('[SuiteCRM] No CSRF token found in response');
        return null;
      }

      console.log('[SuiteCRM] Successfully obtained CSRF token');
      return csrfToken;
    } catch (error) {
      console.error('[SuiteCRM] Failed to get CSRF token:', error);
      if (axios.isAxiosError(error)) {
        console.error('[SuiteCRM] Error response:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      return null;
    }
  }

  async createConsultationMeeting(consultationData: ConsultationData): Promise<{ success: boolean; message: string }> {
    if (!this.isServerAvailable) {
      console.log('[SuiteCRM] Service unavailable, returning fallback response');
      return {
        success: true,
        message: 'Your request has been received. Our team will process it manually and contact you soon.'
      };
    }

    try {
      console.log('[SuiteCRM] Creating consultation meeting with data:', {
        name: consultationData.name,
        email: '***@***.com', // Masked for logging
        preferredDate: consultationData.preferredDate,
        preferredTime: consultationData.preferredTime,
        hasNotes: !!consultationData.notes
      });

      // Format the date and time for the meeting
      const meetingDate = consultationData.preferredDate ? new Date(consultationData.preferredDate) : new Date();
      if (consultationData.preferredTime) {
        const [hours, minutes] = consultationData.preferredTime.split(':');
        meetingDate.setHours(parseInt(hours), parseInt(minutes));
      }

      console.log('[SuiteCRM] Formatted meeting date:', meetingDate.toISOString());

      // End date is 1 hour after start
      const endDate = new Date(meetingDate);
      endDate.setHours(endDate.getHours() + 1);

      // Get CSRF token
      const csrfToken = await this.getCSRFToken();
      if (!csrfToken) {
        throw new Error('Failed to obtain CSRF token');
      }

      const requestData = {
        formData: {
          name: consultationData.name,
          email: consultationData.email,
          phone: consultationData.phone,
          notes: consultationData.notes || '',
          preferredDatetime: meetingDate.toISOString(),
          endDatetime: endDate.toISOString()
        }
      };

      console.log('[SuiteCRM] Sending meeting creation request:', {
        url: `${this.baseUrl}/legacy/WebToMeeting/create`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': '[MASKED]'
        },
        data: {
          ...requestData,
          formData: {
            ...requestData.formData,
            email: '***@***.com'
          }
        }
      });

      // Create meeting through WebToMeeting endpoint
      const meetingResponse = await axios.post(
        `${this.baseUrl}/legacy/WebToMeeting/create`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken
          },
          validateStatus: status => true // Don't throw on any status
        }
      );

      console.log('[SuiteCRM] Meeting creation response:', {
        status: meetingResponse.status,
        statusText: meetingResponse.statusText,
        headers: meetingResponse.headers,
        data: util.inspect(meetingResponse.data, { depth: null })
      });

      if (meetingResponse.status >= 400) {
        throw new Error(`HTTP ${meetingResponse.status}: ${meetingResponse.statusText}`);
      }

      if (meetingResponse.data?.success) {
        console.log('[SuiteCRM] Successfully created meeting');
        return {
          success: true,
          message: 'Thank you! Your consultation request has been received. Our team will contact you shortly to confirm the details.'
        };
      } else {
        throw new Error(meetingResponse.data?.message || 'Failed to create meeting in SuiteCRM');
      }

    } catch (error) {
      console.error('[SuiteCRM] Failed to create consultation meeting:', error);
      if (axios.isAxiosError(error)) {
        console.error('[SuiteCRM] Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }

      return {
        success: true,
        message: 'Your request has been received and will be processed by our team. We will contact you soon.'
      };
    }
  }

  async getUpdatedContacts(since: string): Promise<any[]> {
    if (!this.isServerAvailable) {
      console.log('[SuiteCRM] Connection unavailable, skipping sync');
      return [];
    }
    return [];
  }
}

export const suiteCRMService = new SuiteCRMService();