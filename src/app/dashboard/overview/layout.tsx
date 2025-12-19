import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
  CardContent
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp, IconCheck, IconFileUpload, IconCloud } from '@tabler/icons-react';
import React from 'react';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header Section */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Financial Dashboard
            </h2>
            <p className='text-muted-foreground mt-1'>
              Monitor your financial performance and data integrations
            </p>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='relative overflow-hidden border-accent/30 bg-linear-to-br from-accent/10 via-card to-card'>
            <div className='absolute inset-0 bg-linear-to-br from-accent/5 to-transparent' />
            <CardHeader className='relative'>
              <CardDescription className='text-xs uppercase tracking-wider font-semibold'>Total Revenue</CardDescription>
              <CardTitle className='text-4xl font-bold text-accent mt-2'>
                $248,350
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='border-accent/40 text-accent bg-accent/10'>
                  <IconTrendingUp className='h-3 w-3 mr-1' />
                  +18.2%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='relative flex-col items-start gap-1 text-xs'>
              <div className='flex items-center gap-1.5 font-medium text-accent'>
                Strong performance
              </div>
              <div className='text-muted-foreground'>
                vs last month
              </div>
            </CardFooter>
          </Card>

          <Card className='relative overflow-hidden'>
            <CardHeader>
              <CardDescription className='text-xs uppercase tracking-wider font-semibold'>Total Expenses</CardDescription>
              <CardTitle className='text-4xl font-bold mt-2'>
                $142,890
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='border-green-500/40 text-green-600 dark:text-green-400 bg-green-500/10'>
                  <IconTrendingDown className='h-3 w-3 mr-1' />
                  -5.3%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-xs'>
              <div className='flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400'>
                Cost optimization
              </div>
              <div className='text-muted-foreground'>
                Reduced operational costs
              </div>
            </CardFooter>
          </Card>

          <Card className='relative overflow-hidden'>
            <CardHeader>
              <CardDescription className='text-xs uppercase tracking-wider font-semibold'>Net Profit</CardDescription>
              <CardTitle className='text-4xl font-bold mt-2'>
                $105,460
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='border-accent/40 text-accent bg-accent/10'>
                  <IconTrendingUp className='h-3 w-3 mr-1' />
                  +24.7%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-xs'>
              <div className='flex items-center gap-1.5 font-medium'>
                Healthy margins
              </div>
              <div className='text-muted-foreground'>
                42.5% profit margin
              </div>
            </CardFooter>
          </Card>

          <Card className='relative overflow-hidden'>
            <CardHeader>
              <CardDescription className='text-xs uppercase tracking-wider font-semibold'>Cash Flow</CardDescription>
              <CardTitle className='text-4xl font-bold mt-2'>
                $89,240
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='border-accent/40 text-accent bg-accent/10'>
                  <IconTrendingUp className='h-3 w-3 mr-1' />
                  +12.1%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-xs'>
              <div className='flex items-center gap-1.5 font-medium'>
                Positive trend
              </div>
              <div className='text-muted-foreground'>
                Strong liquidity position
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Data Sources Status */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card className='border-accent/20 bg-linear-to-br from-accent/5 to-card'>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center rounded-xl bg-accent p-3 shadow-lg shadow-accent/20'>
                  <IconCloud className='h-6 w-6 text-accent-foreground' />
                </div>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>QuickBooks Integration</CardTitle>
                  <CardDescription className='text-xs'>Real-time financial data sync</CardDescription>
                </div>
                <Badge className='bg-accent text-accent-foreground shadow-sm'>
                  <IconCheck className='h-3 w-3 mr-1' />
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Last Sync</p>
                  <p className='text-sm font-semibold'>2 min ago</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Transactions</p>
                  <p className='text-sm font-semibold'>1,847</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Status</p>
                  <p className='text-sm font-semibold text-accent'>Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-accent/20 bg-linear-to-br from-accent/5 to-card'>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center rounded-xl bg-accent p-3 shadow-lg shadow-accent/20'>
                  <IconFileUpload className='h-6 w-6 text-accent-foreground' />
                </div>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>CSV Data Import</CardTitle>
                  <CardDescription className='text-xs'>Imported financial records</CardDescription>
                </div>
                <Badge variant='outline' className='border-accent/30 text-accent'>
                  3 Files
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Last Import</p>
                  <p className='text-sm font-semibold'>Yesterday</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Total Records</p>
                  <p className='text-sm font-semibold'>5,432</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Status</p>
                  <p className='text-sm font-semibold text-accent'>Processed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <div className='lg:col-span-4'>{bar_stats}</div>
          <div className='lg:col-span-3'>{sales}</div>
        </div>
        
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <div className='lg:col-span-4'>{area_stats}</div>
          <div className='lg:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
