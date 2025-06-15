import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { ConnectedAccountsList } from "@/components/integrations/ConnectedAccountsList"
import { ConnectAccountButtons } from "@/components/integrations/ConnectAccountButtons"
import { IntegrationsHeader } from "@/components/integrations/IntegrationsHeader"

interface IntegrationsPageProps {
  searchParams: {
    status?: 'success_google' | 'success_microsoft' | 'error_google' | 'error_microsoft';
    message?: string;
  }
}

export default function IntegrationsPage({ searchParams }: IntegrationsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <IntegrationsHeader status={searchParams.status} message={searchParams.message} />

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
