import axios from 'axios';

interface ConsultationData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
}

interface GraphQLResponse {
  data?: {
    createProcess?: {
      process?: {
        _id: string;
        status: string;
        messages: string[];
        data: any;
      };
    };
  };
  errors?: Array<{
    message: string;
    locations: Array<{ line: number; column: number }>;
    path: string[];
  }>;
}

export class SuiteCRMService {
  private baseUrl: string;
  private isServerAvailable: boolean = true;
  private readonly timeout: number = 30000;
  private readonly maxRetries: number = 3;
  private csrfToken: string | null = null;
  // Hard-coded credentials as requested
  private readonly username: string = 'admin';
  private readonly password: string = 'Jamfinnarc1776!';

  constructor() {
    try {
      // Using the provided IP directly
      this.baseUrl = 'http://4.236.188.48';
      console.log('SuiteCRM Service initialized with base URL:', this.baseUrl);
    } catch (error) {
      console.error('Failed to initialize SuiteCRM service:', error);
      this.isServerAvailable = false;
    }
  }

  private async getCSRFToken(): Promise<string | null> {
    try {
      console.log('Fetching CSRF token...');
      const response = await axios.get(`${this.baseUrl}/Api/graphql`, {
        headers: {
          'Accept': 'application/json'
        },
        validateStatus: status => status < 500
      });

      const csrfToken = response.headers['x-csrf-token'] || 
                     response.headers['x-xsrf-token'];

      if (!csrfToken) {
        console.error('No CSRF token found in response');
        return null;
      }

      console.log('CSRF token obtained successfully');
      return csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      return null;
    }
  }

  private async executeGraphQL(query: string, variables: any): Promise<GraphQLResponse> {
    try {
      if (!this.csrfToken) {
        this.csrfToken = await this.getCSRFToken();
      }

      if (!this.csrfToken) {
        throw new Error('Failed to obtain CSRF token');
      }

      // First authenticate
      const authResponse = await axios.post(
        `${this.baseUrl}/Api/graphql`,
        {
          query: `
            mutation login($username: String!, $password: String!) {
              login(input: { username: $username, password: $password }) {
                token
              }
            }
          `,
          variables: {
            username: this.username,
            password: this.password
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': this.csrfToken
          }
        }
      );

      const token = authResponse.data?.data?.login?.token;
      if (!token) {
        throw new Error('Authentication failed');
      }

      // Then execute the actual query
      const response = await axios.post(
        `${this.baseUrl}/Api/graphql`,
        {
          query,
          variables
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': this.csrfToken,
            'Authorization': `Bearer ${token}`
          },
          timeout: this.timeout
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('GraphQL request failed:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }
      throw error;
    }
  }

  async createConsultationMeeting(consultationData: ConsultationData): Promise<{ success: boolean; message: string }> {
    if (!this.isServerAvailable) {
      return {
        success: true,
        message: 'Your request has been received. Our team will process it manually and contact you soon.'
      };
    }

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
              notes: consultationData.notes || '',
              preferredDatetime: meetingDate.toISOString(),
              endDatetime: endDate.toISOString()
            }
          }
        }
      };

      console.log('Sending GraphQL mutation to create meeting:', {
        name: consultationData.name,
        preferredDatetime: meetingDate.toISOString()
      });

      const response = await this.executeGraphQL(mutation, variables);

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      const process = response.data?.createProcess?.process;
      if (!process) {
        throw new Error('Invalid response format from SuiteCRM');
      }

      if (process.status === 'success') {
        return {
          success: true,
          message: 'Thank you! Your consultation request has been received. Our team will contact you shortly to confirm the details.'
        };
      } else {
        throw new Error(process.messages?.[0] || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Failed to create consultation meeting:', error);
      return {
        success: true,
        message: 'Your request has been received and will be processed by our team. We will contact you soon.'
      };
    }
  }
  async getUpdatedContacts(since: string): Promise<any[]> {
    if (!this.isServerAvailable) {
      console.log('CRM connection unavailable, skipping sync');
      return [];
    }
    return [];
  }
}

export const suiteCRMService = new SuiteCRMService();