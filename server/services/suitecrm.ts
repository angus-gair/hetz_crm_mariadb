import axios from 'axios';

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
    this.baseUrl = process.env.SUITECRM_URL || '';
    this.username = process.env.SUITECRM_USERNAME || '';
    this.password = process.env.SUITECRM_PASSWORD || '';
  }

  private async login() {
    try {
      const response = await axios.post(`${this.baseUrl}/service/v4/rest.php`, {
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
      });

      this.sessionId = response.data.id;
      return this.sessionId;
    } catch (error) {
      console.error('SuiteCRM login failed:', error);
      throw new Error('Failed to authenticate with SuiteCRM');
    }
  }

  async createContact(contactData: ContactData) {
    try {
      if (!this.sessionId) {
        await this.login();
      }

      const response = await axios.post(`${this.baseUrl}/service/v4/rest.php`, {
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
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create contact in SuiteCRM:', error);
      throw new Error('Failed to create contact in SuiteCRM');
    }
  }
}

export const suiteCRMService = new SuiteCRMService();
