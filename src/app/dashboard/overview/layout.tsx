'use client';

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
import { Skeleton } from '@/components/ui/skeleton';
import { IconTrendingDown, IconTrendingUp, IconCheck, IconFileUpload, IconCloud } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { RecentSales } from '@/features/overview/components/recent-sales';
import { BarGraph } from '@/features/overview/components/bar-graph';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface DashboardStats {
  revenue_this_month: {
    value: number;
    change_percent: number;
  };
  expenses_this_month: {
    value: number;
    change_percent: number;
  };
  net_profit_this_month: {
    value: number;
    change_percent: number;
  };
  cash_flow_this_month: {
    value: number;
    change_percent: number;
  };
  overall: {
    total_revenue: number;
    total_expenses: number;
  };
  chart_data: Array<{
    date: string;
    revenue: number;
    expenses: number;
  }>;
  recent_invoices: any[];
  is_connected: boolean;
}

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const suggestedPrompts = [
    {
      title: "Generate a 90-day cash flow forecast",
      prompt: "Generate a 90-day cash flow forecast based on my recent invoices and expenses."
    },
    {
      title: "Breakdown my expenses for the last 6 months",
      prompt: "Show me a breakdown of my expenses by category for the last 6 months."
    },
    {
      title: "Analyze churn risk",
      prompt: "Analyze my customer data and tell me which clients are at risk of churning."
    },
  ];

  const handlePromptClick = (prompt: string) => {
    // Navigate to chat with prompt as query param
    router.push(`/dashboard/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        let userEmail = '';
        
        if (userStr) {
          try {
             const user = JSON.parse(userStr);
             userEmail = user.email;
          } catch(e) { console.error(e); }
        }

        console.log('Using auth token:', token);
        
        // Fetch stats with auth token
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        const [statsResponse, qbStatusResponse] = await Promise.all([
          fetch(`${API_URL}/stats`, {
            headers: {
              'authorization': `Bearer ${token}`,
              'content-Type': 'application/json'
            }
          }),
          userEmail ? fetch(`/api/user/qb-status?email=${userEmail}`) : Promise.resolve(null)
        ]);
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await statsResponse.json();
        
        if (qbStatusResponse && qbStatusResponse.ok) {
          const qbData = await qbStatusResponse.json();
          data.is_connected = qbData.isConnected;
        }

        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleConnectQuickBooks = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/login`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to initiate QuickBooks login:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

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

        {/* AI Insight Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedPrompts.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-4 px-4 flex flex-col rounded-2xl items-start gap-2 cursor-pointer border-accent/25 hover:border-accent hover:bg-accent/5 text-left whitespace-normal"
              onClick={() => handlePromptClick(item.prompt)}
            >
              <div className="flex items-center text-sm gap-2 text-accent font-normal">
                <Sparkles className="h-4 w-4" />
                <span>{item.title}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Financial KPI Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {/* Revenue Card */}
          <Card className='relative overflow-hidden border-accent/30 bg-linear-to-br from-accent/10 via-card to-card'>
            <div className='absolute inset-0 bg-linear-to-br from-accent/5 to-transparent' />
            <CardHeader className='relative'>
              <CardDescription className='text-xs uppercase tracking-wider font-semibold'>Total Revenue</CardDescription>
              {isLoading ? (
                <Skeleton className='h-12 w-32 mt-2' />
              ) : (
                <CardTitle className='text-4xl font-bold text-accent mt-2'>
                  {stats ? formatCurrency(stats.revenue_this_month.value) : '$0'}
                </CardTitle>
              )}
              <CardAction>
                {isLoading ? (
                  <Skeleton className='h-6 w-16' />
                ) : stats && (
                  <Badge variant='outline' className={`${
                    stats.revenue_this_month.change_percent >= 0 
                      ? 'border-accent/40 text-accent bg-accent/10' 
                      : 'border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10'
                  }`}>
                    {stats.revenue_this_month.change_percent >= 0 ? (
                      <IconTrendingUp className='h-3 w-3 mr-1' />
                    ) : (
                      <IconTrendingDown className='h-3 w-3 mr-1' />
                    )}
                    {formatPercent(stats.revenue_this_month.change_percent)}
                  </Badge>
                )}
              </CardAction>
            </CardHeader>
            <CardFooter className='relative flex-col items-start gap-1 text-xs'>
              <div className='flex items-center gap-1.5 font-medium text-accent'>
                {stats?.revenue_this_month.change_percent ?? 0 >= 0 ? 'Strong performance' : 'Below target'}
              </div>
              <div className='text-muted-foreground'>
                vs last month
              </div>
            </CardFooter>
          </Card>

          {/* Expenses Card */}
          <Card className='relative overflow-hidden'>
            <CardHeader>
              <CardDescription className='text-xs uppercase tracking-wider font-semibold'>Total Expenses</CardDescription>
              {isLoading ? (
                <Skeleton className='h-12 w-32 mt-2' />
              ) : (
                <CardTitle className='text-4xl font-bold mt-2'>
                  {stats ? formatCurrency(stats.expenses_this_month.value) : '$0'}
                </CardTitle>
              )}
              <CardAction>
                {isLoading ? (
                  <Skeleton className='h-6 w-16' />
                ) : stats && (
                  <Badge variant='outline' className={`${
                    stats.expenses_this_month.change_percent < 0 
                      ? 'border-green-500/40 text-green-600 dark:text-green-400 bg-green-500/10'
                      : 'border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10'
                  }`}>
                    {stats.expenses_this_month.change_percent < 0 ? (
                      <IconTrendingDown className='h-3 w-3 mr-1' />
                    ) : (
                      <IconTrendingUp className='h-3 w-3 mr-1' />
                    )}
                    {formatPercent(stats.expenses_this_month.change_percent)}
                  </Badge>
                )}
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-xs'>
              <div className={`flex items-center gap-1.5 font-medium ${
                (stats?.expenses_this_month.change_percent ?? 0) < 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {(stats?.expenses_this_month.change_percent ?? 0) < 0 ? 'Cost optimization' : 'Increased spending'}
              </div>
              <div className='text-muted-foreground'>
                {(stats?.expenses_this_month.change_percent ?? 0) < 0 ? 'Reduced operational costs' : 'Higher expenses'}
              </div>
            </CardFooter>
          </Card>

          {/* Net Profit Card */}
          <Card className='relative overflow-hidden'>
            <CardHeader>
              <CardDescription className='text-xs uppercase tracking-wider font-semibold'>Net Profit</CardDescription>
              {isLoading ? (
                <Skeleton className='h-12 w-32 mt-2' />
              ) : (
                <CardTitle className='text-4xl font-bold mt-2'>
                  {stats ? formatCurrency(stats.net_profit_this_month.value) : '$0'}
                </CardTitle>
              )}
              <CardAction>
                {isLoading ? (
                  <Skeleton className='h-6 w-16' />
                ) : stats && (
                  <Badge variant='outline' className={`${
                    stats.net_profit_this_month.change_percent >= 0 
                      ? 'border-accent/40 text-accent bg-accent/10' 
                      : 'border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10'
                  }`}>
                    {stats.net_profit_this_month.change_percent >= 0 ? (
                      <IconTrendingUp className='h-3 w-3 mr-1' />
                    ) : (
                      <IconTrendingDown className='h-3 w-3 mr-1' />
                    )}
                    {formatPercent(stats.net_profit_this_month.change_percent)}
                  </Badge>
                )}
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-xs'>
              <div className='flex items-center gap-1.5 font-medium'>
                {(stats?.net_profit_this_month.change_percent ?? 0) >= 0 ? 'Healthy margins' : 'Declining margins'}
              </div>
              <div className='text-muted-foreground'>
                {stats ? `${((stats.net_profit_this_month.value / stats.revenue_this_month.value) * 100).toFixed(1)}% profit margin` : '0% profit margin'}
              </div>
            </CardFooter>
          </Card>

          {/* Cash Flow Card */}
          <Card className='relative overflow-hidden'>
            <CardHeader>
              <CardDescription className='text-xs uppercase tracking-wider font-semibold'>Cash Flow</CardDescription>
              {isLoading ? (
                <Skeleton className='h-12 w-32 mt-2' />
              ) : (
                <CardTitle className='text-4xl font-bold mt-2'>
                  {stats ? formatCurrency(stats.cash_flow_this_month.value) : '$0'}
                </CardTitle>
              )}
              <CardAction>
                {isLoading ? (
                  <Skeleton className='h-6 w-16' />
                ) : stats && (
                  <Badge variant='outline' className={`${
                    stats.cash_flow_this_month.change_percent >= 0 
                      ? 'border-accent/40 text-accent bg-accent/10' 
                      : 'border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10'
                  }`}>
                    {stats.cash_flow_this_month.change_percent >= 0 ? (
                      <IconTrendingUp className='h-3 w-3 mr-1' />
                    ) : (
                      <IconTrendingDown className='h-3 w-3 mr-1' />
                    )}
                    {formatPercent(stats.cash_flow_this_month.change_percent)}
                  </Badge>
                )}
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-xs'>
              <div className='flex items-center gap-1.5 font-medium'>
                {(stats?.cash_flow_this_month.change_percent ?? 0) >= 0 ? 'Positive trend' : 'Negative trend'}
              </div>
              <div className='text-muted-foreground'>
                {(stats?.cash_flow_this_month.change_percent ?? 0) >= 0 ? 'Strong liquidity position' : 'Monitor closely'}
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
                <Badge 
                  className='bg-accent text-accent-foreground shadow-sm cursor-pointer hover:opacity-80'
                  onClick={handleConnectQuickBooks}
                >
                  <IconCheck className='h-3 w-3 mr-1' />
                  {stats?.is_connected ? 'Connected' : 'Connect'}
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
          <div className='lg:col-span-4'>
            <BarGraph chartData={stats?.chart_data} overall={stats?.overall} />
          </div>
          <div className='lg:col-span-3'>
            <RecentSales invoices={stats?.recent_invoices} isLoading={isLoading} />
          </div>
        </div>
        
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <div className='lg:col-span-4'>{area_stats}</div>
          <div className='lg:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
