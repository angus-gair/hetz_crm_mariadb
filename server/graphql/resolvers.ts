import { Resolver, Query, Mutation, Arg } from "type-graphql";
import axios from "axios";
import { SuiteCRMConnection, SuiteCRMCredentials } from "./types";

// Use Docker container's internal network address
const SUITECRM_URL = process.env.SUITECRM_URL || 'http://172.19.0.2:8080';
const CLIENT_ID = '3d55a713-12be-62ea-c814-67aaf6faa94f';
const CLIENT_SECRET = 'a4e27aa43c190b48b250c2e59f322761971eabfab923d1db8e86bcaecc7b1d08';

@Resolver()
export class SuiteCRMResolver {
  @Query(() => SuiteCRMConnection)
  async testSuiteCRMConnection(): Promise<SuiteCRMConnection> {
    const endpoints = [
      {
        name: 'V8 Token Endpoint',
        url: `${SUITECRM_URL}/Api/V8/meta/now`,
        method: 'get' as const,
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/json',
          'User-Agent': 'SuiteCRM-GraphQL-Client/1.0'
        }
      },
      {
        name: 'V8 OAuth Endpoint',
        url: `${SUITECRM_URL}/Api/V8/oauth2/token`,
        method: 'post' as const,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SuiteCRM-GraphQL-Client/1.0'
        },
        data: {
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        }
      },
      {
        name: 'Legacy API Endpoint',
        url: `${SUITECRM_URL}/service/v4_1/rest.php`,
        method: 'post' as const,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SuiteCRM-GraphQL-Client/1.0'
        },
        data: {
          method: 'get_server_info',
          input_type: 'JSON',
          response_type: 'JSON',
          rest_data: []
        }
      },
      {
        name: 'API Config Check',
        url: `${SUITECRM_URL}/Api/V8/meta/config`,
        method: 'get' as const,
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/json',
          'User-Agent': 'SuiteCRM-GraphQL-Client/1.0'
        }
      },
      {
        name: 'OAuth Public Key Check',
        url: `${SUITECRM_URL}/Api/V8/oauth2/publickey`,
        method: 'get' as const,
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/json',
          'User-Agent': 'SuiteCRM-GraphQL-Client/1.0'
        }
      }
    ];

    try {
      console.log('Testing SuiteCRM connection with URL:', SUITECRM_URL);
      const results = await Promise.all(
        endpoints.map(async endpoint => {
          try {
            console.log(`Testing endpoint: ${endpoint.name} at ${endpoint.url}`);
            const response = await axios({
              method: endpoint.method,
              url: endpoint.url,
              headers: endpoint.headers,
              data: endpoint.data,
              timeout: 5000,
              validateStatus: null
            });

            console.log(`Response for ${endpoint.name}:`, {
              status: response.status,
              statusText: response.statusText,
              data: response.data
            });

            return {
              name: endpoint.name,
              status: response.status,
              statusText: response.statusText,
              data: response.data,
              error: response.status >= 400 ? 'Request failed' : undefined
            };
          } catch (error: any) {
            console.error(`Error testing ${endpoint.name}:`, error.message);
            return {
              name: endpoint.name,
              status: error.response?.status || 500,
              statusText: error.response?.statusText || error.message,
              error: error.message,
              data: error.response?.data
            };
          }
        })
      );

      return new SuiteCRMConnection(
        results.every(r => r.status < 400),
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

  @Mutation(() => SuiteCRMConnection)
  async authenticateSuiteCRM(
    @Arg("credentials", () => SuiteCRMCredentials) credentials: SuiteCRMCredentials
  ): Promise<SuiteCRMConnection> {
    try {
      const response = await axios.post(
        `${SUITECRM_URL}/Api/V8/oauth2/token`,
        {
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SuiteCRM-GraphQL-Client/1.0'
          }
        }
      );

      return new SuiteCRMConnection(
        true,
        'Authentication successful',
        [{
          name: 'Authentication',
          status: response.status,
          statusText: response.statusText,
          data: response.data
        }]
      );
    } catch (error: any) {
      return new SuiteCRMConnection(
        false,
        error.message,
        [{
          name: 'Authentication',
          status: error.response?.status || 500,
          statusText: error.response?.statusText || error.message,
          error: error.message,
          data: error.response?.data
        }]
      );
    }
  }
}