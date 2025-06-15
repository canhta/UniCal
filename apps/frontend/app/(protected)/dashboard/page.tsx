"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiClient } from "@/lib/api/client";
import { useState } from "react";

export default function DashboardPage() {
  const authState = useAuth();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testApiCall = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Test making an authenticated API call
      const user = await apiClient.getCurrentUser();
      setTestResult(`✅ API call successful! User: ${user.email}`);
    } catch (error) {
      setTestResult(
        `❌ API call failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your unified calendar dashboard
          </p>
        </div>

        {/* Authentication Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">🔐 Authentication Status</CardTitle>
            <CardDescription>Current authentication and token status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>NextAuth Status:</span>
                <span
                  className={`font-medium ${
                    authState.isAuthenticated ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {authState.isAuthenticated
                    ? "✓ Authenticated"
                    : "✗ Not Authenticated"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>UniCal Tokens:</span>
                <span
                  className={`font-medium ${
                    authState.hasUniCalTokens ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {authState.isLoading
                    ? "⏳ Loading..."
                    : authState.hasUniCalTokens
                    ? "✓ Connected"
                    : "✗ Not Connected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API Client Status:</span>
                <span
                  className={`font-medium ${
                    authState.hasUniCalTokens ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {authState.hasUniCalTokens
                    ? "✓ Ready for API calls"
                    : "⚠ No tokens available"}
                </span>
              </div>
              {authState.user && (
                <div className="mt-4 p-3 bg-gray-100 rounded">
                  <h4 className="font-medium mb-2">User Info from Backend:</h4>
                  <div className="text-sm space-y-1">
                    <div>ID: {authState.user.id}</div>
                    <div>Email: {authState.user.email}</div>
                    <div>Name: {authState.user.name || "Not set"}</div>
                    <div>
                      Email Verified:{" "}
                      {authState.user.emailVerified ? "Yes" : "No"}
                    </div>
                    <div>Timezone: {authState.user.timeZone || "Not set"}</div>
                    <div>
                      Created:{" "}
                      {new Date(authState.user.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              {authState.error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                  <strong>Error:</strong> {authState.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📅 Quick View</CardTitle>
              <CardDescription>Jump to your calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Link href="/calendar">Open Calendar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔗 Integrations</CardTitle>
              <CardDescription>Connect your calendars</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Link href="/integrations">Manage Integrations</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚙️ Settings</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Link href="/settings">View Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* API Testing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">🧪 API Testing</CardTitle>
            <CardDescription>Test your API connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={testApiCall}
                className="w-full"
                disabled={isTesting}
              >
                {isTesting ? "Testing..." : "Test API Call"}
              </Button>
              {testResult && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    testResult.startsWith("✅")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {testResult}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest calendar events and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">No recent activity</p>
                  <p className="text-sm text-gray-600">
                    Connect your calendars to see events here
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
