import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample data structure matching the original interface
const sampleData = {
  logs: [
    {
      id: 1,
      ipAddress: "192.168.1.1",
      endpoint: "/api/design",
      method: "GET",
      statusCode: 200,
      timestamp: "2024-02-01T10:00:00Z",
      userAgent: "Mozilla/5.0",
      responseTime: 120
    },
    // Add more sample entries as needed
  ],
  analytics: {
    totalRequests: 150,
    uniqueIPs: 45,
    endpointCounts: {
      "/api/design": 50,
      "/api/calculate": 30,
      "/api/preview": 70
    },
    statusCodeCounts: {
      "200": 140,
      "404": 8,
      "500": 2
    },
    avgResponseTime: 145.5
  }
};

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">IP Analytics Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sampleData.analytics.totalRequests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unique IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sampleData.analytics.uniqueIPs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sampleData.analytics.avgResponseTime.toFixed(2)}ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {((sampleData.analytics.statusCodeCounts["200"] || 0) / sampleData.analytics.totalRequests * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Analytics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Popular Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endpoint</TableHead>
                <TableHead className="text-right">Requests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(sampleData.analytics.endpointCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([endpoint, count]) => (
                  <TableRow key={endpoint}>
                    <TableCell>{endpoint}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Response Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                  <TableCell>{log.method}</TableCell>
                  <TableCell>{log.endpoint}</TableCell>
                  <TableCell>{log.statusCode}</TableCell>
                  <TableCell className="text-right">{log.responseTime}ms</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}