'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

export const description = 'Monthly Revenue vs Expenses';

const chartData = [
  { date: '2024-07-01', revenue: 28500, expenses: 18200 },
  { date: '2024-07-02', revenue: 31200, expenses: 19500 },
  { date: '2024-07-03', revenue: 29800, expenses: 17800 },
  { date: '2024-07-04', revenue: 33400, expenses: 21200 },
  { date: '2024-07-05', revenue: 35600, expenses: 22800 },
  { date: '2024-07-06', revenue: 32100, expenses: 20100 },
  { date: '2024-07-07', revenue: 29500, expenses: 18900 },
  { date: '2024-07-08', revenue: 34800, expenses: 21500 },
  { date: '2024-07-09', revenue: 27900, expenses: 17200 },
  { date: '2024-07-10', revenue: 31600, expenses: 19800 },
  { date: '2024-07-11', revenue: 36200, expenses: 23100 },
  { date: '2024-07-12', revenue: 33800, expenses: 21800 },
  { date: '2024-07-13', revenue: 35200, expenses: 22400 },
  { date: '2024-07-14', revenue: 28700, expenses: 18500 },
  { date: '2024-07-15', revenue: 30400, expenses: 19200 },
  { date: '2024-07-16', revenue: 32900, expenses: 20600 },
  { date: '2024-07-17', revenue: 37100, expenses: 23800 },
  { date: '2024-07-18', revenue: 36800, expenses: 23400 },
  { date: '2024-07-19', revenue: 31500, expenses: 19900 },
  { date: '2024-07-20', revenue: 28200, expenses: 18100 },
  { date: '2024-07-21', revenue: 30100, expenses: 19400 },
  { date: '2024-07-22', revenue: 32400, expenses: 20800 },
  { date: '2024-07-23', revenue: 33700, expenses: 21400 },
  { date: '2024-07-24', revenue: 35900, expenses: 22900 },
  { date: '2024-07-25', revenue: 34200, expenses: 21900 },
  { date: '2024-07-26', revenue: 29600, expenses: 18800 },
  { date: '2024-07-27', revenue: 37500, expenses: 24100 },
  { date: '2024-07-28', revenue: 31100, expenses: 19600 },
  { date: '2024-07-29', revenue: 34500, expenses: 22100 },
  { date: '2024-07-30', revenue: 38200, expenses: 24500 }
];

const chartConfig = {
  views: {
    label: 'Financial Overview'
  },
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--accent))'
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--muted-foreground))'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('revenue');

  const total = React.useMemo(
    () => ({
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
      expenses: chartData.reduce((acc, curr) => acc + curr.expenses, 0)
    }),
    []
  );

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Card className='@container/card pt-3!'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0! sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-0!'>
          <CardTitle>Revenue vs Expenses</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              Financial performance for the last 30 days
            </span>
            <span className='@[540px]/card:hidden'>Last 30 days</span>
          </CardDescription>
        </div>
        <div className='flex'>
          {['revenue', 'expenses'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            if (!chart || total[key as keyof typeof total] === 0) return null;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='data-[active=true]:bg-accent/10 hover:bg-accent/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  ${(total[key as keyof typeof total] / 1000).toFixed(1)}k
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='hsl(var(--accent))'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='hsl(var(--accent))'
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-[150px] border-accent bg-card'
                  nameKey='views'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill='url(#fillBar)'
              radius={[4, 4, 0, 0]}
              stroke="hsl(var(--accent))"
              strokeWidth={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
