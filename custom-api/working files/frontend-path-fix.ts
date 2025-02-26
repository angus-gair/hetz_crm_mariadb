// Update these lines in your AdminDashboard.tsx component

// Define the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/custom-api/api-proxy.php';

// Health check query - update the URL
const healthCheck = useQuery({
  queryKey: ['health-check'],
  queryFn: async () => {
    const response = await fetch(`${API_BASE_URL}/health`)
    if (!response.ok) throw new Error('Health check failed')
    return response.json()
  }
})

// Database check query - update the URL
const dbCheck = useQuery({
  queryKey: ['db-check'],
  queryFn: async () => {
    const response = await fetch(`${API_BASE_URL}/db-check`)
    if (!response.ok) throw new Error('Database check failed')
    return response.json()
  }
})

// In your API Test form, update the default values
const form = useForm<TestConfig>({
  resolver: zodResolver(testConfigSchema),
  defaultValues: {
    endpoint: `${API_BASE_URL}/contacts`,
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
