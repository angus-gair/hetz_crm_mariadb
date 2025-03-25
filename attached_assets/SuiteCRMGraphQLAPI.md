# SuiteCRM GraphQL API Integration Guide

## API Endpoints

```
# Development Environment
Base URL: http://116.203.18.62:8080
API Version: v8
GraphQL Endpoint: http://116.203.18.62:8080/api/graphql
Authentication Endpoint: http://116.203.18.62:8080/api/login
Lead Form URL: http://116.203.18.62:8081

# Production Environment
Base URL: https://116.203.18.62
API Version: v8
GraphQL Endpoint: https://116.203.18.62/api/graphql
OAuth2 Token Endpoint: https://116.203.18.62/oauth/access_token
```

## Authentication Credentials (Development)

```
Client ID: api_user
Client Secret: suitecrm123
Grant Type: client_credentials
```

## Security Requirements

1. Always use HTTPS for all API calls
2. Store credentials securely (use environment variables in production)
3. Implement proper error handling and logging
4. Use OAuth2 token authentication for all requests
5. Validate and sanitize all input data
6. Implement rate limiting in your application
7. Set appropriate CORS headers for web applications

## Integration Steps

### 1. Authentication

```javascript
// API Configuration
const API_CONFIG = {
    baseUrl: 'https://116.203.18.62',
    clientId: 'api_user',
    clientSecret: 'suitecrm123',
    tokenEndpoint: '/oauth/access_token',
    graphqlEndpoint: '/api/graphql'
};

// Get OAuth2 Token
async function getAccessToken() {
    const tokenResponse = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.tokenEndpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: API_CONFIG.clientId,
            client_secret: API_CONFIG.clientSecret
        })
    });

    if (!tokenResponse.ok) {
        throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
}
```

### 2. Making GraphQL Queries

```javascript
async function queryGraphQL(query, variables = {}) {
    try {
        // Get fresh access token
        const accessToken = await getAccessToken();

        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.graphqlEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.errors) {
            console.error('GraphQL Errors:', result.errors);
            throw new Error('GraphQL query failed');
        }

        return result.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

## Example Operations

### Error Handling Best Practices

```javascript
const API_CONFIG = {
    baseUrl: 'https://116.203.18.62',
    clientId: 'api_user',
    clientSecret: 'suitecrm123',
    tokenEndpoint: '/oauth/access_token',
    graphqlEndpoint: '/api/graphql'
};

// Reusable error handling
class APIError extends Error {
    constructor(message, type, response) {
        super(message);
        this.name = 'APIError';
        this.type = type;
        this.response = response;
    }
}

// Token management
let tokenData = null;

async function getValidToken() {
    if (tokenData && tokenData.expires_at > Date.now()) {
        return tokenData.access_token;
    }

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.tokenEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: API_CONFIG.clientId,
                client_secret: API_CONFIG.clientSecret
            })
        });

        if (!response.ok) {
            throw new APIError('Token request failed', 'AUTH_ERROR', response);
        }

        const data = await response.json();
        tokenData = {
            access_token: data.access_token,
            expires_at: Date.now() + (data.expires_in * 1000)
        };
        return tokenData.access_token;
    } catch (error) {
        console.error('Authentication failed:', error);
        throw new APIError('Failed to obtain access token', 'AUTH_ERROR', error);
    }
}

