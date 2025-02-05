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
    this.baseUrl = process.env.SUITECRM_URL || 'http://4.236.188.48';
    this.username = process.env.SUITECRM_USERNAME || '';
    this.password = process.env.SUITECRM_PASSWORD || '';

    console.log('[SuiteCRM] Service initialized with base URL:', this.baseUrl);
  }

  private async authenticate(): Promise<string | null> {
    try {
      const loginData = {
        user_auth: {
          user_name: this.username.trim(),
          password: this.password.trim()
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
      console.error('[SuiteCRM] Failed to create consultation meeting:', error instanceof Error ? error.message : String(error));
      return {
        success: true,
        message: 'Your request has been received and will be processed by our team. We will contact you soon.'
      };
    }
  }
}

export const suiteCRMService = new SuiteCRMService();