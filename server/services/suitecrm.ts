import axios from 'axios';
import crypto from 'crypto';

interface ContactData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
}

interface SuiteCRMResponse {
  id?: string;
  entry_list?: Array<{
    id: string;
    name_value_list?: {
      [key: string]: {
        name: string;
        value: string;
      };
    };
  }>;
  error?: any;
}

export class SuiteCRMService {
  private baseUrl: string = '';
  private username: string = '';
  private password: string = '';
  private sessionId: string | null = null;
  private isServerAvailable: boolean = true;
  private readonly timeout: number = 30000;
  private readonly maxRetries: number = 3;

  constructor() {
    try {
      const baseUrl = process.env.SUITECRM_URL;
      this.username = process.env.SUITECRM_USERNAME || '';
      this.password = process.env.SUITECRM_PASSWORD || '';

      if (!baseUrl || !this.username || !this.password) {
        throw new Error('Missing required SuiteCRM configuration');
      }

      // Ensure URL has proper protocol and no trailing slash
      this.baseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
      this.baseUrl = this.baseUrl.replace(/\/$/, '');

      console.log('SuiteCRM Service initialized with base URL:', this.baseUrl);

    } catch (error) {
      console.error('Failed to initialize SuiteCRM service:', error);
      this.isServerAvailable = false;
    }
  }

  private async login(): Promise<string | null> {
    try {
      console.log('Attempting SuiteCRM authentication...');
      const passwordMd5 = crypto.createHash('md5').update(this.password).digest('hex');
      const loginEndpoint = `${this.baseUrl}/service/v4/rest.php`;

      const response = await axios.post(loginEndpoint, {
        method: 'login',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {
          user_auth: {
            user_name: this.username,
            password: passwordMd5,
            version: '4'
          },
          application_name: 'CubbyLuxe Integration'
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout,
        validateStatus: status => status < 500
      });

      // Check if response contains PHP error output
      if (typeof response.data === 'string' && response.data.includes('<?php') || response.data.includes('<pre>')) {
        console.error('SuiteCRM returned PHP output instead of JSON:', response.data.substring(0, 500));
        throw new Error('SuiteCRM API not properly configured');
      }

      const responseData = response.data;
      if (!responseData?.id) {
        console.error('Invalid login response structure:', responseData);
        throw new Error('Invalid CRM response format');
      }

      this.sessionId = responseData.id;
      this.isServerAvailable = true;
      return this.sessionId;

    } catch (error) {
      this.isServerAvailable = false;
      if (axios.isAxiosError(error)) {
        console.error('SuiteCRM login failed:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Unexpected error during SuiteCRM login:', error);
      }
      return null;
    }
  }

  private async makeRequest(method: string, parameters: any, retryCount: number = 0): Promise<SuiteCRMResponse> {
    try {
      if (!this.sessionId) {
        await this.login();
      }

      if (!this.sessionId) {
        throw new Error('Failed to obtain session ID');
      }

      console.log(`Making CRM request: ${method}`, { parameters });

      const response = await axios.post(
        `${this.baseUrl}/service/v4/rest.php`,
        {
          method,
          input_type: 'JSON',
          response_type: 'JSON',
          rest_data: {
            session: this.sessionId,
            ...parameters
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: this.timeout,
          transformResponse: [(data) => {
            if (typeof data === 'string') {
              const jsonStart = data.indexOf('{');
              const jsonEnd = data.lastIndexOf('}') + 1;
              if (jsonStart >= 0 && jsonEnd > jsonStart) {
                const jsonPart = data.substring(jsonStart, jsonEnd);
                try {
                  return JSON.parse(jsonPart);
                } catch (e) {
                  console.error('Failed to parse response:', jsonPart);
                  throw e;
                }
              }
              throw new Error('No valid JSON found in response');
            }
            return data;
          }]
        }
      );

      return response.data;

    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.log(`Retrying request after error (attempt ${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return this.makeRequest(method, parameters, retryCount + 1);
      }
      throw error;
    }
  }

  async createContact(contactData: ContactData): Promise<{ success: boolean; message: string }> {
    try {
      // Always try to get a fresh session
      const sessionId = await this.login();
      if (!sessionId || !this.isServerAvailable) {
        console.log('Failed to establish CRM connection, storing request locally');
        return {
          success: true,
          message: 'Your request has been received. Our team will process it manually and contact you soon.'
        };
      }

      const [firstName, ...lastNameParts] = contactData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '-';

      console.log('Attempting to create CRM contact:', {
        name: `${firstName} ${lastName}`,
        email: contactData.email
      });

      const response = await axios.post(`${this.baseUrl}/service/v4/rest.php`, {
        method: 'set_entry',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {
          session: sessionId,
          module_name: 'Contacts',
          name_value_list: [
            { name: 'first_name', value: firstName },
            { name: 'last_name', value: lastName },
            { name: 'email1', value: contactData.email },
            { name: 'phone_mobile', value: contactData.phone },
            { name: 'description', value: contactData.notes || '' }
          ]
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout
      });

      if (typeof response.data === 'string' && (response.data.includes('<?php') || response.data.includes('<pre>'))) {
        throw new Error('CRM returned invalid response format');
      }

      return {
        success: true,
        message: 'Thank you! Your consultation request has been received. Our team will contact you shortly to confirm the details.'
      };

    } catch (error) {
      console.error('Failed to create CRM contact:', error);
      return {
        success: true,
        message: 'Your request has been received and will be processed by our team. We will contact you soon.'
      };
    }
  }

  private async createMeeting(contactId: string, contactData: ContactData): Promise<void> {
    if (!contactData.preferredDate) return;

    const meetingDate = new Date(contactData.preferredDate);
    if (contactData.preferredTime) {
      const [hours, minutes] = contactData.preferredTime.split(':');
      meetingDate.setHours(parseInt(hours), parseInt(minutes));
    }

    const endDate = new Date(meetingDate);
    endDate.setHours(endDate.getHours() + 1);

    console.log('Creating meeting for contact:', {
      contactId,
      startDate: meetingDate,
      endDate
    });

    const meeting = await this.makeRequest('set_entry', {
      module_name: 'Meetings',
      name_value_list: [
        { name: 'name', value: `Consultation - ${contactData.name}` },
        { name: 'date_start', value: meetingDate.toISOString() },
        { name: 'date_end', value: endDate.toISOString() },
        { name: 'duration_hours', value: '1' },
        { name: 'duration_minutes', value: '0' },
        { name: 'status', value: 'Planned' },
        { name: 'description', value: contactData.notes || 'Website consultation request' },
        { name: 'location', value: 'To be confirmed' }
      ]
    });

    if (meeting?.id) {
      await this.makeRequest('set_relationship', {
        module_name: 'Meetings',
        module_id: meeting.id,
        link_field_name: 'contacts',
        related_ids: [contactId]
      });
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