import { Resolver, Query, Mutation, Arg } from "type-graphql";
import axios from "axios";
import { SuiteCRMConnection, SuiteCRMCredentials } from "./types";

const SUITECRM_URL = process.env.SUITECRM_URL || 'http://172.19.0.2:8080';
const CLIENT_ID = process.env.SUITECRM_CLIENT_ID || '3d55a713-12be-62ea-c814-67aaf6faa94f';
const CLIENT_SECRET = process.env.SUITECRM_CLIENT_SECRET || 'a4e27aa43c190b48b250c2e59f322761971eabfab923d1db8e86bcaecc7b1d08';

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

@Resolver()
export class SuiteCRMResolver {
  private async ensureToken(): Promise<string> {
    if (!accessToken || !tokenExpiry || Date.now() >= (tokenExpiry - 300000)) {
      try {
        const response = await axios.post(`${SUITECRM_URL}/Api/V8/oauth2/token`, {
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.api+json'
          }
        });

        accessToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      } catch (error: any) {
        console.error('Failed to obtain OAuth token:', error.message);
        throw new Error('Authentication failed');
      }
    }
    return accessToken;
  }

  private async makeRequest(endpoint: string, options: any = {}) {
    try {
      const token = await this.ensureToken();
      const response = await axios({
        ...options,
        url: `${SUITECRM_URL}${endpoint}`,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`API Request failed for ${endpoint}:`, error.message);
      throw error;
    }
  }

  @Query(() => SuiteCRMConnection)
  async testSuiteCRMConnection(): Promise<SuiteCRMConnection> {
    const endpoints = [
      {
        name: 'V8 OAuth Endpoint',
        test: async () => {
          try {
            await this.ensureToken();
            return { success: true, message: 'OAuth token obtained successfully' };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'V8 Modules Endpoint',
        test: async () => {
          try {
            await this.makeRequest('/Api/V8/meta/modules');
            return { success: true, message: 'Modules endpoint accessible' };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'V8 Meta Now Endpoint',
        test: async () => {
          try {
            await this.makeRequest('/Api/V8/meta/now');
            return { success: true, message: 'Server time endpoint accessible' };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      }
    ];

    try {
      console.log('Testing SuiteCRM connection with URL:', SUITECRM_URL);

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          const result = await endpoint.test();
          return {
            name: endpoint.name,
            status: result.success ? 200 : 500,
            statusText: result.success ? 'OK' : 'Error',
            data: result,
            error: result.success ? undefined : result.message
          };
        })
      );

      return new SuiteCRMConnection(
        results.every(r => r.status === 200),
        results.some(r => r.error) ? 'Some endpoints failed' : 'All endpoints successful',
        results
      );
    } catch (error: any) {
      console.error('Connection test failed:', error.message);
      return new SuiteCRMConnection(
        false,
        error.message,
        []
      );
    }
  }
}