// Reusable GraphQL client
async function graphqlRequest(query, variables = {}, retries = 1) {
    try {
        const token = await getValidToken();
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.graphqlEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                const retryAfter = response.headers.get('Retry-After') || 5;
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return graphqlRequest(query, variables, retries - 1);
            }
            throw new APIError('GraphQL request failed', 'API_ERROR', response);
        }

        const result = await response.json();
        if (result.errors) {
            throw new APIError('GraphQL errors', 'GRAPHQL_ERROR', result.errors);
        }

        return result.data;
    } catch (error) {
        console.error('GraphQL request failed:', error);
        throw error;
    }
}
```

### Common Operations with Error Handling

```javascript
// Create a new lead with validation
async function createLead(leadData) {
    // Input validation
    const requiredFields = ['first_name', 'last_name', 'email1'];
    const missingFields = requiredFields.filter(field => !leadData[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email1)) {
        throw new Error('Invalid email format');
    }

    const mutation = `
        mutation CreateLead($input: saveRecordInput!) {
            saveRecord(input: $input) {
                record {
                    id
                    type
                    attributes {
                        first_name
                        last_name
                        email1
                        status
                    }
                }
            }
        }
    `;

    try {
        const result = await graphqlRequest(mutation, {
            input: {
                module: 'Leads',
                attributes: {
                    ...leadData,
                    status: leadData.status || 'New'
                }
            }
        });
        return result.saveRecord.record;
    } catch (error) {
        if (error.type === 'AUTH_ERROR') {
            console.error('Authentication failed. Please check your credentials.');
        } else if (error.type === 'GRAPHQL_ERROR') {
            console.error('Failed to create lead:', error.response);
        }
        throw error;
    }
}

// Search leads with pagination
async function searchLeads({ searchTerm, page = 1, pageSize = 10 }) {
    const query = `
        query SearchLeads($filter: filterInput, $pagination: paginationInput) {
            recordList(module: "Leads", filter: $filter, pagination: $pagination) {
                records {
                    id
                    attributes {
                        first_name
                        last_name
                        email1
                        status
                        created_by
                        date_entered
                    }
                }
                meta {
                    total_count
                    current_page
                    per_page
                }
            }
        }
    `;

    try {
        const result = await graphqlRequest(query, {
            filter: {
                filters: [
                    { 
                        field: "first_name",
                        operator: "CONTAINS",
                        value: searchTerm
                    },
                    {
                        field: "last_name",
                        operator: "CONTAINS",
                        value: searchTerm
                    },
                    {
                        field: "email1",
                        operator: "CONTAINS",
                        value: searchTerm
                    }
                ],
                operator: "OR"
            },
            pagination: {
                offset: (page - 1) * pageSize,
                limit: pageSize
            }
        });

        return result.recordList;
    } catch (error) {
        console.error('Failed to search leads:', error);
        throw error;
    }
}
```

### Usage Examples

```javascript
// Create a new lead
try {
    const newLead = await createLead({
        first_name: 'John',
        last_name: 'Doe',
        email1: 'john.doe@example.com',
        phone_work: '1234567890',
        lead_source: 'Web Form'
    });
    console.log('Lead created:', newLead);
} catch (error) {
    console.error('Lead creation failed:', error.message);
}

// Search leads with pagination
try {
    const searchResult = await searchLeads({
        searchTerm: 'john',
        page: 1,
        pageSize: 10
    });
    console.log(`Found ${searchResult.meta.total_count} leads`);
    console.log('Leads:', searchResult.records);
} catch (error) {
    console.error('Search failed:', error.message);
}
```

### Fetching Leads

```javascript
const getLeadsQuery = `
query {
    recordList(module: "Leads", limit: 10) {
        records {
            id
            attributes {
                first_name
                last_name
                email1
                phone_work
            }
        }
    }
}`;

// Usage
const leads = await queryGraphQL(getLeadsQuery);
```

### Creating a Lead

```javascript
const createLeadMutation = `
mutation CreateLead($input: saveRecordInput!) {
    saveRecord(input: $input) {
        record {
            id
        }
    }
}`;

const variables = {
    input: {
        module: "Leads",
        attributes: {
            first_name: "John",
            last_name: "Doe",
            email1: "john@example.com",
            phone_work: "1234567890",
            status: "New"
        }
    }
};

