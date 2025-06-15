'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chrome, Mail } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { useState } from "react"

export function ConnectAccountButtons() {
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleGoogleConnect = async () => {
    try {
      setConnecting('google')
      
      // Get OAuth URL from our new integrations endpoint
      const { url } = await apiClient.getOAuthUrl('google')
      
      // Redirect to OAuth URL
      window.location.href = url
    } catch (error) {
      console.error('Failed to initiate Google OAuth:', error)
      setConnecting(null)
      // In a real app, you'd show a toast/alert here
    }
  }

  const handleMicrosoftConnect = async () => {
    try {
      setConnecting('microsoft')
      
      // Get OAuth URL from our new integrations endpoint
      const { url } = await apiClient.getOAuthUrl('microsoft')
      
      // Redirect to OAuth URL
      window.location.href = url
    } catch (error) {
      console.error('Failed to initiate Microsoft OAuth:', error)
      setConnecting(null)
      // In a real app, you'd show a toast/alert here
    }
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
            disabled={connecting === 'google'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {connecting === 'google' ? 'Connecting...' : 'Connect Google Calendar'}
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
            disabled={connecting === 'microsoft'}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {connecting === 'microsoft' ? 'Connecting...' : 'Connect Outlook Calendar'}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
