import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@headlessui/react"

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
          <p className="text-gray-600">Connect and manage your calendar platforms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Google Calendar
              </CardTitle>
              <CardDescription>
                Connect your Google Calendar to sync events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Connect Google Calendar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📧</span>
                Microsoft Outlook
              </CardTitle>
              <CardDescription>
                Connect your Outlook Calendar to sync events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Connect Outlook Calendar</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Manage your connected calendar accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600">No accounts connected yet</p>
              <p className="text-sm text-gray-500 mt-2">Connect your first calendar account above to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