// Usage
const newLead = await queryGraphQL(createLeadMutation, variables);
```

## Error Handling

```javascript
try {
    const result = await queryGraphQL(query, variables);
    if (result.errors) {
        console.error('GraphQL Errors:', result.errors);
        return;
    }
    // Process successful response
    console.log(result.data);
} catch (error) {
    console.error('Network or other error:', error);
}
```

## Important Notes

- The API uses OAuth2 client credentials flow
- Access tokens expire after 1 hour by default
- Always store credentials securely (use environment variables)
- Use HTTPS for all API calls
- Implement proper error handling and token refresh logic
- The GraphQL API supports queries, mutations, and subscriptions
- CORS is restricted to the SuiteCRM domain for security
- Rate limiting is enabled to prevent abuse
- Client IP verification is enabled
- Anonymous API access is disabled

## Available Modules

- Leads
- Contacts
- Accounts
- Opportunities
- Cases
- Tasks
- Meetings
- Calls

## Environment Variables

Required environment variables for production:
```
SUITECRM_ENABLE_API=yes
SUITECRM_API_ENABLE_OAUTH2=yes
SUITECRM_API_OAUTH2_CLIENT_ID=api_user
SUITECRM_API_OAUTH2_CLIENT_SECRET=suitecrm123
SUITECRM_VERIFY_CLIENT_IP=yes
```

## Production Setup

### Directory Structure
```
production/
├── config/
│   ├── .env                 # Environment variables
│   ├── docker-compose.yml   # Container configuration
│   └── nginx.conf          # Web server configuration
├── public/
│   └── index.html          # Lead capture form
├── docs/
│   └── SuiteCRMGraphQLAPI.md  # API documentation
└── scripts/
    └── deploy.sh           # Deployment script
