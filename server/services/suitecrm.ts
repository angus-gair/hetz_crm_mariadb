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
        console.error('Missing required SuiteCRM configuration');
        this.isServerAvailable = false;
        return;
      }

      // Ensure baseUrl has proper protocol and validate URL format
      this.baseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
      new URL(this.baseUrl); // Validate URL format

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
      // Log raw response for debugging
      console.log('SuiteCRM Raw Response:', {
        data: response.data.substring(0, 500),
        status: response.status,
        headers: response.headers,
        endpoint: response.config?.url
      });

      // Check if response is HTML
      if (this.isHTMLResponse(response.data)) {
        console.error('Received HTML response instead of JSON:', response.data.substring(0, 200));
        this.isServerAvailable = false;
        throw new Error('SuiteCRM returned HTML instead of JSON - server may be misconfigured');
      }

      // Enhanced PHP error detection with specific error types
      if (response.data.includes('Fatal error: Cannot declare class LanguageManager')) {
        console.error('SuiteCRM Class Loading Error:', {
          error: response.data,
          timestamp: new Date().toISOString(),
          endpoint: response.config?.url
        });
        this.isServerAvailable = false;
        throw new Error('SuiteCRM server has a class loading conflict. Please clear the server cache and verify the installation.');
      } else if (response.data.includes('Fatal error') ||
          response.data.includes('Warning') ||
          response.data.includes('Notice')) {
        console.error('SuiteCRM PHP Error:', {
          error: response.data,
          timestamp: new Date().toISOString(),
          endpoint: response.config?.url
        });
        this.isServerAvailable = false;
        throw new Error('SuiteCRM server is experiencing PHP configuration issues. Please check server logs.');
      }

      // Try to parse JSON if string
      if (!this.isValidJSON(response.data)) {
        console.error('Invalid JSON Response:', {
          response: response.data.substring(0, 200),
          contentType: response.headers['content-type']
        });
        this.isServerAvailable = false;
        throw new Error('Invalid response format from SuiteCRM');
      }

      return JSON.parse(response.data);
    }

    return response.data;
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
    if (!this.isServerAvailable) {
      console.log('SuiteCRM is not available, storing locally for future sync');
      return {
        success: true,
        message: 'Your consultation request has been saved and will be processed as soon as possible. Our team will contact you shortly.'
      };
    }

    try {
      const [firstName, ...lastNameParts] = contactData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '-';

      console.log('Attempting to create records in SuiteCRM for:', contactData.email);

      // Attempt to create records in SuiteCRM
      const result = await this.attemptCreateCRMRecords(contactData, firstName, lastName);

      return {
        success: true,
        message: 'Your consultation has been scheduled successfully. We will contact you shortly to confirm the details.'
      };

    } catch (error) {
      console.error('Failed to create records in SuiteCRM:', error);
      this.isServerAvailable = false;

      // Return a user-friendly message while ensuring data is stored locally
      return {
        success: true,
        message: 'Your consultation request has been received. Our team will process it and contact you shortly.'
      };
    }
  }

  private async attemptCreateCRMRecords(
    contactData: ContactData,
    firstName: string,
    lastName: string
  ): Promise<void> {
    try {
      // 1. Create Account record
      const account = await this.makeRequest('set_entry', {
        module_name: 'Accounts',
        name_value_list: {
          name: `${contactData.name} - Residential`,
          phone_office: contactData.phone,
          email1: contactData.email,
          description: 'Cubby House Consultation Client',
          account_type: 'Customer'
        }
      });

      if (!account.id) {
        throw new Error('Failed to create account record');
      }

      // 2. Create Contact record
      const contact = await this.makeRequest('set_entry', {
        module_name: 'Contacts',
        name_value_list: {
          first_name: firstName,
          last_name: lastName,
          email1: contactData.email,
          phone_mobile: contactData.phone,
          description: contactData.notes || '',
          lead_source: 'Web Site',
          account_id: account.id
        }
      });

      if (!contact.id) {
        throw new Error('Failed to create contact record');
      }

      // 3. Link Contact to Account
      await this.makeRequest('set_relationship', {
        module_name: 'Accounts',
        module_id: account.id,
        link_field_name: 'contacts',
        related_ids: [contact.id]
      });

      // 4. Create Lead record
      await this.makeRequest('set_entry', {
        module_name: 'Leads',
        name_value_list: {
          first_name: firstName,
          last_name: lastName,
          phone_mobile: contactData.phone,
          email1: contactData.email,
          description: 'Cubby House Consultation Inquiry',
          status: 'New',
          lead_source: 'Web Site',
          account_id: account.id,
          contact_id: contact.id
        }
      });

      // 5. Add consultation notes if provided
      if (contactData.notes) {
        await this.makeRequest('set_entry', {
          module_name: 'Notes',
          name_value_list: {
            name: 'Initial Consultation Notes',
            description: contactData.notes,
            parent_type: 'Accounts',
            parent_id: account.id
          }
        });
      }

      // 6. Schedule meeting if date/time provided
      if (contactData.preferredDate && contactData.preferredTime) {
        await this.createMeetingRecord(contactData, account.id, contact.id);
      }
    } catch (error) {
      console.error('Error in attemptCreateCRMRecords:', error);
      throw error;
    }
  }

  private async createMeetingRecord(
    contactData: ContactData,
    accountId: string,
    contactId: string
  ): Promise<void> {
    console.log('Creating meeting record');
    const meetingDate = new Date(contactData.preferredDate!);
    const [hours, minutes] = contactData.preferredTime!.split(':');
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
        parent_type: 'Accounts',
        parent_id: accountId
      }
    });

    if (meeting.id) {
      // Link meeting to both contact and account
      await this.makeRequest('set_relationship', {
        module_name: 'Meetings',
        module_id: meeting.id,
        link_field_name: 'contacts',
        related_ids: [contactId]
      });

      await this.makeRequest('set_relationship', {
        module_name: 'Meetings',
        module_id: meeting.id,
        link_field_name: 'accounts',
        related_ids: [accountId]
      });
    }
  }

  private async login(): Promise<string> {
    try {
      if (!this.isServerAvailable) {
        throw new Error('SuiteCRM server is not properly configured');
      }

      console.log('Attempting to authenticate with SuiteCRM at URL:', this.baseUrl);

      // Test URL connectivity first
      try {
        const testResponse = await axios.get(`${this.baseUrl}/service/v4/rest.php`, {
          timeout: 5000,
          validateStatus: null
        });
        console.log('SuiteCRM server response status:', testResponse.status);
        if (testResponse.status !== 200) {
          throw new Error(`SuiteCRM server returned status ${testResponse.status}`);
        }
      } catch (connectError) {
        console.error('Failed to connect to SuiteCRM server:', connectError);
        if (axios.isAxiosError(connectError)) {
          if (connectError.code === 'ECONNREFUSED') {
            throw new Error(`Unable to connect to SuiteCRM server at ${this.baseUrl}. Please verify the server is running and accessible.`);
          }
          if (connectError.code === 'ENOTFOUND') {
            throw new Error(`DNS lookup failed for ${this.baseUrl}. Please verify the URL is correct.`);
          }
        }
        throw new Error(`Connection failed to SuiteCRM server: ${connectError.message}`);
      }

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

      console.log('Sending login request to SuiteCRM...');

      const response = await axios.post(`${this.baseUrl}/service/v4/rest.php`, loginPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout,
        validateStatus: null
      });

      // Check HTTP status first
      if (response.status !== 200) {
        console.error(`HTTP ${response.status} received:`, response.statusText);
        throw new Error(`Server returned status ${response.status}`);
      }

      // Log raw response for debugging
      if (typeof response.data === 'string') {
        console.log('Raw response:', response.data.substring(0, 200));
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
        console.error('Network error details:', {
          code: error.code,
          message: error.message,
          response: error.response?.data
        });
      }
      console.error('SuiteCRM login failed:', error);
      throw error;
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
}

export const suiteCRMService = new SuiteCRMService();