'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (res.ok) {
      // Auto-login after registration
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.ok) {
        router.push('/');
      } else {
        router.push('/auth/login');
      }
    } else {
      const data = await res.json();
      setError(data.message || 'Registration failed');
    }
  }

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-bold">Register</h2>
      {error && <div className="text-red-500">{error}</div>}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="input"
      />
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="input"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="input"
      />
      <button type="submit" className="btn btn-primary w-full">Register</button>
    </form>
  );
} 