import axios from 'axios';

interface ConsultationData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
}

export class SuiteCRMService {
  private baseUrl: string;
  private readonly timeout: number = 30000;
  private accessToken: string | null = null;

  constructor() {
    const url = process.env.SUITECRM_URL || 'http://4.236.188.48';
    this.baseUrl = url.startsWith('http') ? url : `http://${url}`;

    console.log('[SuiteCRM] Service initialized with base URL:', this.baseUrl);
  }

  private async getAccessToken(): Promise<string> {
    try {
      const tokenResponse = await axios.post(
        `${this.baseUrl}/Api/access_token`,
        {
          grant_type: 'client_credentials',
          client_id: process.env.SUITECRM_CLIENT_ID,
          client_secret: process.env.SUITECRM_CLIENT_SECRET,
          scope: ''
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      this.accessToken = tokenResponse.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('[SuiteCRM] Failed to obtain access token:', error instanceof Error ? error.message : String(error));
      throw new Error('Failed to authenticate with SuiteCRM');
    }
  }

  async createConsultationMeeting(consultationData: ConsultationData): Promise<{ success: boolean; message: string }> {
    try {
      // Format the date and time for the meeting
      const meetingDate = consultationData.preferredDate ? new Date(consultationData.preferredDate) : new Date();
      if (consultationData.preferredTime) {
        const [hours, minutes] = consultationData.preferredTime.split(':');
        meetingDate.setHours(parseInt(hours), parseInt(minutes));
      }

      // End date is 1 hour after start
      const endDate = new Date(meetingDate);
      endDate.setHours(endDate.getHours() + 1);

      // Format dates for SuiteCRM (YYYY-MM-DD HH:mm:ss)
      const formatDate = (date: Date) => {
        return date.toISOString().replace('T', ' ').split('.')[0];
      };

      // Get access token
      const accessToken = await this.getAccessToken();

      // GraphQL mutation for creating a meeting via Process API
      const mutation = `
        mutation createProcess($input: createProcessInput!) {
          createProcess(input: $input) {
            process {
              _id
              status
              messages
              data
            }
          }
        }
      `;

      const variables = {
        input: {
          type: "create-meeting-from-webform",
          options: {
            formData: {
              name: consultationData.name,
              email: consultationData.email,
              phone: consultationData.phone,
              preferredDatetime: formatDate(meetingDate),
              notes: consultationData.notes || ''
            }
          }
        }
      };

      console.log('[SuiteCRM] Sending GraphQL mutation for meeting creation:', {
        url: `${this.baseUrl}/Api/graphql`,
        variables
      });

      const response = await axios.post(
        `${this.baseUrl}/Api/graphql`,
        {
          query: mutation,
          variables
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          timeout: this.timeout
        }
      );

      console.log('[SuiteCRM] GraphQL response:', {
        status: response.status,
        data: response.data
      });

      if (response.data?.data?.createProcess?.process?.status === 'success') {
        return {
          success: true,
          message: 'Thank you! Your consultation request has been received. Our team will contact you shortly to confirm the details.'
        };
      } else {
        const errorMessages = response.data?.data?.createProcess?.process?.messages || ['Failed to create meeting'];
        throw new Error(errorMessages.join(', '));
      }

    } catch (error) {
      console.error('[SuiteCRM] Failed to create consultation meeting:', error instanceof Error ? error.message : String(error));
      return {
        success: false,
        message: 'We encountered an issue scheduling your consultation. Please try again later or contact us directly.'
      };
    }
  }
}

export const suiteCRMService = new SuiteCRMService();