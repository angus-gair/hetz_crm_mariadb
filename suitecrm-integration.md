SuiteCRM API Integration Package
Here's everything you need to integrate SuiteCRM with your new website:

1. SuiteCRM API Setup - Required Code
Directory Structure
Create the following directory structure in your project:

server/
  services/
    suitecrm/
      service.ts
      types.ts
      webhook.ts (optional - for future webhook support)
Essential Files
1. server/services/suitecrm/types.ts
This file defines all the TypeScript interfaces for the SuiteCRM API:

// SuiteCRM API Types
export interface SuiteCRMCredentials {
  url: string;
  username: string;
  password: string;
}
export interface SuiteCRMAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string | null;
  refresh_token: string;
}
// GraphQL specific types
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}
export interface RecordListResponse {
  recordList: {
    records: Array<{
      id: string;
      attributes: Record<string, any>;
    }>;
  };
}
export interface RecordResponse {
  record: {
    id: string;
    attributes: Record<string, any>;
  };
}
export interface SaveRecordResponse {
  saveRecord: {
    record: {
      id: string;
    };
  };
}
// Core entities
export interface SuiteCRMContact {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email1?: string;
  phone_work?: string;
  phone_mobile?: string;
  description?: string;
  date_entered?: string;
  date_modified?: string;
}
export interface SuiteCRMLead {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  status?: string;
  lead_source?: string;
  email1?: string;
  phone_work?: string;
  description?: string;
  opportunity_amount?: string;
  date_entered?: string;
}
export interface SuiteCRMNote {
  id: string;
  name?: string;
  description?: string;
  parent_type?: string;
  parent_id?: string;
  date_entered?: string;
}
export interface SuiteCRMDeal {
  id: string;
  name?: string;
  amount?: string;
  sales_stage?: string;
  description?: string;
  date_closed?: string;
  date_entered?: string;
}
export interface SuiteCRMError {
  error: string;
  error_description: string;
}
2. server/services/suitecrm/service.ts
This is the core service file that handles all SuiteCRM API interactions:

import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';
import https from 'https';
import { 
  SuiteCRMCredentials, 
  SuiteCRMAuthResponse, 
  SuiteCRMContact,
  SuiteCRMNote,
  SuiteCRMDeal,
  GraphQLResponse,
  SaveRecordResponse,
  RecordResponse
} from './types';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
/**
 * SuiteCRM GraphQL API Service
 * 
 * This service handles communication with the SuiteCRM GraphQL API.
 * It provides methods for authentication, and CRUD operations on contacts and notes.
 */
