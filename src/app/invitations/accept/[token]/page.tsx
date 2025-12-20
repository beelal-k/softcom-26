'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AcceptInvitationPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;

    const acceptInvitation = async () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          setStatus('error');
          setMessage('Please login first to accept this invitation');
          // Save the current URL to redirect back after login
          localStorage.setItem(
            'redirect_after_login',
            `/invitations/accept/${token}`
          );
          setTimeout(() => router.push('/auth/sign-in'), 2000);
          return;
        }

        const res = await fetch(`/api/invitations/${token}/accept`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage('Invitation accepted! Redirecting to dashboard...');
          // Clear any saved redirect
          localStorage.removeItem('redirect_after_login');
          setTimeout(() => router.push('/dashboard/overview'), 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to accept invitation');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred');
      }
    };

    acceptInvitation();
  }, [token, router]);

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-4 rounded-lg border p-8 text-center'>
        {status === 'loading' && (
          <>
            <h1 className='text-2xl font-bold'>Processing Invitation...</h1>
            <div className='flex justify-center'>
              <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
