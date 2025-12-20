'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const loginStatus = searchParams.get('login');

    if (loginStatus === 'success' && token) {
      localStorage.setItem('token', token);
      // Redirect to overview
      router.replace('/dashboard/overview');
    } else {
      // Just redirect to overview
      router.replace('/dashboard/overview');
    }
  }, [searchParams, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Redirecting...</h2>
        <p className="text-muted-foreground">Please wait while we set up your dashboard.</p>
      </div>
    </div>
  );
}
