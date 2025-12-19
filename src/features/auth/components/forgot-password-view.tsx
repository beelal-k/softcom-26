'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { InteractiveGridPattern } from './interactive-grid';

export default function ForgotPasswordViewPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle forgot password logic here
    console.log('Forgot password:', { email });
    setSubmitted(true);
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
              &ldquo;Security is our top priority. Rest assured that your account 
              recovery process is safe and secure.&rdquo;
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
                {submitted ? 'Check Your Email' : 'Forgot Password'}
              </CardTitle>
              <CardDescription>
                {submitted 
                  ? 'We sent a password reset link to your email address'
                  : 'Enter your email and we\'ll send you a reset link'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmit} className='space-y-4'>
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
                  <Button type='submit' className='w-full bg-accent text-accent-foreground hover:bg-accent/90'>
                    Send Reset Link
                  </Button>
                </form>
              ) : (
                <div className='space-y-4'>
                  <div className='rounded-lg bg-accent/10 p-4 text-sm'>
                    <p>
                      If an account exists for <strong>{email}</strong>, you will receive 
                      a password reset link shortly.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setSubmitted(false)} 
                    variant='outline' 
                    className='w-full'
                  >
                    Try Another Email
                  </Button>
                </div>
              )}
              <div className='mt-6'>
                <Link 
                  href='/auth/sign-in' 
                  className='flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-accent'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
