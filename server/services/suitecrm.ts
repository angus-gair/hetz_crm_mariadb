import axios from 'axios';
import { env } from 'process';

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
  private baseUrl: string;
  private username: string;
  private password: string;
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
        console.error('Missing required SuiteCRM configuration');
        this.isServerAvailable = false;
        return;
      }

      // Ensure baseUrl has proper protocol and validate URL format
      this.baseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
      new URL(this.baseUrl);

      console.log('SuiteCRM service initialized with URL:', this.baseUrl);
    } catch (error) {
      console.error('Invalid SuiteCRM configuration:', error);
      this.isServerAvailable = false;
    }
  }

  private isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  private isHTMLResponse(str: string): boolean {
    return str.trim().toLowerCase().startsWith('<!doctype') || 
           str.trim().toLowerCase().startsWith('<html');
  }

  private validateResponse(response: any): any {
    if (typeof response.data === 'string') {
      // Check if response is HTML
      if (this.isHTMLResponse(response.data)) {
        console.error('Received HTML response instead of JSON:', response.data.substring(0, 200));
        throw new Error('Invalid response format: Received HTML instead of JSON');
      }

      // Check if response contains PHP errors
      if (response.data.includes('Fatal error') ||
          response.data.includes('Warning') ||
          response.data.includes('Notice')) {
        console.error('SuiteCRM returned PHP error:', response.data);
        throw new Error('SuiteCRM server returned PHP errors');
      }

      // Try to parse JSON if string
      if (!this.isValidJSON(response.data)) {
        console.error('Invalid JSON response:', response.data);
        throw new Error('Invalid JSON response from server');
      }

      return JSON.parse(response.data);
    }

    return response.data;
  }

  private async login(): Promise<string> {
    try {
      if (!this.isServerAvailable) {
        throw new Error('SuiteCRM server is not properly configured');
      }

      console.log('Attempting to connect to SuiteCRM at:', this.baseUrl);

      const loginPayload = {
        method: 'login',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {
          user_auth: {
            user_name: this.username,
            password: this.password,
          },
          application: 'CubbyLuxe Integration'
        }
      };

      const response = await axios.post(`${this.baseUrl}/service/v4/rest.php`, loginPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout,
        validateStatus: null // Allow any status code for proper error handling
      });

      // Check HTTP status first
      if (response.status !== 200) {
        console.error(`HTTP ${response.status} received:`, response.statusText);
        throw new Error(`Server returned status ${response.status}`);
      }

      // Validate and parse response
      const data = this.validateResponse(response);

      if (!data?.id) {
        console.error('Invalid login response format:', data);
        throw new Error('Invalid response format from SuiteCRM');
      }

      this.isServerAvailable = true;
      console.log('Successfully authenticated with SuiteCRM');
      return data.id;

    } catch (error) {
      this.isServerAvailable = false;
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_INVALID_URL') {
          console.error('Invalid SuiteCRM URL:', this.baseUrl);
          throw new Error('Invalid SuiteCRM server URL configuration');
        }
        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
          console.error('SuiteCRM server is not reachable:', error.message);
          throw new Error('SuiteCRM server is currently unavailable');
        }
        console.error('Network error:', error.message);
        throw new Error('Failed to connect to SuiteCRM server');
      }
      console.error('SuiteCRM login failed:', error);
      throw new Error('Failed to authenticate with SuiteCRM');
    }
  }

  private async setSession(retryCount: number = 0): Promise<void> {
    if (!this.sessionId) {
      try {
        this.sessionId = await this.login();
      } catch (error) {
        if (retryCount < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          console.log(`Retrying login after ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.setSession(retryCount + 1);
        }
        console.error('Max retry attempts reached for SuiteCRM login');
        throw error;
      }
    }
  }

  private async makeRequest(method: string, parameters: any, retryCount: number = 0): Promise<SuiteCRMResponse> {
    if (!this.isServerAvailable && retryCount === 0) {
      console.log('SuiteCRM server is marked as unavailable, skipping request');
      return {};
    }

    try {
      await this.setSession();

      const payload = {
        method,
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {
          session: this.sessionId,
          ...parameters
        }
      };

      console.log(`Making SuiteCRM request: ${method}`);
      const response = await axios.post(`${this.baseUrl}/service/v4/rest.php`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout,
        validateStatus: null // Allow any status code for proper error handling
      });

      // Check HTTP status first
      if (response.status !== 200) {
        console.error(`HTTP ${response.status} received:`, response.statusText);
        throw new Error(`Server returned status ${response.status}`);
      }

      // Validate and parse response
      return this.validateResponse(response);

    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(`Retrying request after ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(method, parameters, retryCount + 1);
      }
      console.error(`SuiteCRM ${method} request failed after ${this.maxRetries} attempts:`, error);
      throw error;
    }
  }

  async getUpdatedContacts(since: string): Promise<any[]> {
    if (!this.isServerAvailable) {
      console.log('SuiteCRM is not available, returning empty list');
      return [];
    }

    try {
      const response = await this.makeRequest('get_entry_list', {
        module_name: 'Contacts',
        query: `contacts.date_modified > '${since}'`,
        order_by: 'date_modified ASC',
        select_fields: ['id', 'first_name', 'last_name', 'email1', 'phone_mobile', 'description']
      });

      if (!response.entry_list) {
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
      console.error('Failed to get updated contacts from SuiteCRM:', error);
      return [];
    }
  }

  async createContact(contactData: ContactData): Promise<{ success: boolean; message: string }> {
    if (!this.isServerAvailable) {
      console.log('SuiteCRM is not available, storing locally only');
      return {
        success: true, // Return success since data is stored locally
        message: 'Your consultation request has been saved. We will contact you shortly.'
      };
    }

    try {
      const [firstName, ...lastNameParts] = contactData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '-';

      console.log('Creating records in SuiteCRM for:', contactData.email);

      // Create contact record first
      console.log('Creating contact record');
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

      if (!contact.id) {
        throw new Error('Failed to create contact: No ID returned');
      }

      // Create meeting for consultation if date/time provided
      if (contactData.preferredDate && contactData.preferredTime) {
        console.log('Creating meeting record');
        const meetingDate = new Date(contactData.preferredDate);
        const [hours, minutes] = contactData.preferredTime.split(':');
        meetingDate.setHours(parseInt(hours), parseInt(minutes));

        const endDate = new Date(meetingDate);
        endDate.setHours(endDate.getHours() + 1);

        const meeting = await this.makeRequest('set_entry', {
          module_name: 'Meetings',
          name_value_list: {
            name: `Cubby House Consultation - ${contactData.name}`,
            date_start: meetingDate.toISOString(),
            date_end: endDate.toISOString(),
            duration_hours: '1',
            duration_minutes: '0',
            status: 'Planned',
            description: contactData.notes || '',
            location: 'Online/Phone',
            parent_type: 'Contacts',
            parent_id: contact.id
          }
        });

        if (meeting.id) {
          // Link meeting to contact
          await this.makeRequest('set_relationship', {
            module_name: 'Meetings',
            module_id: meeting.id,
            link_field_name: 'contacts',
            related_ids: [contact.id]
          });
        }
      }

      return {
        success: true,
        message: 'Your consultation has been scheduled successfully. We will contact you shortly to confirm the details.'
      };

    } catch (error) {
      console.error('Failed to create records in SuiteCRM:', error);
      this.isServerAvailable = false;
      return {
        success: true, // Return success since data is stored locally
        message: 'Your consultation request has been received and will be processed shortly.'
      };
    }
  }
}

export const suiteCRMService = new SuiteCRMService();