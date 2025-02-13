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
  private lastLoginAttempt: number = 0;
  private readonly loginRetryDelay: number = 60000; // 1 minute

  constructor() {
    let url = process.env.SUITECRM_URL || 'http://172.191.25.147';
    // Remove trailing slashes and ensure proper formatting
    url = url.replace(/\/+$/, '');
    if (!url.startsWith('http')) {
      url = `http://${url}`;
    }
    this.baseUrl = url;
    console.log('[SuiteCRM] Service initialized with base URL:', this.baseUrl);
  }

  private getApiEndpoint(): string {
    return `${this.baseUrl}/service/v4_1/rest.php`;
  }

  private async login(): Promise<string> {
    try {
      const now = Date.now();
      if (this.lastLoginAttempt && (now - this.lastLoginAttempt) < this.loginRetryDelay) {
        throw new Error('Login attempted too frequently');
      }
      this.lastLoginAttempt = now;

      console.log('[SuiteCRM] Attempting to login...');

      const username = process.env.SUITECRM_USERNAME;
      const password = process.env.SUITECRM_PASSWORD;

      if (!username || !password) {
        throw new Error('SuiteCRM credentials not configured');
      }

      // Create MD5 hash of password as required by SuiteCRM
      const passwordMd5 = createHash('md5').update(password).digest('hex');

      const response = await axios.post(
        this.getApiEndpoint(),
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
            application: 'CubbyLuxe-Integration',
            name_value_list: [],
            link_name_to_fields_array: true
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: this.timeout,
          validateStatus: function (status) {
            return status < 500; // Accept any status less than 500
          }
        }
      );

      console.log('[SuiteCRM] Login response status:', response.status);

      if (response.data?.id) {
        this.sessionId = response.data.id;
        console.log('[SuiteCRM] Login successful');
        return response.data.id;
      } else {
        console.error('[SuiteCRM] Invalid login response:', response.data);
        throw new Error('Invalid login response structure');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[SuiteCRM] Login failed:', errorMessage);
      if (axios.isAxiosError(error)) {
        console.error('[SuiteCRM] Response details:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }
      throw new Error(`Failed to authenticate with SuiteCRM: ${errorMessage}`);
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

      // REST v4 API payload with link_name_to_fields_array set to true
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
        ],
        link_name_to_fields_array: true,
        version: '4.1'
      };

      console.log('[SuiteCRM] Sending meeting creation request');

      const response = await axios.post(
        this.getApiEndpoint(),
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
          timeout: this.timeout,
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );

      console.log('[SuiteCRM] Meeting creation response:', {
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
          console.log('[SuiteCRM] Session expired, attempting to re-login');
          this.sessionId = null;
          await this.login();
          return this.createConsultationMeeting(consultationData);
        } catch (retryError) {
          console.error('[SuiteCRM] Retry failed:', retryError instanceof Error ? retryError.message : String(retryError));
        }
      }

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
}

export const suiteCRMService = new SuiteCRMService();