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

      // Ensure URL has proper protocol
      this.baseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
      // Remove trailing slash if present
      this.baseUrl = this.baseUrl.replace(/\/$/, '');

      console.log('Initializing SuiteCRM with base URL:', this.baseUrl);

    } catch (error) {
      console.error('Failed to initialize SuiteCRM service:', error);
      this.isServerAvailable = false;
    }
  }

  private async login(): Promise<string | null> {
    try {
      console.log('Authenticating with SuiteCRM...');

      const passwordMd5 = crypto.createHash('md5').update(this.password).digest('hex');
      const loginEndpoint = `${this.baseUrl}/service/v4/rest.php`;

      console.log('Attempting login to:', loginEndpoint);

      const requestData = {
        method: 'login',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {
          user_auth: {
            user_name: this.username,
            password: passwordMd5,
            version: '4'
          },
          application_name: 'CubbyLuxe Integration',
          name_value_list: []
        }
      };

      const response = await axios.post(loginEndpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout,
        maxRedirects: 5
      });

      let responseData = response.data;
      console.log('Raw response:', typeof responseData === 'string' ? responseData.substring(0, 500) : responseData);

      if (typeof responseData === 'string') {
        // Try to extract JSON from HTML response
        const jsonMatch = responseData.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            responseData = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('Failed to parse JSON from response:', {
              error: e,
              responsePreview: responseData.substring(0, 500)
            });
            return null;
          }
        }
      }

      if (!responseData?.id) {
        console.error('Invalid login response structure:', responseData);
        return null;
      }

      this.sessionId = responseData.id;
      this.isServerAvailable = true;
      console.log('Successfully obtained session ID:', this.sessionId);
      return this.sessionId;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('SuiteCRM login failed:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          url: error.config?.url
        });
      } else {
        console.error('Unexpected error during SuiteCRM login:', error);
      }
      this.isServerAvailable = false;
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
      if (!this.sessionId) {
        await this.login();
      }

      if (!this.sessionId) {
        return {
          success: false,
          message: 'Unable to connect to CRM system. Your request has been logged and will be processed manually.'
        };
      }

      console.log('Creating contact in SuiteCRM:', {
        name: contactData.name,
        email: contactData.email
      });

      const [firstName, ...lastNameParts] = contactData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '-';

      const endpoint = `${this.baseUrl}/service/v4/rest.php`;
      const requestData = {
        method: 'set_entry',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {
          session: this.sessionId,
          module_name: 'Contacts',
          name_value_list: [
            { name: 'first_name', value: firstName },
            { name: 'last_name', value: lastName },
            { name: 'email1', value: contactData.email },
            { name: 'phone_mobile', value: contactData.phone },
            { name: 'description', value: contactData.notes || '' },
            { name: 'lead_source', value: 'Web Site' }
          ]
        }
      };

      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout
      });

      console.log('Contact creation response:', response.data);

      if (!response.data?.id) {
        return {
          success: false,
          message: 'Your request has been received and will be processed manually by our team.'
        };
      }

      return {
        success: true,
        message: 'Your consultation request has been received. Our team will contact you shortly to confirm the details.'
      };

    } catch (error) {
      console.error('Failed to create contact in SuiteCRM:', error);
      return {
        success: false,
        message: 'We are experiencing technical difficulties. Your request has been noted and will be processed manually by our team.'
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
      console.log('SuiteCRM is not available, skipping sync');
      return [];
    }

    try {
      console.log('Fetching updated contacts since:', since);
      const response = await this.makeRequest('get_entry_list', {
        module_name: 'Contacts',
        query: `contacts.date_modified > '${since}'`,
        order_by: 'date_modified ASC',
        select_fields: ['id', 'first_name', 'last_name', 'email1', 'phone_mobile', 'description']
      });

      if (!response.entry_list) {
        console.log('No updated contacts found');
        return [];
      }

      return response.entry_list.map((entry: any) => {
        const values = entry.name_value_list;
        return {
          id: entry.id,
          name: `${values.first_name?.value || ''} ${values.last_name?.value || ''}`.trim(),
          email: values.email1?.value || '',
          phone: values.phone_mobile?.value || '',
          notes: values.description?.value || ''
        };
      });
    } catch (error) {
      console.error('Failed to fetch updated contacts:', error);
      return [];
    }
  }
}

export const suiteCRMService = new SuiteCRMService();