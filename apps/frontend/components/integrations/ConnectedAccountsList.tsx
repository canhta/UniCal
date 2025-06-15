'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { 
  Chrome, 
  Mail, 
  Settings, 
  Unlink, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { ConnectedAccountResponseDto } from "@unical/core"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface ConnectedAccount extends ConnectedAccountResponseDto {
  syncStatus?: 'IDLE' | 'SYNC_IN_PROGRESS' | 'INITIAL_SYNC_PENDING' | 'ERROR' | 'DISABLED' | 'WEBHOOK_ACTIVE';
  lastSyncedAt?: string;
  syncErrorDetails?: string;
}

export function ConnectedAccountsList() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchConnectedAccounts()
  }, [])

  const fetchConnectedAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getConnectedAccounts()
      // For now, mock sync status - in real implementation this would come from backend
      const accountsWithStatus = data.map(account => ({
        ...account,
        syncStatus: 'WEBHOOK_ACTIVE' as const,
        lastSyncedAt: new Date().toISOString()
      }))
      setAccounts(accountsWithStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connected accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (accountId: string, provider: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${provider} account? This will stop syncing events from this account.`)) {
      return
    }

    try {
      setDisconnecting(accountId)
      await apiClient.disconnectAccount(accountId)
      setAccounts(prev => prev.filter(account => account.id !== accountId))
      // Show success message - in a real app you might use a toast notification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect account')
    } finally {
      setDisconnecting(null)
    }
  }

  const handleManageCalendars = (accountId: string) => {
    router.push(`/integrations/${accountId}/calendars`)
  }

  const [syncing, setSyncing] = useState<string | null>(null)

  const handleRefreshSync = async (accountId: string) => {
    try {
      setSyncing(accountId)
      const result = await apiClient.manualSync(accountId)
      console.log('Manual sync triggered:', result)
      // In a real app, you might show a success toast here
      // You could also refresh the accounts list to update sync status
      await fetchConnectedAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger sync')
    } finally {
      setSyncing(null)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return <Chrome className="h-5 w-5 text-blue-600" />
      case 'microsoft':
        return <Mail className="h-5 w-5 text-blue-500" />
      default:
        return <Settings className="h-5 w-5 text-gray-500" />
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'Google Calendar'
      case 'microsoft':
        return 'Microsoft Outlook'
      default:
        return provider
    }
  }

  const getSyncStatusBadge = (status?: string) => {
    switch (status) {
      case 'WEBHOOK_ACTIVE':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case 'SYNC_IN_PROGRESS':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Syncing
          </Badge>
        )
      case 'INITIAL_SYNC_PENDING':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending Setup
          </Badge>
        )
      case 'ERROR':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      case 'DISABLED':
        return (
          <Badge variant="secondary">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Disabled
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  const formatLastSync = (lastSyncedAt?: string) => {
    if (!lastSyncedAt) return 'Never'
    try {
      return `Last synced: ${format(new Date(lastSyncedAt), 'MMM d, h:mm a')}`
    } catch {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading connected accounts...
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error" className="mb-4">
        <XCircle className="h-4 w-4" />
        <div>
          <p>Failed to load connected accounts</p>
          <p className="text-sm mt-1">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchConnectedAccounts}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </Alert>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg mb-2">No accounts connected yet</p>
        <p className="text-sm text-gray-500">Connect your first calendar account above to get started with UniCal sync</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <div 
          key={account.id} 
          className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getProviderIcon(account.provider)}
              <div>
                <h3 className="font-medium text-gray-900">
                  {getProviderName(account.provider)}
                </h3>
                <p className="text-sm text-gray-600">
                  {account.accountEmail || account.providerAccountId}
                </p>
                <p className="text-xs text-gray-500">
                  {formatLastSync(account.lastSyncedAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {getSyncStatusBadge(account.syncStatus)}
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRefreshSync(account.id)}
                  disabled={syncing === account.id}
                  className="text-xs"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${syncing === account.id ? 'animate-spin' : ''}`} />
                  {syncing === account.id ? 'Syncing...' : 'Sync'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageCalendars(account.id)}
                  className="text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Calendars
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(account.id, getProviderName(account.provider))}
                  disabled={disconnecting === account.id}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {disconnecting === account.id ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Unlink className="h-3 w-3 mr-1" />
                  )}
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
          
          {account.syncStatus === 'ERROR' && account.syncErrorDetails && (
            <Alert variant="error" className="mt-3">
              <XCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Sync Error</p>
                <p className="text-sm mt-1">{account.syncErrorDetails}</p>
              </div>
            </Alert>
          )}
        </div>
      ))}
      
      <div className="pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={fetchConnectedAccounts}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All Accounts
        </Button>
      </div>
    </div>
  )
}
