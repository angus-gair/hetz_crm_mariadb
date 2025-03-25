import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

type EndpointStatus = {
  name: string;
  status: number;
  statusText: string;
  error?: string;
  data?: any;
};

type ConnectionResult = {
  success: boolean;
  message?: string;
  endpoints?: EndpointStatus[];
  timestamp?: string;
};

export default function CrmTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await fetch('/api/crm/test');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error testing CRM connection:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testConnection();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">SuiteCRM API Test</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Connection Test</CardTitle>
          <CardDescription>
            Test the connection to SuiteCRM REST API V8
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {result && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  {result.success ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">
                    {result.success ? 'Connection Successful' : 'Connection Failed'}
                  </h3>
                  <p className="text-sm text-gray-500">{result.message}</p>
                  {result.timestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                      Tested at: {new Date(result.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              {result.endpoints && result.endpoints.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Endpoint Details</h3>
                  <div className="space-y-3">
                    {result.endpoints.map((endpoint, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-md ${
                          endpoint.status >= 200 && endpoint.status < 300
                            ? 'bg-green-50 border border-green-100'
                            : 'bg-red-50 border border-red-100'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{endpoint.name}</h4>
                            <p className="text-sm">
                              Status: {endpoint.status} {endpoint.statusText}
                            </p>
                          </div>
                          <div>
                            {endpoint.status >= 200 && endpoint.status < 300 ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                        
                        {endpoint.error && (
                          <p className="text-sm text-red-600 mt-1">
                            Error: {endpoint.error}
                          </p>
                        )}
                        
                        {endpoint.data && (
                          <div className="mt-1 text-sm text-gray-600">
                            <pre className="text-xs overflow-auto p-2 bg-gray-50 rounded">
                              {JSON.stringify(endpoint.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!result && !error && testing && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-3">Testing connection...</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={testConnection} 
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test Connection Again'}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-xl font-bold">API Documentation</h2>
        <Card>
          <CardHeader>
            <CardTitle>REST API V8 Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-gray-50 rounded flex justify-between items-center">
                <div>
                  <span className="font-mono text-sm font-bold text-green-600">GET</span>
                  <span className="ml-2 font-mono text-sm">/api/crm/test</span>
                </div>
                <span className="text-sm text-gray-500">Test API connection</span>
              </div>
              
              <div className="p-2 bg-gray-50 rounded flex justify-between items-center">
                <div>
                  <span className="font-mono text-sm font-bold text-blue-600">POST</span>
                  <span className="ml-2 font-mono text-sm">/api/crm/leads</span>
                </div>
                <span className="text-sm text-gray-500">Create a new lead</span>
              </div>
              
              <div className="p-2 bg-gray-50 rounded flex justify-between items-center">
                <div>
                  <span className="font-mono text-sm font-bold text-blue-600">POST</span>
                  <span className="ml-2 font-mono text-sm">/api/crm/contacts</span>
                </div>
                <span className="text-sm text-gray-500">Create a new contact</span>
              </div>
              
              <div className="p-2 bg-gray-50 rounded flex justify-between items-center">
                <div>
                  <span className="font-mono text-sm font-bold text-blue-600">POST</span>
                  <span className="ml-2 font-mono text-sm">/api/crm/consultations</span>
                </div>
                <span className="text-sm text-gray-500">Schedule a consultation</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}