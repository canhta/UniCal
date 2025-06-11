import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
          <p className="text-gray-600">Your unified calendar view</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Your events from all connected calendars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 mb-2">Calendar Integration Coming Soon</p>
              <p className="text-gray-600">We&apos;re working on integrating the calendar view with @event-calendar/core</p>
            </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
