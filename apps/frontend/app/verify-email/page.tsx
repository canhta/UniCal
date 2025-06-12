'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    if (token) {
      apiClient.verifyEmail(token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    }
  }, [token]);

  if (status === 'pending') return <p>Verifying...</p>;
  if (status === 'success') return <p>Email verified! You can now log in.</p>;
  return <p>Verification failed. Please check your link or contact support.</p>;
} 