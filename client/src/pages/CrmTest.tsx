import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useQuery, useMutation } from '@tanstack/react-query';

export default function CrmTest() {
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState('');
  
  // Test SuiteCRM Connection
  const { data: connectionTest, isLoading: isTestingConnection, refetch: retestConnection } = useQuery({
    queryKey: ['/api/crm/test-connection'],
    queryFn: async () => {
      const response = await fetch('/api/crm/test-connection');
      if (!response.ok) {
        throw new Error('Failed to test connection');
      }
      return response.json();
    },
    enabled: false,
  });

  // Get Auth Token
  const { mutate: getToken, isPending: isGettingToken } = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/crm/get-token');
      if (!response.ok) {
        throw new Error('Failed to get token');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        setToken(data.token);
        setShowToken(true);
      }
    },
  });

  // Create Lead
  const { mutate: createLead, isPending: isCreatingLead } = useMutation({
    mutationFn: async (leadData: any) => {
      const response = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });
      if (!response.ok) {
        throw new Error('Failed to create lead');
      }
      return response.json();
    },
  });

  // Create Consultation
  const { mutate: createConsultation, isPending: isCreatingConsultation } = useMutation({
    mutationFn: async (consultationData: any) => {
      const response = await fetch('/api/crm/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData),
      });
      if (!response.ok) {
        throw new Error('Failed to create consultation');
      }
      return response.json();
    },
  });

  const handleTestConnection = () => {
    retestConnection();
  };

  const handleGetToken = () => {
    getToken();
  };

  const handleCreateTestLead = () => {
    createLead({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '123-456-7890',
      message: 'Test lead from CRM test page',
      company: 'Test Company'
    });
  };

  const handleCreateTestConsultation = () => {
    createConsultation({
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      notes: 'Test consultation from CRM test page',
      preferredDate: new Date().toISOString().split('T')[0],
      preferredTime: '10:00',
    });
  };

  return (
    <div className="container mx-auto p-4 py-20">
      <h1 className="text-3xl font-bold mb-8">SuiteCRM Integration Test</h1>
      
      <Tabs defaultValue="auth">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="auth" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Connection Test</CardTitle>
                <CardDescription>
                  Test SuiteCRM API connection
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectionTest && (
                  <Alert className={connectionTest.success ? 'bg-green-50' : 'bg-red-50'}>
                    {connectionTest.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertTitle>{connectionTest.success ? 'Connected' : 'Connection Failed'}</AlertTitle>
                    <AlertDescription>
                      {connectionTest.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                {connectionTest && connectionTest.endpoints && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold mb-2">Endpoint Status:</h3>
                    <div className="space-y-2">
                      {connectionTest.endpoints.map((endpoint: any, index: number) => (
                        <div key={index} className="text-sm border rounded p-2">
                          <div className="font-medium">{endpoint.name}</div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                endpoint.status >= 200 && endpoint.status < 300
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            <span>{endpoint.status} {endpoint.statusText}</span>
                          </div>
                          {endpoint.error && (
                            <div className="text-red-600 text-xs mt-1">{endpoint.error}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Authentication Token</CardTitle>
                <CardDescription>
                  Get SuiteCRM authentication token
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showToken && (
                  <div className="p-2 bg-gray-100 rounded-md overflow-auto max-h-[200px]">
                    <pre className="text-xs whitespace-pre-wrap break-all">
                      {token}
                    </pre>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  onClick={handleGetToken} 
                  disabled={isGettingToken}
                >
                  {isGettingToken ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Getting Token...
                    </>
                  ) : (
                    'Get Token'
                  )}
                </Button>
                {showToken && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(token);
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="leads" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Test Lead</CardTitle>
              <CardDescription>
                Create a test lead in SuiteCRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                This will create a test lead with the following information:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                <li>Name: Test User</li>
                <li>Email: test@example.com</li>
                <li>Phone: 123-456-7890</li>
                <li>Company: Test Company</li>
                <li>Status: New</li>
                <li>Source: Web Site</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCreateTestLead} 
                disabled={isCreatingLead}
              >
                {isCreatingLead ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Creating Lead...
                  </>
                ) : (
                  'Create Test Lead'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="consultations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Test Consultation</CardTitle>
              <CardDescription>
                Create a test consultation (meeting) in SuiteCRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                This will create a test consultation with the following information:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm">
                <li>Name: Test User</li>
                <li>Email: test@example.com</li>
                <li>Phone: 123-456-7890</li>
                <li>Preferred Date: Today</li>
                <li>Preferred Time: 10:00</li>
                <li>Notes: Test consultation from CRM test page</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCreateTestConsultation} 
                disabled={isCreatingConsultation}
              >
                {isCreatingConsultation ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Creating Consultation...
                  </>
                ) : (
                  'Create Test Consultation'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}