class SuiteCRMService {
  private axiosInstance: AxiosInstance;
  private graphqlAxiosInstance: AxiosInstance;
  private cache: NodeCache;
  private credentials: SuiteCRMCredentials;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  constructor() {
    // Get credentials from environment variables
    const baseUrl = process.env.SUITECRM_URL || 'https://your-suitecrm-instance.com';
    this.credentials = {
      url: baseUrl,
      username: process.env.SUITECRM_USERNAME || 'admin',
      password: process.env.SUITECRM_PASSWORD || 'password',
    };
    // Log initialization (mask credentials)
    console.log(`Initializing SuiteCRM client with URL: ${baseUrl}`);
    
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default cache
    
    // Create cookie jar for session-based authentication
    const jar = new CookieJar();
    
    // Allow self-signed certificates in development
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Create axios instance with cookie jar support
    this.axiosInstance = wrapper(axios.create({
      baseURL: this.credentials.url,
      withCredentials: true, 
      jar,
      headers: {
        'Accept': 'application/json',
      }
    }));
    // Create axios instance for GraphQL API calls with cookie jar
    this.graphqlAxiosInstance = this.axiosInstance;
    // Add response interceptor for error handling on GraphQL requests
    this.graphqlAxiosInstance.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Session might be expired or CSRF token invalid, try to re-authenticate
          await this.authenticate();
          
          // Retry the original request
          const originalRequest = error.config;
          return this.graphqlAxiosInstance(originalRequest);
        }
        return Promise.reject(error);
      }
    );
  }
  /**
   * Authenticates with the SuiteCRM API using session-based authentication
   */
  private async authenticate(): Promise<void> {
    try {
      console.log('Authenticating with SuiteCRM...');
      
      // First, get the initial page to receive session cookies
      const initialResponse = await this.axiosInstance.get('/');
      
      // Extract CSRF token from cookies
      const cookies = initialResponse.headers['set-cookie'];
      let csrfToken = '';
      
      if (Array.isArray(cookies)) {
        const csrfCookie = cookies.find(cookie => cookie.includes('XSRF-TOKEN='));
        if (csrfCookie) {
          const match = csrfCookie.match(/XSRF-TOKEN=([^;]+)/);
          if (match) {
            csrfToken = match[1];
          }
        }
      }
      
      if (!csrfToken) {
        console.error('Could not extract CSRF token from initial response');
        throw new Error('Authentication failed - could not extract CSRF token');
      }
      
      // Login using credentials
      const loginResponse = await this.axiosInstance.post('/login', {
        username: this.credentials.username,
        password: this.credentials.password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken
        }
      });
      
      // Check if login was successful
      if (loginResponse.status === 200 || loginResponse.status === 204) {
        console.log('Successfully authenticated with SuiteCRM');
        
        // Get the updated CSRF token after login
        const loginCookies = loginResponse.headers['set-cookie'];
        if (Array.isArray(loginCookies)) {
          const newCsrfCookie = loginCookies.find(cookie => cookie.includes('XSRF-TOKEN='));
          if (newCsrfCookie) {
            const match = newCsrfCookie.match(/XSRF-TOKEN=([^;]+)/);
            if (match) {
              csrfToken = match[1];
            }
          }
        }
        
        // Store the token expiry for 1 hour (typical session timeout)
        this.tokenExpiry = Date.now() + (3600 * 1000);
      } else {
        console.error('Login failed:', loginResponse.status, loginResponse.statusText);
        throw new Error(`Authentication failed with status ${loginResponse.status}`);
      }
    } catch (error) {
      console.error('SuiteCRM Authentication Error:', error);
      throw new Error('Failed to authenticate with SuiteCRM');
    }
  }
  /**
   * Makes sure the client is authenticated before making API calls
   */
  private async ensureAuthenticated(): Promise<void> {
    // Check if we need to re-authenticate
    if (!this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }
  /**
   * Executes a GraphQL query or mutation
   */
  private async executeGraphQL<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    await this.ensureAuthenticated();
    
    try {
      // For debug
      const operationType = query.includes('mutation') ? 'mutation' : 'query';
      console.log(`Executing GraphQL ${operationType}`);
      
      // Extract operation name for better logs
      const operationNameMatch = query.match(/mutation\s+(\w+)|query\s+(\w+)/);
      const operationName = operationNameMatch 
        ? (operationNameMatch[1] || operationNameMatch[2]) 
        : 'UnnamedOperation';
      
      // Extract CSRF token from cookies
      const cookies = await this.axiosInstance.get('/');
      let csrfToken = '';
      
      if (cookies.headers && cookies.headers['set-cookie']) {
        const setCookieHeader = cookies.headers['set-cookie'];
        if (Array.isArray(setCookieHeader)) {
          const csrfCookie = setCookieHeader.find(cookie => cookie.includes('XSRF-TOKEN='));
          if (csrfCookie) {
            const match = csrfCookie.match(/XSRF-TOKEN=([^;]+)/);
            if (match) {
              csrfToken = match[1];
            }
          }
        }
      }
      
      // Make GraphQL request with CSRF token if available
      const requestConfig: {
        headers: Record<string, string>;
        signal?: AbortSignal;
      } = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      if (csrfToken) {
        requestConfig.headers['X-XSRF-TOKEN'] = csrfToken;
      }
      
      // Create a controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 second timeout
      
      requestConfig.signal = controller.signal;
      
      const response = await this.axiosInstance.post<GraphQLResponse<T>>('/api/graphql', {
        query,
        variables
      }, requestConfig);
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      // Check for GraphQL errors
      if (response.data.errors && response.data.errors.length > 0) {
        console.error('GraphQL Errors:', response.data.errors);
        throw new Error(`GraphQL Error: ${response.data.errors[0].message}`);
      }
      
      // Check for missing data
      if (!response.data.data) {
        throw new Error('GraphQL response missing data field');
      }
      
      return response.data.data as T;
    } catch (error: any) {
      console.error('Error executing GraphQL query:', error.message || 'Unknown error');
      throw error;
    }
  }
  /**
   * Creates a contact from form data
   */
  async createContactFromForm(formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    message?: string;
  }): Promise<SuiteCRMContact> {
    try {
      // Check if contact already exists
      const existingContact = await this.searchContactByEmail(formData.email);
      
      // Prepare contact data
      const contactData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email1: formData.email,
        phone_work: formData.phone || '',
      };
      
      let contact;
      
      // If contact exists, update it
      if (existingContact) {
        console.log(`Updating existing contact with ID: ${existingContact.id}`);
        contact = await this.updateContact(existingContact.id, contactData);
      } else {
        // Create new contact
        console.log(`Creating new contact for email: ${formData.email}`);
        contact = await this.createContact(contactData);
      }
      
      // If message is provided, add it as a note
      if (formData.message && contact) {
        try {
          console.log(`Adding message note to contact ID: ${contact.id}`);
          
          await this.createNoteForContact(
            contact.id,
            `Message from ${formData.firstName} ${formData.lastName}`,
            formData.message
          );
        } catch (error) {
          // Don't fail the whole contact creation if note creation fails
          console.error('Error adding note to contact:', error);
        }
      }
      
      return contact;
    } catch (error) {
      console.error('Error in createContactFromForm:', error);
      throw error;
    }
  }
  /**
   * Creates a new contact in SuiteCRM
   */
  async createContact(properties: {
    first_name: string;
    last_name: string;
    email1: string;
    phone_work?: string;
    phone_mobile?: string;
    description?: string;
  }): Promise<SuiteCRMContact> {
    try {
      console.log(`Creating contact: ${properties.first_name} ${properties.last_name}`);
      
      const mutation = `
        mutation CreateContact($input: RecordInput!) {
          saveRecord(input: $input) {
            record {
              id
            }
          }
        }
      `;
      
      const variables = {
        input: {
          module: "Contacts",
          attributes: properties
        }
      };
      
      const result = await this.executeGraphQL<SaveRecordResponse>(mutation, variables);
      const contactId = result.saveRecord.record.id;
      
      console.log(`Contact created with ID: ${contactId}`);
      
      // Fetch the created contact to return full details
      return await this.getContact(contactId);
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }
  /**
   * Updates an existing contact in SuiteCRM
   */
  async updateContact(contactId: string, properties: {
    first_name?: string;
    last_name?: string;
    email1?: string;
    phone_work?: string;
    phone_mobile?: string;
    description?: string;
  }): Promise<SuiteCRMContact> {
    try {
      console.log(`Updating contact ID: ${contactId}`);
      
      const mutation = `
        mutation UpdateContact($input: RecordInput!) {
          saveRecord(input: $input) {
            record {
              id
            }
          }
        }
      `;
      
      const variables = {
        input: {
          module: "Contacts",
          id: contactId,
          attributes: properties
        }
      };
      
      await this.executeGraphQL<SaveRecordResponse>(mutation, variables);
      
      console.log(`Contact updated successfully`);
      
      // Fetch the updated contact to return full details
      return await this.getContact(contactId);
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }
  /**
   * Gets a contact by ID
   */
  async getContact(contactId: string): Promise<SuiteCRMContact> {
    try {
      console.log(`Getting contact with ID: ${contactId}`);
      
      const query = `
        query GetContact($id: ID!) {
          record(id: $id) {
            id
            attributes
          }
        }
      `;
      
      const variables = {
        id: contactId
      };
      
      const result = await this.executeGraphQL<RecordResponse>(query, variables);
      
      // Map fields to our contact structure
      const contact: SuiteCRMContact = {
        id: result.record.id,
        first_name: result.record.attributes.first_name,
        last_name: result.record.attributes.last_name,
        email1: result.record.attributes.email1,
        phone_work: result.record.attributes.phone_work,
        phone_mobile: result.record.attributes.phone_mobile,
        description: result.record.attributes.description,
        date_entered: result.record.attributes.date_entered,
        date_modified: result.record.attributes.date_modified
      };
      
      return contact;
    } catch (error) {
      console.error('Error getting contact:', error);
      throw error;
    }
  }
  /**
   * Searches for a contact by email address
   */
  async searchContactByEmail(email: string): Promise<SuiteCRMContact | null> {
    try {
      console.log(`Searching for contact with email: ${email}`);
      
      const query = `
        query SearchContacts($searchTerm: String!) {
          recordList(module: "Contacts", filter: { 
            filters: [
              { field: "email1", operator: "equals", value: [$searchTerm] }
            ] 
          }) {
            records {
              id
              attributes
            }
          }
        }
      `;
      
      const variables = {
        searchTerm: email
      };
      
      const result = await this.executeGraphQL<RecordListResponse>(query, variables);
      
      if (result.recordList.records.length === 0) {
        console.log('No contacts found with this email');
        return null;
      }
      
      // Use the first matching contact
      const record = result.recordList.records[0];
      
      // Map fields to our contact structure
      const contact: SuiteCRMContact = {
        id: record.id,
        first_name: record.attributes.first_name,
        last_name: record.attributes.last_name,
        email1: record.attributes.email1,
        phone_work: record.attributes.phone_work,
        phone_mobile: record.attributes.phone_mobile,
        description: record.attributes.description,
        date_entered: record.attributes.date_entered,
        date_modified: record.attributes.date_modified
      };
      
      console.log(`Found contact: ${contact.first_name} ${contact.last_name}`);
      return contact;
    } catch (error) {
      console.error('Error searching for contact:', error);
      throw error;
    }
  }
  /**
   * Creates a note for a contact
   */
  async createNoteForContact(contactId: string, title: string, content: string): Promise<SuiteCRMNote> {
    try {
      console.log(`Creating note for contact ID: ${contactId}`);
      
      const mutation = `
        mutation CreateNote($input: RecordInput!) {
          saveRecord(input: $input) {
            record {
              id
            }
          }
        }
      `;
      
      const variables = {
        input: {
          module: "Notes",
          attributes: {
            name: title,
            description: content,
            parent_type: "Contacts",
            parent_id: contactId
          }
        }
      };
      
      const result = await this.executeGraphQL<SaveRecordResponse>(mutation, variables);
      
      console.log(`Note created with ID: ${result.saveRecord.record.id}`);
      
      return {
        id: result.saveRecord.record.id,
        name: title,
        description: content,
        parent_type: "Contacts",
        parent_id: contactId,
        date_entered: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }
  /**
   * Creates a deal/opportunity in SuiteCRM
   */
  async createDeal(dealProperties: {
    name: string;
    amount?: string;
    sales_stage?: string;
    description?: string;
  }): Promise<SuiteCRMDeal> {
    try {
      console.log(`Creating deal: ${dealProperties.name}`);
      
      const mutation = `
        mutation CreateOpportunity($input: RecordInput!) {
          saveRecord(input: $input) {
            record {
              id
            }
          }
        }
      `;
      
      const variables = {
        input: {
          module: "Opportunities",
          attributes: {
            name: dealProperties.name,
            amount: dealProperties.amount || "0",
            sales_stage: dealProperties.sales_stage || "Prospecting",
            description: dealProperties.description || ""
          }
        }
      };
      
      const result = await this.executeGraphQL<SaveRecordResponse>(mutation, variables);
      
      console.log(`Deal created with ID: ${result.saveRecord.record.id}`);
      
      return {
        id: result.saveRecord.record.id,
        name: dealProperties.name,
        amount: dealProperties.amount,
        sales_stage: dealProperties.sales_stage,
        description: dealProperties.description,
        date_entered: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }
  /**
   * Associates a contact with a deal/opportunity
   */
  async associateContactToDeal(dealId: string, contactId: string): Promise<boolean> {
    try {
      console.log(`Associating contact ${contactId} with deal ${dealId}`);
      
      // Create a relationship between opportunity and contact
      const mutation = `
        mutation CreateRelationship($input: RelationshipInput!) {
          createRelationship(input: $input)
        }
      `;
      
      const variables = {
        input: {
          leftModule: "Opportunities",
          leftId: dealId,
          relationshipName: "contacts",
          rightId: contactId
        }
      };
      
      await this.executeGraphQL<{ createRelationship: boolean }>(mutation, variables);
      
      console.log('Association created successfully');
      return true;
    } catch (error) {
      console.error('Error associating contact with deal:', error);
      return false;
    }
  }
  /**
   * Simple test method to check if the connection to SuiteCRM is working
   * This just authenticates and returns true if successful
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch (error) {
      console.error('SuiteCRM connection test failed:', error);
      return false;
    }
  }
}
// Create singleton instance
const suiteCRMService = new SuiteCRMService();
export default suiteCRMService;
2. API Routes Integration
Create or modify your server routes file to include these endpoints:

// In server/routes.ts or similar file
import express from 'express';
import suiteCRMService from './services/suitecrm/service';
export function registerRoutes(app: express.Express) {
  // API health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });
  // SuiteCRM API test endpoint
  app.get("/api/crm/test", async (_req, res) => {
    try {
      console.log("SuiteCRM API test starting...");
      
      // Simplified test - just try to authenticate
      const isConnected = await suiteCRMService.testConnection();
      
      if (isConnected) {
        res.json({
          success: true,
          message: "SuiteCRM API connection is working correctly",
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error("Connection test returned false");
      }
    } catch (error: any) {
      console.error("SuiteCRM API test failed:", error);
      
      res.status(500).json({
        success: false,
        error: error.message || "Unknown error",
        message: "SuiteCRM API test failed. Check server logs for details."
      });
    }
  });
  // Create contact endpoint
  app.post("/api/crm/contacts", async (req, res) => {
    try {
      const contactData = {
        first_name: req.body.firstName || req.body.first_name || '',
        last_name: req.body.lastName || req.body.last_name || '',
        email1: req.body.email || req.body.email1 || '',
        phone_work: req.body.phone || req.body.phone_work || '',
        description: req.body.message || req.body.description || ''
      };
      
      console.log('Contact creation request data:', JSON.stringify({
        firstName: contactData.first_name,
        lastName: contactData.last_name,
        email1: contactData.email1
      }));
      
      const contact = await suiteCRMService.createContact(contactData);
      
      // Add note if message is provided
      if (req.body.message && contact.id) {
        await suiteCRMService.createNoteForContact(
          contact.id,
          `Message from ${contactData.first_name} ${contactData.last_name}`,
          req.body.message
        );
      }
      
      res.json({
        success: true,
        message: 'Contact created successfully',
        contact: {
          id: contact.id,
          name: `${contact.first_name} ${contact.last_name}`,
          email: contact.email1
        }
      });
    } catch (error: any) {
      console.error('Error creating contact:', error);
      
      res.status(500).json({
        success: false, 
        error: error.message || 'Failed to create contact'
      });
    }
  });
  
  // Search contact by email endpoint
  app.get("/api/crm/contacts/search", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Email is required' 
        });
      }
      
      console.log(`Searching for contact with email: ${email}`);
      
      const contact = await suiteCRMService.searchContactByEmail(email);
      
      if (contact) {
        console.log(`Contact found: ${contact.first_name} ${contact.last_name}`);
        return res.json({
          success: true,
          contact,
          message: 'Contact found'
        });
      } else {
        console.log(`No contact found with email: ${email}`);
        return res.json({
          success: true,
          contact: null,
          message: 'No contact found with this email address'
        });
      }
    } catch (error: any) {
      console.error('Error searching for contact:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search for contact'
      });
    }
  });
  // Create deal/opportunity endpoint
  app.post("/api/crm/deals", async (req, res) => {
    try {
      const dealData = {
        name: req.body.name,
        amount: req.body.amount,
        sales_stage: req.body.sales_stage,
        description: req.body.description
      };
      
      console.log('Deal creation request:', JSON.stringify({
        name: dealData.name,
        amount: dealData.amount
      }));
      
      const deal = await suiteCRMService.createDeal(dealData);
      
      // Associate with contact if contactId is provided
      if (req.body.contactId) {
        await suiteCRMService.associateContactToDeal(deal.id, req.body.contactId);
      }
      
      res.json({
        success: true,
        message: 'Deal created successfully',
        deal: {
          id: deal.id,
          name: deal.name
        }
      });
    } catch (error: any) {
      console.error('Error creating deal:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create deal'
      });
    }
  });
  // Add more CRM routes as needed
  return app;
}
3. Environment Variables Setup
Create or modify your .env file to include these SuiteCRM-related variables:

# SuiteCRM Configuration
SUITECRM_URL=https://your-suitecrm-instance.com
SUITECRM_USERNAME=admin
SUITECRM_PASSWORD=password
SUITECRM_WEBHOOK_SECRET=your_webhook_secret_here
4. Test HTML Page Setup
Create a test page at client/public/suitecrm-test.html to verify the API integration:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuiteCRM API Test</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.5;
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1, h2 {
            color: #333;
        }
        button {
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        button:hover {
            background-color: #0051a8;
        }
        input, textarea {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            width: 100%;
            box-sizing: border-box;
            margin-bottom: 10px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        pre {
            background-color: #f7f7f7;
            padding: 15px;
            border-radius: 4px;
            overflow: auto;
            font-size: 13px;
            max-height: 300px;
        }
        .success {
            color: #10b981;
        }
        .error {
            color: #ef4444;
        }
        .loading {
            position: relative;
            background-color: #f8f9fa;
            color: #666;
        }
        .loading::after {
            content: '';
            position: absolute;
            top: 15px;
            right: 15px;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top-color: #0070f3;
            animation: loader-rotate 1s linear infinite;
        }
        @keyframes loader-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <h1>SuiteCRM API Test</h1>
    
    <div class="container">
        <div class="card">
            <h2>Health Check</h2>
            <button id="healthCheckBtn">Test API Health</button>
            <pre id="healthCheckResult">Results will appear here...</pre>
        </div>
        <div class="card">
            <h2>SuiteCRM Test</h2>
            <button id="suiteTestBtn">Test SuiteCRM Connection</button>
            <pre id="suiteTestResult">Results will appear here...</pre>
        </div>
        <div class="card">
            <h2>Create Contact</h2>
            <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" value="John">
            </div>
            <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" value="Doe">
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" value="john.doe@example.com">
            </div>
            <div class="form-group">
                <label for="phone">Phone</label>
                <input type="text" id="phone" value="123-456-7890">
            </div>
            <div class="form-group">
                <label for="message">Message (Optional)</label>
                <textarea id="message" rows="3">This is a test message from the API integration.</textarea>
            </div>
            <button id="createContactBtn">Create Contact</button>
            <pre id="createContactResult">Results will appear here...</pre>
        </div>
        <div class="card">
            <h2>Search Contact by Email</h2>
            <div class="form-group">
                <label for="searchEmail">Email</label>
                <input type="email" id="searchEmail" value="john.doe@example.com">
            </div>
            <button id="searchContactBtn">Search Contact</button>
            <pre id="searchContactResult">Results will appear here...</pre>
        </div>
    </div>
    <script>
        // Helper function to make API calls
        async function callApi(endpoint, method = 'GET', data = null) {
            try {
                // Show loading state for the API call
                const resultElementId = endpoint.includes('health') ? 'healthCheckResult' : 
                                        endpoint.includes('test') ? 'suiteTestResult' :
                                        endpoint.includes('search') ? 'searchContactResult' : 'createContactResult';
                
                const resultElement = document.getElementById(resultElementId);
                if (resultElement) {
                    resultElement.textContent = "Loading... This may take up to 30 seconds...";
                    resultElement.classList.remove('success', 'error');
                    resultElement.classList.add('loading');
                }
                
                const options = {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
                
                if (data) {
                    options.body = JSON.stringify(data);
                }
                
                console.log(`Making ${method} request to /api/${endpoint}`);
                
                // Set a timeout for the fetch call
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                options.signal = controller.signal;
                
                const response = await fetch(`/api/${endpoint}`, options);
                clearTimeout(timeoutId);
                
                console.log(`Response status: ${response.status}`);
                
                const result = await response.json();
                console.log('API result:', result);
                
                // Remove loading class
                if (resultElement) {
                    resultElement.classList.remove('loading');
                }
                
                return { success: true, data: result };
            } catch (error) {
                console.error('API call failed:', error);
                return { success: false, error: error.message };
            }
        }
        // Helper function to update result elements
        function updateResult(elementId, result, isSuccess = true) {
            const element = document.getElementById(elementId);
            
            // Make sure we have a clean element (no loading state)
            element.classList.remove('loading', 'success', 'error');
            
            // Format the response nicely
            try {
                if (typeof result === 'string') {
                    element.textContent = result;
                } else {
                    element.textContent = JSON.stringify(result, null, 2);
                }
            } catch (e) {
                element.textContent = "Error formatting result: " + e.message;
            }
            
            // Apply appropriate styling
            if (isSuccess) {
                element.classList.add('success');
            } else {
                element.classList.add('error');
            }
        }
        // Set up event listeners when the page loads
        window.addEventListener('load', () => {
            console.log('Setting up event listeners...');
            
            // Health Check
            document.getElementById('healthCheckBtn').addEventListener('click', async () => {
                console.log('Health check button clicked');
                try {
                    const result = await callApi('health');
                    console.log('Health check result:', result);
                    updateResult('healthCheckResult', result.data, result.success);
                } catch (err) {
                    console.error('Health check error:', err);
                    updateResult('healthCheckResult', { error: err.message }, false);
                }
            });
            // SuiteCRM Test
            document.getElementById('suiteTestBtn').addEventListener('click', async () => {
                console.log('SuiteCRM test button clicked');
                try {
                    const result = await callApi('crm/test');
                    console.log('SuiteCRM test result:', result);
                    
                    if (!result.success) {
                        updateResult('suiteTestResult', { error: "API call failed" }, false);
                        return;
                    }
                    
                    if (result.data.error) {
                        updateResult('suiteTestResult', result.data, false);
                        return;
                    }
                    
                    updateResult('suiteTestResult', result.data, true);
                } catch (err) {
                    console.error('SuiteCRM test error:', err);
                    updateResult('suiteTestResult', { error: err.message }, false);
                }
            });
            // Create Contact
            document.getElementById('createContactBtn').addEventListener('click', async () => {
                console.log('Create contact button clicked');
                try {
                    const data = {
                        firstName: document.getElementById('firstName').value,
                        lastName: document.getElementById('lastName').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        message: document.getElementById('message').value
                    };
                    
                    const result = await callApi('crm/contacts', 'POST', data);
                    console.log('Create contact result:', result);
                    
                    if (!result.success) {
                        updateResult('createContactResult', { error: "API call failed" }, false);
                        return;
                    }
                    
                    if (result.data.error) {
                        updateResult('createContactResult', result.data, false);
                        return;
                    }
                    
                    updateResult('createContactResult', result.data, true);
                    
                    // Update the search email field with the email we just used
                    document.getElementById('searchEmail').value = data.email;
                } catch (err) {
                    console.error('Create contact error:', err);
                    updateResult('createContactResult', { error: err.message }, false);
                }
            });
            // Search Contact
            document.getElementById('searchContactBtn').addEventListener('click', async () => {
                console.log('Search contact button clicked');
                try {
                    const email = document.getElementById('searchEmail').value;
                    const result = await callApi(`crm/contacts/search?email=${encodeURIComponent(email)}`);
                    console.log('Search contact result:', result);
                    updateResult('searchContactResult', result.data, result.data?.success);
                } catch (err) {
                    console.error('Search contact error:', err);
                    updateResult('searchContactResult', { error: err.message }, false);
                }
            });
            
            // Run health check on page load
            callApi('health').then(result => {
                console.log('Initial health check result:', result);
                updateResult('healthCheckResult', result.data, result.success);
            }).catch(err => {
                console.error('Initial health check error:', err);
                updateResult('healthCheckResult', { error: err.message }, false);
            });
            
            console.log('Event listeners set up successfully');
        });
    </script>
</body>
</html>
5. Contact Form Integration
To integrate SuiteCRM with your contact form, use this JavaScript code:

// Contact form submission handler
async function handleContactFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const statusMessage = form.querySelector('.status-message') || document.createElement('div');
  
  if (!form.querySelector('.status-message')) {
    statusMessage.className = 'status-message';
    form.appendChild(statusMessage);
  }
  
  // Disable submit button and show loading state
  submitButton.disabled = true;
  statusMessage.textContent = 'Sending...';
  statusMessage.className = 'status-message loading';
  
  try {
    // Get form data
    const formData = {
      firstName: form.querySelector('[name="firstName"]').value,
      lastName: form.querySelector('[name="lastName"]').value,
      email: form.querySelector('[name="email"]').value,
      phone: form.querySelector('[name="phone"]')?.value || '',
      message: form.querySelector('[name="message"]')?.value || ''
    };
    
    // Validate form data
    if (!formData.firstName || !formData.lastName || !formData.email) {
      throw new Error('Please fill out all required fields');
    }
    
    // Send to API
    const response = await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to submit form');
    }
    
    // Show success message
    statusMessage.textContent = 'Thank you! Your message has been sent.';
    statusMessage.className = 'status-message success';
    
    // Reset form
    form.reset();
  } catch (error) {
    // Show error message
    statusMessage.textContent = error.message || 'Something went wrong. Please try again.';
    statusMessage.className = 'status-message error';
    console.error('Contact form submission error:', error);
  } finally {
    // Re-enable submit button
    submitButton.disabled = false;
  }
}
// Add event listener to contact form
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
});

6. Installation Instructions
Create Required Directories:

mkdir -p server/services/suitecrm
Install Required Dependencies:

npm install axios tough-cookie axios-cookiejar-support node-cache
Create Configuration Files:

Create the .env file with SuiteCRM credentials
Add the types.ts file
Add the service.ts file
Add the routes to your Express server
Test the Integration:

Access /suitecrm-test.html in your browser
Test the API connection
Try creating a contact
Verify that the contact appears in your SuiteCRM instance
7. Troubleshooting Guide
Connection Issues:

Verify that the SuiteCRM URL is correct and accessible
Check that your username and password are correct
Ensure that you have proper network access to your SuiteCRM instance
Authentication Errors:

Check the server logs for specific authentication errors
Verify that the SuiteCRM instance allows API access
Ensure that CORS is properly configured on the SuiteCRM server
HTTPS/SSL Issues:

For development, we set NODE_TLS_REJECT_UNAUTHORIZED='0' to allow self-signed certificates
For production, ensure you have proper SSL certificates configured
Data Validation Errors:

Check that required fields are properly filled out
Verify that data formats match what SuiteCRM expects
Common SuiteCRM Error Messages:

"Authentication failed" - Check credentials and URL
"Could not extract CSRF token" - SuiteCRM instance may be misconfigured
"Module not found" - Verify that the module names are correct (Contacts, Notes, etc.)
8. Additional Information
SuiteCRM GraphQL API: This integration uses SuiteCRM's GraphQL API which offers more powerful querying capabilities than the REST API.

Security Considerations:

Store credentials securely using environment variables
In production, ensure you're using HTTPS
Consider implementing rate limiting for API endpoints
Performance Optimization:

The implementation includes caching to reduce API calls
Authentication tokens are reused until they expire
Extending the Integration:

To add more modules, follow the pattern used for Contacts
Update the types.ts file with new interfaces
Add new methods to the service.ts file
Create corresponding API endpoints in routes.ts
This integration provides a solid foundation for connecting your website with SuiteCRM for contact management. You can extend it as needed to support additional CRM functionality like leads, opportunities, or custom modules.