'use client'

import { CheckCircle, XCircle } from "lucide-react"
import { Alert } from "@/components/ui/alert"

interface IntegrationsHeaderProps {
  status?: 'success_google' | 'success_microsoft' | 'error_google' | 'error_microsoft';
  message?: string;
}

export function IntegrationsHeader({ status, message }: IntegrationsHeaderProps) {
  const getStatusMessage = () => {
    switch (status) {
      case 'success_google':
        return { type: 'success', text: 'Google Calendar connected successfully!' };
      case 'success_microsoft':
        return { type: 'success', text: 'Microsoft Outlook connected successfully!' };
      case 'error_google':
        return { type: 'error', text: message || 'Failed to connect Google Calendar. Please try again.' };
      case 'error_microsoft':
        return { type: 'error', text: message || 'Failed to connect Microsoft Outlook. Please try again.' };
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
      <p className="text-gray-600 mb-4">Connect and manage your calendar platforms with real-time sync</p>
      
      {statusInfo && (
        <Alert variant={statusInfo.type as 'success' | 'error'} className="mb-4">
          {statusInfo.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <div>{statusInfo.text}</div>
        </Alert>
      )}
    </div>
  )
}
