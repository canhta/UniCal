'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chrome, Mail } from "lucide-react"

export function ConnectAccountButtons() {
  const handleGoogleConnect = () => {
    // Navigate to backend OAuth initiation endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000'}/auth/google/connect`
  }

  const handleMicrosoftConnect = () => {
    // Navigate to backend OAuth initiation endpoint  
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3000'}/auth/microsoft/connect`
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Chrome className="h-6 w-6 text-blue-600" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to enable two-way sync of events and real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGoogleConnect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Connect Google Calendar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-blue-500" />
            Microsoft Outlook
          </CardTitle>
          <CardDescription>
            Connect your Outlook Calendar to enable two-way sync of events and real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleMicrosoftConnect}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Connect Outlook Calendar
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
