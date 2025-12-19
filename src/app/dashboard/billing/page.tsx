'use client';

import PageContainer from '@/components/layout/page-container';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

import { useEffect, useState } from 'react';

export default function BillingPage() {
  // ----------------------------
  // Replacing Clerk Logic
  // ----------------------------
  const [isLoaded, setIsLoaded] = useState(false);
  const [organization, setOrganization] = useState<{ name: string } | null>(
    null
  );

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
      setOrganization({ name: 'Sheikh Sahab' }); // mock org
    }, 300);
  }, []);

  // ----------------------------
  // Access fallback (same UI)
  // ----------------------------
  const access = !!organization;

  const accessFallback = (
    <div className='flex min-h-[400px] items-center justify-center'>
      <div className='space-y-2 text-center'>
        <h2 className='text-2xl font-semibold'>No Organization Selected</h2>
        <p className='text-muted-foreground'>
          Please select or create an organization to view billing information.
        </p>
      </div>
    </div>
  );

  return (
    <PageContainer
      isloading={!isLoaded}
      access={access}
      accessFallback={accessFallback}
    >
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Billing & Plans</h1>
          <p className='text-muted-foreground'>
            Manage your subscription and usage limits for {organization?.name}
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className='h-4 w-4' />
          <AlertDescription>
            Plans and subscriptions will be managed in your own billing system
            (Stripe, PayPro, JazzCash, etc.). Integrate your payment provider to
            enable paid plans.
          </AlertDescription>
        </Alert>

        {/* Pricing Table (Custom Instead of Clerk) */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose a plan that fits your organization's needs
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className='mx-auto grid max-w-4xl gap-6 sm:grid-cols-2'>
              {/* Free Plan */}
              <div className='rounded-lg border p-6'>
                <h3 className='text-xl font-semibold'>Free</h3>
                <p className='text-muted-foreground mb-4'>
                  Starter features for small teams.
                </p>
                <ul className='space-y-2 text-sm'>
                  <li>• Basic usage</li>
                  <li>• Limited automation</li>
                  <li>• Community support</li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className='rounded-lg border p-6'>
                <h3 className='text-xl font-semibold'>Pro</h3>
                <p className='text-muted-foreground mb-4'>
                  Advanced features for growing companies.
                </p>
                <ul className='space-y-2 text-sm'>
                  <li>• Everything in Free</li>
                  <li>• Advanced automations</li>
                  <li>• Unlimited team members</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
