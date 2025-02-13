import axios from 'axios';
import { suiteCRMService } from '../services/suitecrm';
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

async function testRESTv4Connection(): Promise<boolean> {
  try {
    console.log('[Test] Testing REST v4 API connection...');

    // Format the base URL properly
    let baseUrl = process.env.SUITECRM_URL || 'http://172.191.25.147';
    baseUrl = baseUrl.replace(/\/+$/, '');
    if (!baseUrl.startsWith('http')) {
      baseUrl = `http://${baseUrl}`;
    }

    // First, try a simple GET request to verify server is accessible
    try {
      console.log('[Test] Checking server accessibility...');
      const pingResponse = await axios.get(baseUrl, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      console.log('[Test] Server ping response:', {
        status: pingResponse.status,
        statusText: pingResponse.statusText
      });
    } catch (pingError: any) {
      console.error('[Test] Server ping failed:', pingError.message);
      throw new Error('Server is not accessible');
    }

    // Try to access the REST API endpoint directly with GET first
    const url = `${baseUrl}/service/v4_1/rest.php`;
    console.log('[Test] Checking REST API endpoint accessibility...');

    try {
      const accessCheck = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true
      });
      console.log('[Test] REST API endpoint response:', {
        status: accessCheck.status,
        statusText: accessCheck.statusText,
        data: accessCheck.data
      });
    } catch (accessError: any) {
      console.error('[Test] REST API endpoint check failed:', accessError.message);
    }

    // Now try the simplest possible REST API request
    console.log('[Test] Attempting minimal REST API request...');
    const minimalRequest = {
      method: 'get_module_fields',
      input_type: 'JSON',
      response_type: 'JSON',
      rest_data: {
        session: '',
        module_name: 'Accounts'
      }
    };

    console.log('[Test] Sending request:', JSON.stringify(minimalRequest, null, 2));

    const response = await axios.post(
      url,
      minimalRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000,
        validateStatus: () => true
      }
    );

    console.log('[Test] Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data || 'No data returned',
      headers: response.headers
    });

    if (response.status === 500) {
      // Try to diagnose the issue
      console.log('[Test] Checking configuration...');
      try {
        const configCheck = await axios.get(`${baseUrl}/service/v4_1/rest.php?method=get_available_modules`, {
          headers: { 'Accept': 'application/json' },
          validateStatus: () => true,
          timeout: 5000
        });
        console.log('[Test] Configuration check response:', configCheck.data);
      } catch (configError: any) {
        console.error('[Test] Configuration check failed:', configError.message);
      }
      return false;
    }

    return response.status === 200;
  } catch (error: any) {
    console.error('[Test] Test failed:', error.message);
    return false;
  }
}

// Run the test
console.log('Starting SuiteCRM REST API connectivity test...');
testRESTv4Connection().then(success => {
  console.log('\nTest result:', success ? 'SUCCESS' : 'FAILED');
  if (!success) {
    console.log('\nTroubleshooting steps:');
    console.log('1. Verify SuiteCRM REST API module is enabled');
    console.log('2. Check PHP error logs for detailed error messages');
    console.log('3. Verify REST API configuration in config.php');
    console.log('4. Ensure proper file permissions on cache directories');
    process.exit(1);
  }
  process.exit(0);
});


async function testSuiteCRMConnection() {
  try {
    console.log('\n=== SuiteCRM Connection Tests ===\n');

    // Test 1: Basic REST v4 API Connection
    console.log('1. Testing REST v4 API connection...');
    const restV4Available = await testRESTv4Connection();
    console.log(`REST v4 API connection: ${restV4Available ? 'SUCCESS' : 'FAILED'}`);

    if (!restV4Available) {
      console.log('\nTroubleshooting steps:');
      console.log('1. Verify SuiteCRM server is running');
      console.log('2. Check if REST v4 API is enabled in SuiteCRM');
      console.log('3. Verify the server URL is correct');
      console.log('4. Check server logs for any PHP or Apache errors');
      throw new Error('REST v4 API is not accessible');
    }

    // Test 2: Meeting Creation
    console.log('\n2. Testing meeting creation...');
    const result = await suiteCRMService.createConsultationMeeting({
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      notes: 'Test consultation',
      preferredDate: '2025-02-27',
      preferredTime: '15:30'
    });

    console.log('Meeting creation result:', result);

    return {
      success: true,
      details: {
        restV4Available,
        meetingCreated: result.success
      }
    };

  } catch (error) {
    console.error('Test suite failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        restV4Available: false,
        meetingCreated: false
      }
    };
  } finally {
    await cleanupTestData();
  }
}

// Run tests
console.log('Starting SuiteCRM integration tests...');
testSuiteCRMConnection().then(results => {
  console.log('\nTest Results:', results);
  if (!results.success) {
    process.exit(1);
  }
  process.exit(0);
});