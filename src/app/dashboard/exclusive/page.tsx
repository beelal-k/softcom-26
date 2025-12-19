'use client';

import PageContainer from '@/components/layout/page-container';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { BadgeCheck, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ExclusivePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ------------------------
  // REPLACING CLERK LOGIC
  // ------------------------
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasProPlan, setHasProPlan] = useState(true); // set false to test fallback
  const [organization, setOrganization] = useState<{ name: string } | null>(
    null
  );

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
      setOrganization({ name: 'Sheikh Sahab' });
    }, 300); // simulate loading
  }, []);

  // Fallback UI if user does NOT have Pro plan
  if (isLoaded && !hasProPlan) {
    return (
      <PageContainer>
        <div className='flex h-full items-center justify-center'>
          <Alert>
            <Lock className='h-5 w-5 text-yellow-600' />
            <AlertDescription>
              <div className='mb-1 text-lg font-semibold'>
                Pro Plan Required
              </div>
              <div className='text-muted-foreground'>
                This page is only available to organizations on the{' '}
                <span className='font-semibold'>Pro</span> plan.
                <br />
                Upgrade your subscription in&nbsp;
                <a className='underline' href='/dashboard/billing'>
                  Billing &amp; Plans
                </a>
                .
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  // Main Pro content
  return (
    <PageContainer isloading={!isLoaded}>
      <div className='space-y-6'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <BadgeCheck className='h-7 w-7 text-green-600' />
            Exclusive Area
          </h1>

          <p className='text-muted-foreground'>
            Welcome, <span className='font-semibold'>{organization?.name}</span>
            ! This page contains exclusive features for Pro plan organizations.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thank You for Checking Out the Exclusive Page</CardTitle>
            <CardDescription>
              This means your organization has access to these exclusive
              features.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className='text-lg'>Have a wonderful day!</div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
