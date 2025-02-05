import axios from 'axios';
import { test } from 'node:test';
import assert from 'node:assert';
import { suiteCRMService } from '../services/suitecrm';
import { syncService } from '../services/syncService';
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

async function getCSRFToken(baseUrl: string): Promise<string | null> {
  try {
    console.log('Fetching CSRF token...');
    const response = await axios.get(`${baseUrl}/Api/graphql`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      validateStatus: status => status < 500
    });

    // Try different possible CSRF token header names
    const csrfToken = response.headers['x-csrf-token'] || 
                     response.headers['x-xsrf-token'] ||
                     response.headers['csrf-token'] ||
                     response.data?.csrf_token;

    if (!csrfToken) {
      console.error('Response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      return null;
    }

    return csrfToken;
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    return null;
  }
}

async function testGraphQLConnection(baseUrl: string): Promise<boolean> {
  try {
    const csrfToken = await getCSRFToken(baseUrl);
    if (!csrfToken) {
      throw new Error('Failed to obtain CSRF token');
    }

    const response = await axios.post(`${baseUrl}/Api/graphql`, {
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
      }
    });

    return response.data?.data?.__schema?.queryType?.name === 'Query';
  } catch (error) {
    console.error('GraphQL connection test failed:', error);
    return false;
  }
}

async function testAuthentication(baseUrl: string, username: string, password: string): Promise<boolean> {
  try {
    const csrfToken = await getCSRFToken(baseUrl);
    if (!csrfToken) {
      throw new Error('Failed to obtain CSRF token for authentication');
    }

    const response = await axios.post(`${baseUrl}/Api/graphql`, {
      query: `
        mutation login($username: String!, $password: String!) {
          login(input: { username: $username, password: $password }) {
            token
          }
        }
      `,
      variables: {
        username,
        password
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': csrfToken
      }
    });

    return !!response.data?.data?.login?.token;
  } catch (error) {
    console.error('Authentication test failed:', error);
    return false;
  }
}

async function testConsultationCreation(baseUrl: string): Promise<boolean> {
  const testCase = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    preferredDate: '2025-02-27',
    preferredTime: '15:30',
    notes: 'Test consultation',
    expectedResult: true
  };

  try {
    // Create test consultation in our database
    const [consultation] = await query<[{ id: number }]>(
      `INSERT INTO consultations 
       (name, email, phone, notes, preferred_date, preferred_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        testCase.name,
        testCase.email,
        testCase.phone,
        testCase.notes,
        testCase.preferredDate,
        testCase.preferredTime
      ]
    );

    // Try to sync it
    await syncService.syncConsultationToCRM(consultation.id);

    // Check sync status
    const [result] = await query<[{ crm_sync_status: string }]>(
      `SELECT crm_sync_status FROM consultations WHERE id = $1`,
      [consultation.id]
    );

    return result.crm_sync_status === 'synced';
  } catch (error) {
    console.error('Consultation creation test failed:', error);
    return false;
  } finally {
    await cleanupTestData();
  }
}

test('SuiteCRM Integration Tests', async (t) => {
  const baseUrl = process.env.SUITECRM_URL || 'http://4.236.188.48';
  const username = process.env.SUITECRM_USERNAME;
  const password = process.env.SUITECRM_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing required environment variables SUITECRM_USERNAME and SUITECRM_PASSWORD');
  }

  await t.test('GraphQL API is accessible', async () => {
    const result = await testGraphQLConnection(baseUrl);
    assert.strictEqual(result, true, 'GraphQL API should be accessible');
  });

  await t.test('Authentication works', async () => {
    const result = await testAuthentication(baseUrl, username, password);
    assert.strictEqual(result, true, 'Authentication should succeed');
  });

  await t.test('Can create consultation and sync to CRM', async () => {
    const result = await testConsultationCreation(baseUrl);
    assert.strictEqual(result, true, 'Consultation creation and sync should succeed');
  });
});

// Only run tests if called directly
if (require.main === module) {
  test.run();
}