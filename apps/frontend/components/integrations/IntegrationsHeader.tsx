'use client'

import { CheckCircle, XCircle } from "lucide-react"
import { Alert } from "@/components/ui/alert"

interface IntegrationsHeaderProps {
  status?: 'success' | 'error';
  provider?: 'google' | 'microsoft';
  accountId?: string;
  error?: string;
}

export function IntegrationsHeader({ status, provider, accountId, error }: IntegrationsHeaderProps) {
  const getStatusMessage = () => {
    if (!status || !provider) return null;

    const providerName = provider === 'google' ? 'Google Calendar' : 'Microsoft Outlook';
    
    switch (status) {
      case 'success':
        return { 
          type: 'success', 
          text: `${providerName} connected successfully! ${accountId ? `Account ID: ${accountId}` : ''}`
        };
      case 'error':
        let errorText = `Failed to connect ${providerName}.`;
        if (error) {
          switch (error) {
            case 'access_denied':
              errorText += ' You denied access to your calendar.';
              break;
            case 'invalid_state':
              errorText += ' Security validation failed. Please try again.';
              break;
            case 'callback_failed':
              errorText += ' Connection failed during processing.';
              break;
            default:
              errorText += ` Error: ${error}`;
          }
        }
        return { type: 'error', text: errorText };
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
