const fetch = require('node-fetch');

// Simple helper for fetching
async function fetchAPI(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const data = await response.json();
  return { status: response.status, statusText: response.statusText, data };
}

async function testSuiteCRMConnection() {
  console.log('Testing SuiteCRM API connection...');
  
  try {
    // Query the GraphQL endpoint to test SuiteCRM connection
    const response = await fetchAPI('http://localhost:5000/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: `
          query TestConnection {
            testSuiteCRMConnection {
              success
              message
              endpoints {
                name
                status
                statusText
                error
              }
            }
          }
        `
      })
    });
    
    console.log('Connection Test Results:');
    console.log(JSON.stringify(response, null, 2));
    
    if (response.data?.data?.testSuiteCRMConnection?.success) {
      console.log('\n✅ SuiteCRM connection test successful!');
    } else {
      console.log('\n❌ SuiteCRM connection test failed!');
      
      if (response.data?.data?.testSuiteCRMConnection?.endpoints) {
        const endpoints = response.data.data.testSuiteCRMConnection.endpoints;
        console.log('\nEndpoint Details:');
        endpoints.forEach(endpoint => {
          console.log(`\nEndpoint: ${endpoint.name}`);
          console.log(`Status: ${endpoint.status} (${endpoint.statusText})`);
          if (endpoint.error) {
            console.log(`Error: ${endpoint.error}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error testing connection:', error);
  }
}

// Run the test
testSuiteCRMConnection();