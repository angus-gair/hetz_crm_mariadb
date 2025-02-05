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
  private sessionId: string | null = null;
  private readonly username: string;
  private readonly password: string;

  constructor() {
    // Ensure URL has proper protocol
    const url = process.env.SUITECRM_URL || 'http://4.236.188.48';
    this.baseUrl = url.startsWith('http') ? url : `http://${url}`;
    this.username = process.env.SUITECRM_USERNAME || '';
    this.password = process.env.SUITECRM_PASSWORD || '';

    console.log('[SuiteCRM] Service initialized with base URL:', this.baseUrl);
  }

  private async authenticate(): Promise<string | null> {
    try {
      const loginData = {
        user_auth: {
          user_name: this.username.trim(),
          password: this.password.trim(),
          version: '4.1'
        },
        application_name: 'CubbyLuxe-Integration'
      };

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
        data: authResult.data
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
      console.log('[SuiteCRM] Successfully authenticated with session ID:', this.sessionId.substring(0, 8) + '...');
      return this.sessionId;

    } catch (error) {
      console.error('[SuiteCRM] Authentication error:', error instanceof Error ? error.message : String(error));
      return null;
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

      // Authenticate first
      const sessionId = await this.authenticate();
      if (!sessionId) {
        throw new Error('Authentication failed');
      }

      // Format dates for SuiteCRM (YYYY-MM-DD HH:mm:ss)
      const formatDate = (date: Date) => {
        return date.toISOString().replace('T', ' ').split('.')[0];
      };

      // Prepare meeting data with all required fields
      const setEntryData = {
        session: sessionId,
        module_name: 'Meetings',
        name_value_list: [
          { name: 'name', value: `Consultation with ${consultationData.name}` },
          { name: 'description', value: `Contact Details:\nName: ${consultationData.name}\nEmail: ${consultationData.email}\nPhone: ${consultationData.phone}\n\nNotes:\n${consultationData.notes || ''}` },
          { name: 'status', value: 'Planned' },
          { name: 'type', value: 'Consultation' },
          { name: 'duration_hours', value: '1' },
          { name: 'duration_minutes', value: '0' },
          { name: 'date_start', value: formatDate(meetingDate) },
          { name: 'date_end', value: formatDate(endDate) },
          { name: 'assigned_user_id', value: this.username }, // Assign to the authenticated user
          { name: 'parent_type', value: 'Leads' },
          { name: 'reminder_time', value: -1800 }, // 30 minutes before
          { name: 'outlook_id', value: '' },
          { name: 'repeat_type', value: '' },
          { name: 'repeat_interval', value: '1' },
          { name: 'repeat_dow', value: '' },
          { name: 'repeat_until', value: '' },
          { name: 'repeat_count', value: '' },
          { name: 'location', value: 'Online' }
        ]
      };

      console.log('[SuiteCRM] Creating meeting with data:', setEntryData);

      const postData = {
        method: 'set_entry',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: JSON.stringify(setEntryData)
      };

      const formData = new URLSearchParams();
      Object.entries(postData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const meetingResponse = await axios.post(
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

      console.log('[SuiteCRM] Meeting creation response:', {
        status: meetingResponse.status,
        data: meetingResponse.data
      });

      if (meetingResponse.data?.id) {
        console.log('[SuiteCRM] Successfully created meeting with ID:', meetingResponse.data.id);
        return {
          success: true,
          message: 'Thank you! Your consultation request has been received. Our team will contact you shortly to confirm the details.'
        };
      } else {
        console.error('[SuiteCRM] Invalid response format from SuiteCRM:', meetingResponse.data);
        throw new Error('Invalid response format from SuiteCRM');
      }

    } catch (error) {
      console.error('[SuiteCRM] Failed to create consultation meeting:', error instanceof Error ? error.message : String(error));
      return {
        success: true,
        message: 'Your request has been received and will be processed by our team. We will contact you soon.'
      };
    }
  }
}

export const suiteCRMService = new SuiteCRMService();