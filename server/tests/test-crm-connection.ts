import axios from 'axios';
import crypto from 'crypto';

async function testSuiteCRMConnection() {
  const baseUrl = process.env.SUITECRM_URL?.replace(/\/$/, '') || '';
  const username = process.env.SUITECRM_USERNAME || '';
  const password = process.env.SUITECRM_PASSWORD || '';
  
  console.log('Testing SuiteCRM connection...');
  
  try {
    // Test basic connection
    const testResponse = await axios.get(`${baseUrl}/service/v4/rest.php`);
    console.log('Basic connection test:', {
      status: testResponse.status,
      contentType: testResponse.headers['content-type']
    });

    // Test authentication
    const passwordMd5 = crypto.createHash('md5').update(password).digest('hex');
    const loginResponse = await axios.post(`${baseUrl}/service/v4/rest.php`, {
      method: 'login',
      input_type: 'JSON',
      response_type: 'JSON',
      rest_data: {
        user_auth: {
          user_name: username,
          password: passwordMd5,
          version: '4'
        },
        application_name: 'CubbyLuxe Integration'
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Authentication test:', {
      status: loginResponse.status,
      responseType: typeof loginResponse.data,
      hasSessionId: !!loginResponse.data?.id
    });

    return true;
  } catch (error: any) {
    console.error('Test failed:', {
      message: error.message,
      response: error.response?.data
    });
    return false;
  }
}

testSuiteCRMConnection();
