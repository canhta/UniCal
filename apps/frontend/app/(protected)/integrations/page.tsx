import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { ConnectedAccountsList } from "@/components/integrations/ConnectedAccountsList"
import { ConnectAccountButtons } from "@/components/integrations/ConnectAccountButtons"
import { IntegrationsHeader } from "@/components/integrations/IntegrationsHeader"

interface IntegrationsPageProps {
  searchParams: Promise<{
    status?: 'success' | 'error';
    provider?: 'google' | 'microsoft';
    accountId?: string;
    error?: string;
  }>
}

export default async function IntegrationsPage({ searchParams }: IntegrationsPageProps) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <IntegrationsHeader 
          status={params.status} 
          provider={params.provider}
          accountId={params.accountId}
          error={params.error}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ConnectAccountButtons />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Manage your connected calendar accounts and sync settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="flex items-center justify-center py-8">Loading connected accounts...</div>}>
              <ConnectedAccountsList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
