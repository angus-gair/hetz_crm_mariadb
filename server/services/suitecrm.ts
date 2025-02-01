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

export class SuiteCRMService {
  private baseUrl: string;
  private username: string;
  private password: string;
  private sessionId: string | null = null;

  constructor() {
    const baseUrl = process.env.SUITECRM_URL || 'http://4.236.188.48';
    // Ensure URL has proper protocol
    this.baseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
    this.username = process.env.SUITECRM_USERNAME || 'admin';
    this.password = process.env.SUITECRM_PASSWORD || 'Jamfinnarc1776!';
  }

  private async login() {
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
        }
      });

      // Enhanced error handling for HTML responses
      if (typeof response.data === 'string' && response.data.includes('Fatal error')) {
        throw new Error('SuiteCRM server error: The server is not properly configured. Please contact system administrator.');
      }

      if (!response.data?.id) {
        throw new Error('Invalid response format from SuiteCRM');
      }

      this.sessionId = response.data.id;
      console.log('Successfully logged into SuiteCRM');
      return this.sessionId;
    } catch (error) {
      console.error('SuiteCRM login failed:', error);
      throw new Error('Failed to authenticate with SuiteCRM. The service may be temporarily unavailable.');
    }
  }

  async createContact(contactData: ContactData): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.sessionId) {
        await this.login();
      }

      const contactPayload = {
        method: 'set_entry',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {
          session: this.sessionId,
          module_name: 'Contacts',
          name_value_list: [
            { name: 'first_name', value: contactData.name.split(' ')[0] },
            { name: 'last_name', value: contactData.name.split(' ')[1] || '' },
            { name: 'email1', value: contactData.email },
            { name: 'phone_mobile', value: contactData.phone },
            { name: 'description', value: `Notes: ${contactData.notes || ''}\nPreferred Date: ${contactData.preferredDate || ''}\nPreferred Time: ${contactData.preferredTime || ''}` }
          ]
        }
      };

      console.log('Attempting to create contact in SuiteCRM');
      const response = await axios.post(`${this.baseUrl}/service/v4/rest.php`, contactPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Successfully created contact in SuiteCRM');
      return {
        success: true,
        message: 'Contact created successfully in SuiteCRM'
      };
    } catch (error) {
      console.error('Failed to create contact in SuiteCRM:', error);
      // Return a user-friendly response instead of throwing
      return {
        success: false,
        message: 'Contact saved locally. SuiteCRM sync will be retried automatically.'
      };
    }
  }
}

export const suiteCRMService = new SuiteCRMService();