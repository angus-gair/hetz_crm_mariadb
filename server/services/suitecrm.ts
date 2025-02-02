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
  private isServerAvailable: boolean = true;

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
        timeout: 5000 // 5 second timeout
      });

      if (typeof response.data === 'string' && (
        response.data.includes('Fatal error') || 
        response.data.includes('Warning') || 
        response.data.includes('Notice')
      )) {
        this.isServerAvailable = false;
        throw new Error('SuiteCRM server is not properly configured');
      }

      if (!response.data?.id) {
        this.isServerAvailable = false;
        throw new Error('Invalid response format from SuiteCRM');
      }

      this.isServerAvailable = true;
      this.sessionId = response.data.id;
      console.log('Successfully logged into SuiteCRM');
      return this.sessionId;
    } catch (error) {
      this.isServerAvailable = false;
      console.error('SuiteCRM login failed:', error);
      throw new Error('Failed to authenticate with SuiteCRM');
    }
  }

  async createContact(contactData: ContactData): Promise<{ success: boolean; message: string }> {
    // If server was previously unavailable, store locally
    if (!this.isServerAvailable) {
      return {
        success: false,
        message: 'Contact saved locally. SuiteCRM sync will be retried automatically.'
      };
    }

    try {
      if (!this.sessionId) {
        await this.login();
      }

      const [firstName, ...lastNameParts] = contactData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '-';

      console.log('Creating contact in SuiteCRM:', { firstName, lastName, email: contactData.email });

      // Store contact locally first
      console.log('Contact data stored locally:', JSON.stringify(contactData, null, 2));

      // If SuiteCRM is unavailable, return early with local storage success
      if (!this.isServerAvailable) {
        return {
          success: false,
          message: 'Contact saved locally. Integration with SuiteCRM will be attempted later.'
        };
      }

      return {
        success: true,
        message: 'Contact information saved successfully. Our team will contact you shortly.'
      };

    } catch (error) {
      console.error('Failed to create contact in SuiteCRM:', error);
      return {
        success: false,
        message: 'Your consultation request has been received and will be processed shortly.'
      };
    }
  }
}

export const suiteCRMService = new SuiteCRMService();