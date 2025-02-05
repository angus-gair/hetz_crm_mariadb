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
  private readonly timeout: number = 15000; // 15 seconds timeout
  private readonly maxRetries: number = 3;

  constructor() {
    try {
      // Get configuration from environment variables
      const baseUrl = process.env.SUITECRM_URL;
      this.username = process.env.SUITECRM_USERNAME || '';
      this.password = process.env.SUITECRM_PASSWORD || '';

      // Validate required configuration
      if (!baseUrl || !this.username || !this.password) {
        throw new Error('Missing required SuiteCRM configuration');
      }

      // Ensure baseUrl has proper protocol
      this.baseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;

      // Initialize connection
      this.initializeConnection();

    } catch (error) {
      console.error('Failed to initialize SuiteCRM service:', error);
      this.isServerAvailable = false;
    }
  }

  private async initializeConnection() {
    try {
      console.log('Initializing connection to SuiteCRM...');
      await this.validateCRMConnection();
      const response = await this.login();
      if (response) {
        console.log('Successfully connected to SuiteCRM');
        this.isServerAvailable = true;
      }
    } catch (error) {
      console.error('Failed to initialize SuiteCRM connection:', error);
      this.isServerAvailable = false;
    }
  }

  private async validateCRMConnection(): Promise<boolean> {
    try {
      const testResponse = await fetch(this.baseUrl + '/service/v4/rest.php');
      const text = await testResponse.text();

      if (text.includes('Cannot declare class LanguageManager')) {
        console.error('SuiteCRM server has LanguageManager class conflict');
        return false;
      }

      if (text.includes('Warning: stream_wrapper_register()')) {
        console.log('SuiteCRM has stream wrapper warnings - this is expected and can be ignored');
        return true;
      }

      return testResponse.ok;
    } catch (error) {
      console.error('Failed to validate CRM connection:', error);
      return false;
    }
  }

  private async login(): Promise<string | null> {
    try {
      console.log('Authenticating with SuiteCRM...');

      // Create MD5 hash of password for SuiteCRM authentication
      const passwordMd5 = crypto.createHash('md5').update(this.password).digest('hex');

      const response = await axios.post(
        `${this.baseUrl}/service/v4/rest.php`,
        {
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
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: this.timeout,
          transformResponse: [(data) => {
            if (typeof data === 'string') {
              // Remove PHP warnings while keeping the JSON response
              const jsonStart = data.indexOf('{');
              const jsonEnd = data.lastIndexOf('}') + 1;
              if (jsonStart >= 0 && jsonEnd > jsonStart) {
                const jsonPart = data.substring(jsonStart, jsonEnd);
                try {
                  return JSON.parse(jsonPart);
                } catch (e) {
                  console.error('Failed to parse JSON part:', jsonPart);
                  throw new Error('Invalid JSON response');
                }
              }
              throw new Error('No valid JSON found in response');
            }
            return data;
          }]
        }
      );

      // Log response for debugging
      console.log('SuiteCRM login response:', {
        status: response.status,
        data: response.data
      });

      if (!response.data?.id) {
        throw new Error('Invalid login response from SuiteCRM');
      }

      this.sessionId = response.data.id;
      return response.data.id;

    } catch (error) {
      console.error('SuiteCRM login failed:', error);
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
              // Remove PHP warnings while keeping the JSON response
              const jsonStart = data.indexOf('{');
              const jsonEnd = data.lastIndexOf('}') + 1;
              if (jsonStart >= 0 && jsonEnd > jsonStart) {
                const jsonPart = data.substring(jsonStart, jsonEnd);
                try {
                  return JSON.parse(jsonPart);
                } catch (e) {
                  console.error('Failed to parse JSON part:', jsonPart);
                  throw new Error('Invalid JSON response');
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
      this.isServerAvailable = false;
      return [];
    }
  }

  async createContact(contactData: ContactData): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isServerAvailable) {
        await this.initializeConnection();
      }

      console.log('Creating contact in SuiteCRM:', contactData.email);

      const [firstName, ...lastNameParts] = contactData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '-';

      // Create contact record
      const contact = await this.makeRequest('set_entry', {
        module_name: 'Contacts',
        name_value_list: {
          first_name: firstName,
          last_name: lastName,
          email1: contactData.email,
          phone_mobile: contactData.phone,
          description: contactData.notes || '',
          lead_source: 'Web Site'
        }
      });

      if (!contact?.id) {
        throw new Error('Failed to create contact record');
      }

      // If date/time provided, create meeting
      if (contactData.preferredDate) {
        await this.createMeeting(contact.id, contactData);
      }

      return {
        success: true,
        message: 'Your consultation request has been received and a meeting has been scheduled. We will contact you shortly to confirm the details.'
      };

    } catch (error) {
      console.error('Failed to create contact in SuiteCRM:', error);
      return {
        success: false,
        message: 'We are experiencing technical difficulties. Please try again later or contact us directly.'
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

    const meeting = await this.makeRequest('set_entry', {
      module_name: 'Meetings',
      name_value_list: {
        name: `Consultation - ${contactData.name}`,
        date_start: meetingDate.toISOString(),
        date_end: endDate.toISOString(),
        duration_hours: '1',
        duration_minutes: '0',
        status: 'Planned',
        description: contactData.notes || 'Website consultation request',
        location: 'To be confirmed'
      }
    });

    if (meeting?.id) {
      // Link meeting to contact
      await this.makeRequest('set_relationship', {
        module_name: 'Meetings',
        module_id: meeting.id,
        link_field_name: 'contacts',
        related_ids: [contactId]
      });
    }
  }
}

export const suiteCRMService = new SuiteCRMService();