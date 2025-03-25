import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';

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
      preferredDate: '2025-03-26', // Set to March 26, 2025 to match our calendar test
      preferredTime: '10:00',
    });
  };

  return (
    <div className="container mx-auto p-4 py-20">
      <h1 className="text-3xl font-bold mb-8">SuiteCRM Integration Test</h1>
      
      <Tabs defaultValue="auth">
        <TabsList className="grid w-full md:w-[500px] grid-cols-4">
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
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
                <li>Preferred Date: March 26, 2025</li>
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
        
        <TabsContent value="calendar" className="mt-4">
          <CalendarContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Calendar content component
function CalendarContent() {
  const targetDate = '2025-03-26'; // March 26, 2025
  const formattedDate = format(new Date(targetDate), 'MMMM d, yyyy');
  
  const { 
    data: calendarData, 
    isLoading: isLoadingCalendar, 
    error: calendarError,
    refetch: refetchCalendar 
  } = useQuery({
    queryKey: [`/api/crm/calendar/${targetDate}`],
    queryFn: async () => {
      const response = await fetch(`/api/crm/calendar/${targetDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      return response.json();
    },
    // Refresh every 10 seconds to check for new meetings
    refetchInterval: 10000,
  });
  
  const meetings = calendarData?.meetings || [];
  
  return (
    <div>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Meetings Calendar
            </CardTitle>
            <CardDescription>
              View scheduled meetings for {formattedDate}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetchCalendar()}
            disabled={isLoadingCalendar}
          >
            {isLoadingCalendar ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {calendarError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load calendar data: {String(calendarError)}
              </AlertDescription>
            </Alert>
          ) : isLoadingCalendar ? (
            <div className="flex items-center justify-center p-8">
              <Clock className="mr-2 h-6 w-6 animate-spin" />
              <span>Loading meetings...</span>
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No meetings scheduled for this date.</p>
              <p className="text-sm mt-2">Try creating a test consultation to see it appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-medium">
                {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'} scheduled for {formattedDate}
              </div>
              
              <div className="space-y-3">
                {meetings.map((meeting: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{meeting.name}</h3>
                      <div className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                        {meeting.status}
                      </div>
                    </div>
                    
                    {meeting.dateStart && (
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(meeting.dateStart).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {meeting.duration.hours > 0 && ` (${meeting.duration.hours}h${meeting.duration.minutes > 0 ? ` ${meeting.duration.minutes}m` : ''})`}
                        </span>
                      </div>
                    )}
                    
                    {meeting.location && (
                      <div className="text-sm text-gray-500 mt-1">
                        Location: {meeting.location}
                      </div>
                    )}
                    
                    {meeting.description && (
                      <>
                        <Separator className="my-2" />
                        <div className="text-sm mt-2">
                          <div className="font-medium mb-1">Notes:</div>
                          <div className="text-gray-600 whitespace-pre-line">
                            {meeting.description.length > 150 
                              ? `${meeting.description.substring(0, 150)}...` 
                              : meeting.description
                            }
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}