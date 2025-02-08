import axios from 'axios';
import { createHash } from 'crypto';

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
  private readonly timeout: number = 30000;
  private sessionId: string | null = null;

  constructor() {
    const url = process.env.SUITECRM_URL || 'http://172.191.25.147';
    this.baseUrl = url.startsWith('http') ? url : `http://${url}`;
    console.log('[SuiteCRM] Service initialized with base URL:', this.baseUrl);
  }

  private async login(): Promise<string> {
    try {
      console.log('[SuiteCRM] Attempting to login...');

      const username = process.env.SUITECRM_USERNAME;
      const password = process.env.SUITECRM_PASSWORD;

      if (!username || !password) {
        throw new Error('SuiteCRM credentials not configured');
      }

      // Create MD5 hash of password as required by SuiteCRM
      const passwordMd5 = createHash('md5').update(password).digest('hex');

      const response = await axios.post(
        `${this.baseUrl}/service/v4_1/rest.php`,
        {
          method: 'login',
          input_type: 'JSON',
          response_type: 'JSON',
          rest_data: {
            user_auth: {
              user_name: username,
              password: passwordMd5,
              version: '4.1'
            },
            application: 'CubbyLuxe-Integration'
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

      if (response.data?.id) {
        this.sessionId = response.data.id;
        console.log('[SuiteCRM] Login successful');
        return response.data.id; 
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('[SuiteCRM] Login failed:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to authenticate with SuiteCRM');
    }
  }

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

      // Format dates for SuiteCRM (YYYY-MM-DD HH:mm:ss)
      const formatDate = (date: Date) => {
        return date.toISOString().replace('T', ' ').split('.')[0];
      };

      // Ensure we have a valid session
      if (!this.sessionId) {
        await this.login();
      }

      // REST v4 API payload
      const restData = {
        session: this.sessionId,
        module_name: 'Meetings',
        name_value_list: [
          { name: 'name', value: `Consultation with ${consultationData.name}` },
          { name: 'date_start', value: formatDate(meetingDate) },
          { name: 'date_end', value: formatDate(endDate) },
          { name: 'status', value: 'Planned' },
          { name: 'description', value: `Contact Info:\nEmail: ${consultationData.email}\nPhone: ${consultationData.phone}\n\nNotes: ${consultationData.notes || 'No additional notes'}` },
          { name: 'type', value: 'Consultation' }
        ]
      };

      console.log('[SuiteCRM] Sending REST v4 request for meeting creation:', {
        url: `${this.baseUrl}/service/v4_1/rest.php`,
        method: 'set_entry',
        data: { ...restData, session: '***' }
      });

      const response = await axios.post(
        `${this.baseUrl}/service/v4_1/rest.php`,
        {
          method: 'set_entry',
          input_type: 'JSON',
          response_type: 'JSON',
          rest_data: restData
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: this.timeout
        }
      );

      console.log('[SuiteCRM] REST v4 response:', {
        status: response.status,
        data: response.data
      });

      if (response.status === 200 && response.data?.id) {
        return {
          success: true,
          message: 'Thank you! Your consultation request has been received. Our team will contact you shortly to confirm the details.'
        };
      } else {
        throw new Error('Failed to create meeting: Invalid response from SuiteCRM');
      }

    } catch (error) {
      // If the error is due to an invalid session, try to login again and retry once
      if (error instanceof Error && error.message.includes('Invalid Session ID')) {
        try {
          this.sessionId = null;
          await this.login();
          return this.createConsultationMeeting(consultationData);
        } catch (retryError) {
          console.error('[SuiteCRM] Retry failed:', retryError instanceof Error ? retryError.message : String(retryError));
        }
      }

      console.error('[SuiteCRM] Failed to create consultation meeting:', error instanceof Error ? error.message : String(error));
      return {
        success: false,
        message: 'We encountered an issue scheduling your consultation. Please try again later or contact us directly.'
      };
    }
  }
}

export const suiteCRMService = new SuiteCRMService();