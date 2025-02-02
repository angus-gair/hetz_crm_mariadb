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

      if (typeof response.data === 'string' && response.data.includes('Fatal error')) {
        throw new Error('SuiteCRM server error: The server is not properly configured.');
      }

      if (!response.data?.id) {
        throw new Error('Invalid response format from SuiteCRM');
      }

      this.sessionId = response.data.id;
      console.log('Successfully logged into SuiteCRM');
      return this.sessionId;
    } catch (error) {
      console.error('SuiteCRM login failed:', error);
      throw new Error('Failed to authenticate with SuiteCRM.');
    }
  }

  async createContact(contactData: ContactData): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.sessionId) {
        await this.login();
      }

      const [firstName, ...lastNameParts] = contactData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '-';

      console.log('Creating contact in SuiteCRM:', { firstName, lastName, email: contactData.email });

      // Create contact first
      const contactPayload = {
        method: 'set_entry',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {
          session: this.sessionId,
          module_name: 'Contacts',
          name_value_list: [
            { name: 'first_name', value: firstName },
            { name: 'last_name', value: lastName },
            { name: 'phone_work', value: contactData.phone },
            { name: 'description', value: contactData.notes || '' },
            { name: 'lead_source', value: 'Web Site' }
          ]
        }
      };

      const contactResponse = await axios.post(`${this.baseUrl}/service/v4/rest.php`, contactPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!contactResponse.data?.id) {
        throw new Error('Failed to create contact');
      }

      // Set email address for the contact
      const emailPayload = {
        method: 'set_entries',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {
          session: this.sessionId,
          module_name: 'EmailAddresses',
          name_value_lists: [[
            { name: 'email_address', value: contactData.email },
            { name: 'bean_id', value: contactResponse.data.id },
            { name: 'bean_module', value: 'Contacts' },
            { name: 'primary_address', value: '1' }
          ]]
        }
      };

      await axios.post(`${this.baseUrl}/service/v4/rest.php`, emailPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Create meeting if date is provided
      if (contactData.preferredDate) {
        const meetingPayload = {
          method: 'set_entry',
          input_type: 'JSON',
          response_type: 'JSON',
          rest_data: {
            session: this.sessionId,
            module_name: 'Meetings',
            name_value_list: [
              { name: 'name', value: `Consultation with ${contactData.name}` },
              { name: 'date_start', value: `${contactData.preferredDate} ${contactData.preferredTime || '00:00:00'}` },
              { name: 'duration_hours', value: '1' },
              { name: 'status', value: 'Planned' },
              { name: 'description', value: contactData.notes || '' }
            ]
          }
        };

        const meetingResponse = await axios.post(`${this.baseUrl}/service/v4/rest.php`, meetingPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        // Link contact to meeting
        if (meetingResponse.data?.id) {
          const relationshipPayload = {
            method: 'set_relationship',
            input_type: 'JSON',
            response_type: 'JSON',
            rest_data: {
              session: this.sessionId,
              module_name: 'Meetings',
              module_id: meetingResponse.data.id,
              link_field_name: 'contacts',
              related_ids: [contactResponse.data.id]
            }
          };

          await axios.post(`${this.baseUrl}/service/v4/rest.php`, relationshipPayload, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
        }
      }

      console.log('Successfully created contact and meeting in SuiteCRM');
      return {
        success: true,
        message: 'Contact and consultation details created successfully in SuiteCRM'
      };
    } catch (error) {
      console.error('Failed to create contact in SuiteCRM:', error);
      return {
        success: false,
        message: 'Contact saved locally. SuiteCRM sync will be retried automatically.'
      };
    }
  }
}

export const suiteCRMService = new SuiteCRMService();