import { useState } from 'react';
import { suiteCrmClient } from '@/lib/suitecrm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SuiteCRMTest() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const version = await suiteCrmClient.testConnection();
      setResult(JSON.stringify(version, null, 2));
      toast({
        title: 'Connection Successful',
        description: 'Successfully connected to SuiteCRM API',
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to SuiteCRM',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">SuiteCRM API Test</h2>
      <Button 
        onClick={testConnection}
        disabled={isLoading}
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </Button>
      {result && (
        <pre className="p-4 bg-gray-100 rounded-lg overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
}
