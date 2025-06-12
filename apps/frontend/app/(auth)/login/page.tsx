'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from 'next-auth/react';

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
            <Button className="w-full" onClick={() => signIn('credentials')}>
              Sign in with Email
            </Button>
            <Button className="w-full" onClick={() => signIn('google')}>
              Sign in with Google
            </Button>
            {/* <Button className="w-full" onClick={() => signIn('microsoft')}>
              Sign in with Microsoft
            </Button> */}
          </div>
          <div className="text-center mt-4">
            <span>Don&apos;t have an account? </span>
            <Link href="/auth/register" className="text-blue-600 hover:underline">Register</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
