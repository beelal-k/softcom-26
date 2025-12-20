'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { InteractiveGridPattern } from './interactive-grid';

export default function SignUpViewPage({ stars }: { stars: number }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Set user cookie for middleware
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

      // Redirect to dashboard
      window.location.href = '/dashboard/overview';
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      window.location.href = '/dashboard/overview';
    }
  }, []);

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-background text-foreground border-border relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
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
              &ldquo;Join thousands of professionals who trust our platform for
              their daily workflow and project management needs.&rdquo;
            </p>
            <footer className='text-muted-foreground text-sm'>
              Michael Chen, Product Manager
            </footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='w-full max-w-md space-y-6'>
          <Card>
            <CardHeader className='space-y-1'>
              <CardTitle className='text-2xl font-bold'>
                Create Account
              </CardTitle>
              <CardDescription>
                Enter your information to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                {error && (
                  <div className='bg-destructive/10 text-destructive rounded-lg p-3 text-sm'>
                    {error}
                  </div>
                )}
                <div className='space-y-2'>
                  <Label htmlFor='name'>Full Name</Label>
                  <Input
                    id='name'
                    type='text'
                    placeholder='John Doe'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='name@example.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='password'>Password</Label>
                  <Input
                    id='password'
                    type='password'
                    placeholder='Create a password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirm Password</Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    placeholder='Confirm your password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type='submit'
                  className='bg-accent text-accent-foreground hover:bg-accent/90 w-full'
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
              <div className='mt-6 text-center text-sm'>
                Already have an account?{' '}
                <Link
                  href='/auth/sign-in'
                  className='text-accent font-medium hover:underline'
                >
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
          <p className='text-muted-foreground px-8 text-center text-xs'>
            By creating an account, you agree to our{' '}
            <Link
              href='/terms'
              className='hover:text-accent underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='hover:text-accent underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
