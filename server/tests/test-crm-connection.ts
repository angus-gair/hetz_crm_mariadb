import axios from 'axios';
import { SuiteCRMService } from '../services/suitecrm';
import { SyncService } from '../services/syncService';
import { query } from '../database';

interface TestCase {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
  expectedResult: boolean;
}

async function cleanupTestData() {
  await query(
    `DELETE FROM consultations WHERE email LIKE 'test%@example.com'`
  );
}

async function getCSRFToken(): Promise<string | null> {
  try {
    console.log('Fetching CSRF token...');
    const response = await axios.get('http://4.236.188.48/api/graphql', {
      headers: {
        'Accept': 'application/json'
      },
      validateStatus: status => status < 500
    });

    // Extract CSRF token from response headers or cookies
    const csrfToken = response.headers['x-csrf-token'] || 
                     response.headers['x-xsrf-token'];

    if (!csrfToken) {
      console.error('No CSRF token found in response');
      return null;
    }

    console.log('CSRF token obtained successfully');
    return csrfToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to get CSRF token:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Unexpected error while getting CSRF token:', error);
    }
    return null;
  }
}

async function testGraphQLConnection() {
  try {
    console.log('Testing GraphQL connection to SuiteCRM...');

    // First get CSRF token
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      throw new Error('Failed to obtain CSRF token');
    }

    const response = await axios.post('http://4.236.188.48/api/graphql', {
      query: `
        query {
          __schema {
            queryType {
              name
            }
          }
        }
      `
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': csrfToken
      },
      timeout: 30000,
      validateStatus: status => status < 500
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('GraphQL connection failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Unexpected error during GraphQL test:', error);
    }
    return false;
  }
}

async function testAuthentication(username: string, password: string): Promise<boolean> {
  try {
    console.log('Testing authentication for user:', username);

    // First get CSRF token
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      throw new Error('Failed to obtain CSRF token for authentication');
    }

    const response = await axios.post('http://4.236.188.48/api/graphql', {
      query: `
        mutation createProcess($input: createProcessInput!) {
          createProcess(input: $input) {
            process {
              _id
              status
              async
              type
              messages
              data
              __typename
            }
          }
        }
      `,
      variables: {
        input: {
          type: 'login',
          options: {
            username,
            password
          }
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': csrfToken
      },
      timeout: 30000,
      withCredentials: true
    });

    console.log('Auth response:', {
      status: response.status,
      success: response.data?.data?.createProcess?.process?.status === 'success'
    });

    return response.data?.data?.createProcess?.process?.status === 'success';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Authentication test failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Unexpected error during authentication test:', error);
    }
    return false;
  }
}

async function runSyncTests() {
  console.log('Starting automated sync testing...');

  const testCases: TestCase[] = [
    {
      name: 'Test User 1',
      email: 'test1@example.com',
      phone: '1234567890',
      preferredDate: '2025-02-27',
      preferredTime: '15:30',
      expectedResult: true
    },
    {
      name: 'Test User 2',
      email: 'test2@example.com',
      phone: '0987654321',
      preferredDate: '2025-02-28',
      expectedResult: true
    },
    {
      name: 'Test User 3',
      email: 'test3@example.com',
      phone: '5555555555',
      preferredDate: '2025-03-01',
      preferredTime: '09:00',
      notes: 'Test consultation',
      expectedResult: true
    }
  ];

  const syncService = new SyncService();
  let failedTests = 0;
  let successfulTests = 0;

  try {
    for (const testCase of testCases) {
      console.log(`\nRunning test for ${testCase.name}`);
      try {
        const [consultation] = await query<[{ id: number }]>(
          `INSERT INTO consultations 
           (name, email, phone, notes, preferred_date, preferred_time)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [
            testCase.name,
            testCase.email,
            testCase.phone,
            testCase.notes || '',
            testCase.preferredDate,
            testCase.preferredTime
          ]
        );

        console.log(`Testing sync for consultation ID: ${consultation.id}`);
        await syncService.syncConsultationToCRM(consultation.id);

        const [result] = await query<[{ crm_sync_status: string }]>(
          `SELECT crm_sync_status FROM consultations WHERE id = $1`,
          [consultation.id]
        );

        const success = result.crm_sync_status === 'synced';
        if (success === testCase.expectedResult) {
          console.log('✅ Test passed:', testCase.name);
          successfulTests++;
        } else {
          console.log('❌ Test failed:', testCase.name);
          console.log('Expected:', testCase.expectedResult ? 'synced' : 'failed');
          console.log('Got:', result.crm_sync_status);
          failedTests++;
        }
      } catch (error) {
        console.error('Test error for', testCase.name, ':', error);
        failedTests++;
      }
    }
  } finally {
    await cleanupTestData();
  }

  console.log('\nTest Summary:');
  console.log(`Total tests: ${testCases.length}`);
  console.log(`Successful: ${successfulTests}`);
  console.log(`Failed: ${failedTests}`);
}

async function main() {
  try {
    const username = process.env.SUITECRM_USERNAME;
    const password = process.env.SUITECRM_PASSWORD;

    if (!username || !password) {
      throw new Error('Missing required environment variables');
    }

    console.log('Starting SuiteCRM API tests...');

    // Test GraphQL connection first
    const graphqlOk = await testGraphQLConnection();
    if (!graphqlOk) {
      console.log('GraphQL API not available, this may be an older version of SuiteCRM.');
      console.log('Please verify the SuiteCRM version and API configuration.');

      throw new Error('GraphQL API unavailable - Please check SuiteCRM configuration');
    }

    // Test authentication
    const authOk = await testAuthentication(username, password);
    if (!authOk) {
      throw new Error('Authentication test failed');
    }

    await runSyncTests();
    console.log('All tests completed.');
    process.exit(0);
  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export { testAuthentication, testGraphQLConnection };

// Run if called directly
main().catch(console.error);