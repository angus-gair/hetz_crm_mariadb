import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Test configuration schema
const testConfigSchema = z.object({
  endpoint: z.string().default("/api/contacts"),
  method: z.string().default("POST"),
  payload: z.string().default("{}"),
  headers: z.string().default('{"Content-Type": "application/json"}')
})

type TestConfig = z.infer<typeof testConfigSchema>

export default function AdminDashboard() {
  const { toast } = useToast()
  const [logs, setLogs] = React.useState<string[]>([])

  // Form for API testing
  const form = useForm<TestConfig>({
    resolver: zodResolver(testConfigSchema),
    defaultValues: {
      endpoint: "/api/contacts",
      method: "POST",
      payload: JSON.stringify({
        first_name: "Test",
        last_name: "User",
        email: "test@example.com"
      }, null, 2),
      headers: JSON.stringify({
        "Content-Type": "application/json"
      }, null, 2)
    }
  })

  // Health check query
  const healthCheck = useQuery({
    queryKey: ['/health'],
    queryFn: async () => {
      const response = await fetch('/health')
      if (!response.ok) throw new Error('Health check failed')
      return response.json()
    }
  })

  // Database check query
  const dbCheck = useQuery({
    queryKey: ['/api/db-check'],
    queryFn: async () => {
      const response = await fetch('/api/db-check')
      if (!response.ok) throw new Error('Database check failed')
      return response.json()
    }
  })

  // API test mutation
  const testMutation = useMutation({
    mutationFn: async (data: TestConfig) => {
      const startTime = performance.now()

      try {
        // Parse JSON strings
        const payload = JSON.parse(data.payload)
        const headers = JSON.parse(data.headers)

        // Add to logs
        setLogs(prev => [...prev, `[${new Date().toISOString()}] Sending ${data.method} request to ${data.endpoint}`])
        setLogs(prev => [...prev, `Request payload: ${JSON.stringify(payload, null, 2)}`])
        setLogs(prev => [...prev, `Request headers: ${JSON.stringify(headers, null, 2)}`])

        // Make request
        const response = await fetch(data.endpoint, {
          method: data.method,
          headers,
          body: data.method !== 'GET' ? JSON.stringify(payload) : undefined
        })

        const responseData = await response.json()
        const duration = performance.now() - startTime

        // Log response
        setLogs(prev => [
          ...prev,
          `[${new Date().toISOString()}] Response ${response.status} (${duration.toFixed(2)}ms)`,
          `Response data: ${JSON.stringify(responseData, null, 2)}`
        ])

        return responseData
      } catch (error) {
        // Log error details
        setLogs(prev => [
          ...prev, 
          `[${new Date().toISOString()}] Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error && error.stack ? `Stack trace: ${error.stack}` : ''
        ].filter(Boolean))
        throw error
      }
    },
    onSuccess: () => {
      toast({
        title: "Test completed",
        description: "API request completed successfully",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  function onSubmit(data: TestConfig) {
    testMutation.mutate(data)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">API Admin Dashboard</h1>

      {/* System Status */}
      <section className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>API Health:</span>
              {healthCheck.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : healthCheck.isError ? (
                <span className="text-red-500">●</span>
              ) : (
                <span className="text-green-500">●</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Database:</span>
              {dbCheck.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : dbCheck.isError ? (
                <span className="text-red-500">●</span>
              ) : (
                <span className="text-green-500">●</span>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Test Statistics</h2>
          <div className="space-y-2">
            <div>Total Tests: {logs.length}</div>
            <div>Success Rate: {testMutation.isError ? "Failed" : "Passed"}</div>
          </div>
        </Card>
      </section>

      {/* API Tester */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">API Tester</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="endpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payload"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Payload (JSON)</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="font-mono" rows={6} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headers (JSON)</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="font-mono" rows={4} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={testMutation.isPending}
              >
                {testMutation.isPending ? "Testing..." : "Run Test"}
              </Button>
            </form>
          </Form>
        </Card>
      </section>

      {/* Logs Display */}
      <section>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Request Logs</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-auto max-h-96">
            {logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">{log}</div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}