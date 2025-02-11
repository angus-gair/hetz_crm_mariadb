import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';

const TEST_CONNECTION_QUERY = `
  query TestConnection {
    testSuiteCRMConnection {
      success
      message
      endpoints {
        name
        status
        statusText
        error
        data
      }
    }
  }
`;

export default function SuiteCRMTest() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: TEST_CONNECTION_QUERY
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      toast({
        title: 'Connection Test Complete',
        description: data.data.testSuiteCRMConnection.message,
        variant: data.data.testSuiteCRMConnection.success ? 'default' : 'destructive'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to test SuiteCRM connection';
      console.error('Connection test failed:', error);
      setError(errorMessage);
      toast({
        title: 'Connection Test Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(result);
      toast({
        title: 'Copied!',
        description: 'Test results copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy results to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">SuiteCRM API Test (GraphQL)</h2>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button 
            onClick={testConnection}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Testing Connection...' : 'Test SuiteCRM Connection'}
          </Button>

          {result && (
            <Button
              onClick={copyResults}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Results
            </Button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            <h3 className="font-semibold">Error Details:</h3>
            <pre className="mt-2 text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Connection Test Results:</h3>
            <pre className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}