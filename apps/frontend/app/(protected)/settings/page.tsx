import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Account settings will be available once authentication is implemented</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar Preferences</CardTitle>
              <CardDescription>Customize how your calendars are displayed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Calendar preferences will be available in the next phase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>Control how your calendars sync</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Sync settings will be available once integrations are implemented</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
