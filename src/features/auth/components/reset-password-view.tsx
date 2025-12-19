'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { InteractiveGridPattern } from './interactive-grid';

export default function ResetPasswordViewPage() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid or missing reset token');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token,
          password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-background relative hidden h-full flex-col p-10 text-foreground lg:flex dark:border-r border-border'>
        <div className='absolute inset-0 bg-black' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <div className='flex items-center gap-2'>
            <div className='bg-accent rounded-lg p-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-6 w-6'
              >
                <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
              </svg>
            </div>
            <span className='text-xl font-bold'>YourLogo</span>
          </div>
        </div>
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(500px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12'
          )}
        />
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Choose a strong password to keep your account secure. 
              We recommend using a combination of letters, numbers, and symbols.&rdquo;
            </p>
            <footer className='text-sm text-muted-foreground'>Security Team</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='w-full max-w-md space-y-6'>
          <Card>
            <CardHeader className='space-y-1'>
              <CardTitle className='text-2xl font-bold'>
                {success ? 'Password Reset Complete' : 'Reset Password'}
              </CardTitle>
              <CardDescription>
                {success 
                  ? 'Your password has been successfully updated'
                  : 'Enter your new password below'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!success ? (
                <form onSubmit={handleSubmit} className='space-y-4'>
                  {error && (
                    <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>
                      {error}
                    </div>
                  )}
                  <div className='space-y-2'>
                    <Label htmlFor='password'>New Password</Label>
                    <Input
                      id='password'
                      type='password'
                      placeholder='Enter new password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <p className='text-xs text-muted-foreground'>
                      Must be at least 8 characters long
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>Confirm Password</Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      placeholder='Confirm new password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <Button 
                    type='submit' 
                    className='w-full bg-accent text-accent-foreground hover:bg-accent/90'
                    disabled={loading || !token}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              ) : (
                <div className='space-y-4'>
                  <div className='flex flex-col items-center justify-center gap-4 py-6'>
                    <div className='rounded-full bg-accent/10 p-3'>
                      <CheckCircle2 className='h-8 w-8 text-accent' />
                    </div>
                    <p className='text-center text-sm text-muted-foreground'>
                      You can now sign in with your new password
                    </p>
                  </div>
                  <Link href='/auth/sign-in'>
                    <Button className='w-full bg-accent text-accent-foreground hover:bg-accent/90'>
                      Continue to Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
