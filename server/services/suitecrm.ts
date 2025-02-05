import axios from 'axios';
import util from 'util';
import crypto from 'crypto';

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
  private sessionId: string | null = null;
  private readonly username: string;
  private readonly password: string;

  constructor() {
    this.baseUrl = 'http://4.236.188.48';
    this.username = process.env.SUITECRM_USERNAME || '';
    this.password = process.env.SUITECRM_PASSWORD || '';
    console.log('[SuiteCRM] Service initialized with base URL:', this.baseUrl);
  }

  private async authenticate(): Promise<string | null> {
    try {
      console.log('[SuiteCRM] Authenticating using REST v4...');

      const authResult = await axios.post(
        `${this.baseUrl}/service/v4_1/rest.php`, 
        {
          method: 'login',
          input_type: 'JSON',
          response_type: 'JSON',
          rest_data: {
            user_auth: {
              user_name: this.username,
              password: this.password,
              version: '4.1'
            },
            application_name: 'CubbyLuxe-Integration',
            name_value_list: []
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: this.timeout
        }
      );

      console.log('[SuiteCRM] Auth response:', {
        status: authResult.status,
        statusText: authResult.statusText,
        hasData: !!authResult.data
      });

      if (authResult.data?.id) {
        this.sessionId = authResult.data.id;
        return this.sessionId;
      }

      console.error('[SuiteCRM] No session ID in response');
      return null;
    } catch (error) {
      console.error('[SuiteCRM] Authentication failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('[SuiteCRM] Auth error details:', {
          status: error.response?.status,
          data: error.response?.data
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

      // Authenticate first
      const sessionId = await this.authenticate();
      if (!sessionId) {
        throw new Error('Authentication failed');
      }

      const meetingData = {
        method: 'set_entry',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {
          session: sessionId,
          module_name: 'Meetings',
          name_value_list: [
            { name: 'name', value: `Consultation with ${consultationData.name}` },
            { name: 'description', value: `Contact Details:\nName: ${consultationData.name}\nEmail: ${consultationData.email}\nPhone: ${consultationData.phone}\n\nNotes:\n${consultationData.notes || ''}` },
            { name: 'status', value: 'Planned' },
            { name: 'type', value: 'Web Consultation' },
            { name: 'date_start', value: meetingDate.toISOString() },
            { name: 'date_end', value: endDate.toISOString() },
            { name: 'duration_hours', value: '1' },
            { name: 'duration_minutes', value: '0' }
          ]
        }
      };

      console.log('[SuiteCRM] Sending meeting creation request:', {
        url: `${this.baseUrl}/service/v4_1/rest.php`,
        data: {
          ...meetingData,
          rest_data: {
            ...meetingData.rest_data,
            name_value_list: meetingData.rest_data.name_value_list.map(item => 
              item.name === 'description' ? { ...item, value: '[MASKED]' } : item
            )
          }
        }
      });

      const meetingResponse = await axios.post(
        `${this.baseUrl}/service/v4_1/rest.php`,
        meetingData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: this.timeout
        }
      );

      console.log('[SuiteCRM] Meeting creation response:', {
        status: meetingResponse.status,
        statusText: meetingResponse.statusText,
        data: util.inspect(meetingResponse.data, { depth: null })
      });

      if (meetingResponse.data?.id) {
        console.log('[SuiteCRM] Successfully created meeting with ID:', meetingResponse.data.id);
        return {
          success: true,
          message: 'Thank you! Your consultation request has been received. Our team will contact you shortly to confirm the details.'
        };
      } else {
        throw new Error('Invalid response format from SuiteCRM');
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