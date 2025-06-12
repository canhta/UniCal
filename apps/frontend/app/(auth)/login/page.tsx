'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to UniCal</CardTitle>
          <CardDescription>
            Sign in to access your unified calendar portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">
                Sign in with Email
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