```

### Performance Settings
The following performance settings are configured:
- PHP Memory Limit: 512M
- Max Execution Time: 300s
- Max Input Time: 300s

### Health Checks
- MariaDB: Checks every 15s
- SuiteCRM: Checks every 30s
- Lead Form: Nginx health check enabled

## Rate Limiting and Security

### Rate Limiting
The API implements rate limiting to prevent abuse:
- Default limit: 100 requests per minute per IP
- Authenticated requests have higher limits
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

### CORS Configuration
CORS is configured for security:
- Only the SuiteCRM domain is allowed
- Allowed methods: GET, POST, OPTIONS
- Required headers are allowed:
  - Authorization
  - Content-Type
  - X-Requested-With
  - Cache-Control

### IP Verification
- Client IP verification is enabled
- Requests must come from whitelisted IPs
- Configure `SUITECRM_VERIFY_CLIENT_IP=yes` in production

## Troubleshooting Guide

### Common Issues and Solutions

1. Authentication Failures
```javascript
// Problem: Token request fails
Response: { error: "invalid_client" }
// Solution: Check client credentials and ensure HTTPS is used
const API_CONFIG = {
    baseUrl: 'https://116.203.18.62',  // Must use HTTPS in production
    clientId: process.env.SUITECRM_CLIENT_ID,  // Use environment variables
    clientSecret: process.env.SUITECRM_CLIENT_SECRET
};
```

2. Rate Limiting
```javascript
// Problem: Too many requests
Response: { status: 429, headers: { 'Retry-After': '5' } }
// Solution: Implement exponential backoff
async function retryWithBackoff(fn, retries = 3, backoff = 1000) {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        if (error.response?.status === 429) {
            const retryAfter = parseInt(error.response.headers.get('Retry-After')) || 5;
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return retryWithBackoff(fn, retries - 1, backoff * 2);
        }
        throw error;
    }
}
```

3. CORS Issues
```javascript
// Problem: CORS errors in browser
// Solution: Add proper headers in your web server
app.use(cors({
    origin: 'https://116.203.18.62',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
```

### Debugging Tools

1. Request Logging
```javascript
const debugGraphQL = async (query, variables) => {
    console.log('Request:', {
        query,
        variables,
        timestamp: new Date().toISOString()
    });
    try {
        const result = await graphqlRequest(query, variables);
        console.log('Response:', result);
        return result;
    } catch (error) {
        console.error('Error:', {
            message: error.message,
            type: error.type,
            response: error.response
        });
        throw error;
    }
};
```

2. Health Check
```javascript
async function checkAPIHealth() {
    try {
        const query = '{ appMetadata { version } }';
        const result = await graphqlRequest(query);
        return {
            status: 'healthy',
            version: result.appMetadata.version,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}
```

### Performance Optimization

1. Batch Operations
```javascript
// Batch create multiple leads
async function batchCreateLeads(leads, batchSize = 10) {
    const batches = [];
    for (let i = 0; i < leads.length; i += batchSize) {
        batches.push(leads.slice(i, i + batchSize));
    }

    const results = [];
    for (const batch of batches) {
        const mutation = `
            mutation BatchCreateLeads($inputs: [saveRecordInput!]!) {
                batch: saveRecords(input: $inputs) {
                    records {
                        id
                        type
                        attributes {
                            first_name
                            last_name
                            email1
                        }
                    }
                }
            }
        `;

        try {
            const result = await graphqlRequest(mutation, {
                inputs: batch.map(lead => ({
                    module: 'Leads',
                    attributes: lead
                }))
            });
            results.push(...result.batch.records);
        } catch (error) {
            console.error(`Batch operation failed:`, error);
            throw error;
        }
    }
    return results;
}
```

2. Caching
```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedData(key, fetchFn) {
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const data = await fetchFn();
    cache.set(key, { data, timestamp: now });
    return data;
}

// Example usage with lead lists
async function getLeadList(filters) {
    const cacheKey = `leads:${JSON.stringify(filters)}`;
    return getCachedData(cacheKey, () => searchLeads(filters));
}
```

## Testing the Integration

### Test Authentication
```bash
# Development environment
curl -X POST http://116.203.18.62:8080/oauth/access_token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "client_id=api_user" \
  --data-urlencode "client_secret=suitecrm123"

# Production environment (HTTPS)
curl -k -X POST https://116.203.18.62/oauth/access_token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "client_id=api_user" \
  --data-urlencode "client_secret=suitecrm123"

# Note: 
# 1. The -k flag is used to skip SSL certificate verification in development
# 2. Use --data-urlencode to properly encode special characters
# 3. The OAuth2 token endpoint is /oauth/access_token as per SuiteCRM's standard configuration
```

### Test GraphQL Query
```bash
# Replace YOUR_ACCESS_TOKEN with the token received from authentication
curl -X POST https://116.203.18.62/api/graphql \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ appMetadata { modules { name } } }"}'
```

## Common GraphQL Queries

### Get Module Metadata
```graphql
query {
  moduleMetadata(moduleName: "Leads") {
    fields {
      name
      type
      required
    }
  }
}
```

### Search Records
```graphql
query {
  recordList(
    module: "Leads"
    filter: {
      filters: [
        { field: "email1", operator: CONTAINS, value: "@example.com" }
      ]
    }
    limit: 10
  ) {
    records {
      id
      attributes {
        first_name
        last_name
        email1
      }
    }
  }
}
```

### Update Record
```graphql
mutation UpdateLead($id: ID!) {
  saveRecord(input: {
    module: "Leads"
    id: $id
    attributes: {
      status: "Converted"
    }
  }) {
    record {
      id
    }
  }
}
```

## Security Best Practices

1. Store credentials in environment variables
2. Implement rate limiting
3. Use HTTPS for all API calls
4. Regularly rotate client secrets
5. Implement proper error handling
6. Log all API interactions
7. Validate input data before sending

## Rate Limits and Performance

- Implement exponential backoff for retries
- Cache frequently accessed data
- Batch operations when possible
- Monitor API usage and response times
- Handle rate limiting gracefully
