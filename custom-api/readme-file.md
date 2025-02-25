# SuiteCRM Modular API Proxy

A modular API proxy for SuiteCRM that enables seamless integration with your web application without dealing with CSRF tokens or complex API structures.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Directory Structure](#directory-structure)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Module Usage Examples](#module-usage-examples)
- [React Components](#react-components)
- [Extending the API](#extending-the-api)

## Overview

This API proxy provides a streamlined interface to SuiteCRM functionality, focusing on the most common use cases for website integration:

- Contact form submissions
- Consultation booking
- Available time slots fetching
- Basic CRM data access

The modular architecture allows for easy maintenance and extension while providing robust error handling, validation, and security features.

## Installation

1. Clone this repository into your SuiteCRM installation directory:

```bash
cd /path/to/suitecrm
git clone https://github.com/your-repo/suitecrm-api-proxy.git custom-api
```

2. Configure the API by editing `custom-api/config.php`:

```php
return [
    'db' => [
        'host' => 'your-db-host',
        'user' => 'your-db-user',
        'pass' => 'your-db-password',
        'name' => 'your-db-name'
    ],
    'suitecrm' => [
        'path' => '/absolute/path/to/suitecrm/' 
    ],
    // Other configuration options...
];
```

3. Make sure the directory is accessible via your web server:

```
http://your-suitecrm-domain/custom-api/api-proxy.php
```

## Directory Structure

```
custom-api/
│
├── api-proxy.php          # Main entry point
├── config.php             # Configuration
├── core/
│   ├── auth.php           # Authentication
│   ├── database.php       # Database connection
│   ├── response.php       # Standardized responses
│   └── error.php          # Error handling
│
├── modules/
│   ├── contacts/          # Contact form handling
│   ├── meetings/          # Booking system
│   └── accounts/          # Account management
│
└── utils/
    ├── validation.php     # Input validation
    └── formatter.php      # Data formatting
```

## API Endpoints

### Contacts Module

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/contacts` | GET | List contacts |
| `/contacts/{id}` | GET | Get a single contact |
| `/contacts` | POST | Create a new contact |
| `/contacts/{id}` | PUT | Update a contact |
| `/contacts/{id}` | DELETE | Delete a contact |
| `/contacts/search` | GET | Search for contacts |

### Meetings Module

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/meetings` | GET | List meetings |
| `/meetings/{id}` | GET | Get a single meeting |
| `/meetings/available` | GET | Get available time slots |
| `/meetings/book` | POST | Book a new consultation |
| `/meetings/{id}` | PUT | Update a meeting |
| `/meetings/{id}` | DELETE | Delete a meeting |
| `/meetings/cancel/{id}` | POST | Cancel a meeting |

## Authentication

All API requests (except for public endpoints) require OAuth2 authentication using a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_OAUTH_TOKEN
```

To generate a token, use the SuiteCRM OAuth2 process. The tokens must be stored in the `oauth2tokens` table.

## Module Usage Examples

### Creating a Contact

```javascript
const response = await axios.post('http://your-domain/custom-api/api-proxy.php/contacts', {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone_mobile: '555-123-4567',
  description: 'Interested in your services',
  marketingConsent: true
}, {
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Checking Available Time Slots

```javascript
const response = await axios.get('http://your-domain/custom-api/api-proxy.php/meetings/available', {
  params: { 
    date: '2023-03-15',
    duration: 60
  },
  headers: {
    'Authorization': `Bearer ${apiToken}`
  }
});
```

### Booking a Consultation

```javascript
const response = await axios.post('http://your-domain/custom-api/api-proxy.php/meetings/book', {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-123-4567',
  date: '2023-03-15',
  time: '14:00:00',
  notes: 'I want to discuss your services',
  type: 'consultation'
}, {
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  }
});
```

## React Components

This package includes React components for easy integration with your frontend:

- `ContactForm` - For submitting contact form entries to SuiteCRM
- `ConsultationBookingForm` - For booking consultations with available time slots

### Example Usage

```jsx
import { ContactForm, ConsultationBookingForm } from './components';

const App = () => {
  const apiConfig = {
    apiUrl: 'http://your-domain/custom-api/api-proxy.php',
    apiToken: 'your-oauth-token'
  };

  return (
    <div className="container">
      <h1>Get in Touch</h1>
      <ContactForm 
        {...apiConfig}
        onSuccess={(data) => console.log('Form submitted successfully', data)}
        onError={(error) => console.error('Form submission failed', error)}
      />
      
      <h1>Book a Consultation</h1>
      <ConsultationBookingForm 
        {...apiConfig}
        onSuccess={(data) => console.log('Booking successful', data)}
        onError={(error) => console.error('Booking failed', error)}
      />
    </div>
  );
};
```

## Extending the API

To add a new module:

1. Create a new directory under `modules/` for your module
2. Create a `routes.php` file that handles the routing logic
3. Create additional files for specific functionality
4. Add your module to the main router in `api-proxy.php`

Example for a new `products` module:

```php
// modules/products/routes.php
class ProductsRoutes {
    // Implementation...
}

// api-proxy.php - Add to the switch statement
case 'products':
    require_once(__DIR__ . '/modules/products/routes.php');
    $handler = new ProductsRoutes($db, $config);
    break;
```

## Security Considerations

- Always validate and sanitize all input
- Use prepared statements for database queries
- Implement rate limiting for production use
- Consider adding IP whitelisting for sensitive operations
- Review permissions in SuiteCRM to ensure API accounts have appropriate access

## License

This project is licensed under the MIT License - see the LICENSE file for details.
