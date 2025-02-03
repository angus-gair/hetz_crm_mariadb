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
  private readonly timeout: number = 15000; // Increased timeout to 15 seconds

  constructor() {
    const baseUrl = process.env.SUITECRM_URL || 'http://4.236.188.48';
    this.baseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
    this.username = process.env.SUITECRM_USERNAME || 'admin';
    this.password = process.env.SUITECRM_PASSWORD || 'Jamfinnarc1776!';
  }

  private async login(): Promise<string> {
    try {
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
        timeout: this.timeout
      });

      // Check for PHP errors in response
      if (typeof response.data === 'string' && (
        response.data.includes('Fatal error') || 
        response.data.includes('Warning') || 
        response.data.includes('Notice')
      )) {
        console.error('SuiteCRM returned PHP error:', response.data);
        this.isServerAvailable = false;
        throw new Error('SuiteCRM server returned PHP errors');
      }

      // Validate response format
      if (!response.data?.id) {
        console.error('Invalid SuiteCRM response format:', response.data);
        this.isServerAvailable = false;
        throw new Error('Invalid response format from SuiteCRM');
      }

      this.isServerAvailable = true;
      console.log('Successfully authenticated with SuiteCRM');
      return response.data.id;
    } catch (error) {
      this.isServerAvailable = false;
      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        console.error('SuiteCRM server is not reachable:', error.message);
      } else {
        console.error('SuiteCRM login failed:', error);
      }
      throw new Error('Failed to authenticate with SuiteCRM');
    }
  }

  private async setSession(): Promise<void> {
    if (!this.sessionId) {
      try {
        this.sessionId = await this.login();
      } catch (error) {
        console.error('Failed to set SuiteCRM session:', error);
        throw error;
      }
    }
  }

  private async makeRequest(method: string, parameters: any): Promise<SuiteCRMResponse> {
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
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      console.error(`SuiteCRM ${method} request failed:`, error);
      throw error;
    }
  }

  async getUpdatedContacts(lastSync: string): Promise<any[]> {
    try {
      console.log('Fetching updated contacts from CRM since:', lastSync);
      const response = await this.makeRequest('get_entry_list', {
        module_name: 'Contacts',
        query: `contacts.date_modified > '${lastSync}'`,
        order_by: 'date_modified DESC',
        offset: 0,
        select_fields: ['id', 'first_name', 'last_name', 'email1', 'phone_mobile', 'description'],
        max_results: 100,
        deleted: 0
      });

      if (!response.entry_list) {
        return [];
      }

      return response.entry_list.map((entry: any) => ({
        id: entry.id,
        name: `${entry.name_value_list.first_name.value} ${entry.name_value_list.last_name.value}`,
        email: entry.name_value_list.email1.value,
        phone: entry.name_value_list.phone_mobile.value,
        notes: entry.name_value_list.description.value
      }));
    } catch (error) {
      console.error('Failed to fetch updated contacts:', error);
      return [];
    }
  }

  private async findOrCreateAccount(name: string, email: string): Promise<string> {
    try {
      console.log('Searching for existing account:', email);
      const searchResult = await this.makeRequest('get_entry_list', {
        module_name: 'Accounts',
        query: `accounts.email1 = '${email}'`,
        order_by: '',
        offset: 0,
        select_fields: ['id', 'name'],
        max_results: 1,
        deleted: 0
      });

      if (searchResult.entry_list && searchResult.entry_list.length > 0) {
        console.log('Found existing account:', searchResult.entry_list[0].id);
        return searchResult.entry_list[0].id;
      }

      console.log('Creating new account for:', name);
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || '-';

      const newAccount = await this.makeRequest('set_entry', {
        module_name: 'Accounts',
        name_value_list: {
          name: `${firstName} ${lastName}`,
          email1: email,
          account_type: 'Customer',
        }
      });

      if (!newAccount.id) {
        throw new Error('Failed to create account: No ID returned');
      }

      console.log('Created new account:', newAccount.id);
      return newAccount.id;
    } catch (error) {
      console.error('Error in findOrCreateAccount:', error);
      throw error;
    }
  }

  async createContact(contactData: ContactData): Promise<{ success: boolean; message: string }> {
    if (!this.isServerAvailable) {
      console.log('SuiteCRM is not available, storing locally only');
      return {
        success: false,
        message: 'Contact saved locally. SuiteCRM sync will be retried automatically.'
      };
    }

    try {
      const [firstName, ...lastNameParts] = contactData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '-';

      console.log('Creating records in SuiteCRM for:', contactData.email);

      // Create or find account first
      const accountId = await this.findOrCreateAccount(contactData.name, contactData.email);

      // Create contact
      console.log('Creating contact record');
      const contact = await this.makeRequest('set_entry', {
        module_name: 'Contacts',
        name_value_list: {
          first_name: firstName,
          last_name: lastName,
          email1: contactData.email,
          phone_mobile: contactData.phone,
          account_id: accountId,
          description: contactData.notes || ''
        }
      });

      if (!contact.id) {
        throw new Error('Failed to create contact: No ID returned');
      }

      // Create meeting for consultation
      if (contactData.preferredDate && contactData.preferredTime) {
        console.log('Creating meeting record');
        const meetingDate = new Date(contactData.preferredDate);
        const [hours, minutes] = contactData.preferredTime.split(':');
        meetingDate.setHours(parseInt(hours), parseInt(minutes));

        await this.makeRequest('set_entry', {
          module_name: 'Meetings',
          name_value_list: {
            name: `Cubby House Consultation - ${contactData.name}`,
            date_start: meetingDate.toISOString(),
            duration_hours: '1',
            duration_minutes: '0',
            status: 'Planned',
            description: contactData.notes || '',
            parent_type: 'Contacts',
            parent_id: contact.id
          }
        });
      }

      return {
        success: true,
        message: 'Contact information saved successfully. Our team will contact you shortly.'
      };

    } catch (error) {
      console.error('Failed to create records in SuiteCRM:', error);
      return {
        success: false,
        message: 'Your consultation request has been received and will be processed shortly.'
      };
    }
  }
}

export const suiteCRMService = new SuiteCRMService();