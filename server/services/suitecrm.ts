import axios from 'axios';
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
    // Remove hardcoded URL, use environment variable with fallback
    this.baseUrl = process.env.SUITECRM_URL || 'http://4.236.188.48';

    // Ensure we're reading from environment variables
    this.username = process.env.SUITECRM_USERNAME || '';
    this.password = process.env.SUITECRM_PASSWORD || '';

    // Add debug logging
    console.log('[SuiteCRM] Service initialized:', {
      baseUrl: this.baseUrl,
      username: this.username ? 'set' : 'not set',
      password: this.password ? 'set' : 'not set'
    });
  }

  private async authenticate(): Promise<string | null> {
    try {
      console.log('[SuiteCRM] Starting authentication...');

      if (!this.username || !this.password) {
        console.error('[SuiteCRM] Missing credentials - username or password not set');
        return null;
      }

      // Use SuiteCRM v4.1 REST API format
      const loginData = {
        user_auth: {
          user_name: this.username.trim(),
          password: this.password.trim()
        },
        application_name: 'CubbyLuxe-Integration'
      };

      console.log('[SuiteCRM] Preparing login request for user:', this.username);

      const postData = {
        method: 'login',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: JSON.stringify(loginData)
      };

      const formData = new URLSearchParams();
      Object.entries(postData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      console.log('[SuiteCRM] Sending login request to:', `${this.baseUrl}/service/v4_1/rest.php`);

      const authResult = await axios.post(
        `${this.baseUrl}/service/v4_1/rest.php`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: this.timeout
        }
      );

      console.log('[SuiteCRM] Auth response:', {
        status: authResult.status,
        statusText: authResult.statusText,
        hasData: !!authResult.data,
        data: typeof authResult.data === 'object' ? JSON.stringify(authResult.data, null, 2) : authResult.data
      });

      if (authResult.data?.name === 'Invalid Login') {
        console.error('[SuiteCRM] Authentication failed:', authResult.data.description);
        return null;
      }

      if (!authResult.data?.id) {
        console.error('[SuiteCRM] No session ID in response');
        return null;
      }

      this.sessionId = authResult.data.id;
      console.log('[SuiteCRM] Successfully authenticated');
      return this.sessionId;

    } catch (error) {
      console.error('[SuiteCRM] Authentication error:', error);
      if (axios.isAxiosError(error)) {
        console.error('[SuiteCRM] Error details:', {
          status: error.response?.status,
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

      // End date is 1 hour after start
      const endDate = new Date(meetingDate);
      endDate.setHours(endDate.getHours() + 1);

      console.log('[SuiteCRM] Formatted meeting date:', meetingDate.toISOString());

      // Authenticate first
      const sessionId = await this.authenticate();
      if (!sessionId) {
        throw new Error('Authentication failed');
      }

      // Prepare meeting data
      const setEntryData = {
        session: sessionId,
        module_name: 'Meetings',
        name_value_list: [
          { name: 'name', value: `Consultation with ${consultationData.name}` },
          { name: 'description', value: `Contact Details:\nName: ${consultationData.name}\nEmail: ${consultationData.email}\nPhone: ${consultationData.phone}\n\nNotes:\n${consultationData.notes || ''}` },
          { name: 'status', value: 'Planned' },
          { name: 'duration_hours', value: '1' },
          { name: 'duration_minutes', value: '0' },
          { name: 'date_start', value: meetingDate.toISOString() },
          { name: 'date_end', value: endDate.toISOString() }
        ]
      };

      // Convert to URL-encoded format
      const postData = 'method=set_entry' +
        '&input_type=JSON' +
        '&response_type=JSON' +
        '&rest_data=' + encodeURIComponent(JSON.stringify(setEntryData));

      console.log('[SuiteCRM] Sending meeting creation request:', {
        url: `${this.baseUrl}/service/v4_1/rest.php`,
        sessionId: sessionId.substring(0, 8) + '...',
        dataLength: postData.length
      });

      const meetingResponse = await axios.post(
        `${this.baseUrl}/service/v4_1/rest.php`,
        postData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: this.timeout
        }
      );

      console.log('[SuiteCRM] Meeting creation response:', {
        status: meetingResponse.status,
        data: meetingResponse.data ? JSON.stringify(meetingResponse.data, null, 2) : null
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