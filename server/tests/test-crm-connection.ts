import axios from 'axios';
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

async function testRESTv4Connection(): Promise<boolean> {
  try {
    console.log('[Test] Testing REST v4 API connection...');
    const response = await axios.post(
      'http://4.236.188.48/service/v4_1/rest.php',
      {
        method: 'get_server_info',
        input_type: 'JSON',
        response_type: 'JSON',
        rest_data: {}
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    console.log('[Test] Server info response:', {
      status: response.status,
      data: response.data
    });

    return response.status === 200;
  } catch (error) {
    console.error('[Test] REST v4 connection test failed:', error);
    return false;
  }
}

async function testSuiteCRMConnection() {
  try {
    console.log('\n=== SuiteCRM Connection Tests ===\n');

    // Test 1: Basic REST v4 API Connection
    console.log('1. Testing REST v4 API connection...');
    const restV4Available = await testRESTv4Connection();
    console.log(`REST v4 API connection: ${restV4Available ? 'SUCCESS' : 'FAILED'}`);

    if (!restV4Available) {
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
      error: error instanceof Error ? error.message : 'Unknown error'
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