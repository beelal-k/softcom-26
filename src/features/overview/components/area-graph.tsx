'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', income: 48600, expenses: 32400 },
  { month: 'February', income: 52300, expenses: 35800 },
  { month: 'March', income: 49100, expenses: 33200 },
  { month: 'April', income: 55800, expenses: 38100 },
  { month: 'May', income: 58900, expenses: 39500 },
  { month: 'June', income: 62400, expenses: 41200 }
];

const chartConfig = {
  income: {
    label: 'Income',
    color: 'hsl(var(--accent))'
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--muted-foreground))'
  }
} satisfies ChartConfig;

export function AreaGraph() {
  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Cash Flow Trend</CardTitle>
        <CardDescription>
          Income and expenses over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillIncome' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='hsl(var(--accent))'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='hsl(var(--accent))'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillExpenses' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='hsl(var(--muted-foreground))'
                  stopOpacity={0.6}
                />
                <stop
                  offset='95%'
                  stopColor='hsl(var(--muted-foreground))'
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
*           <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className='border-accent bg-card'
                  labelFormatter={(value) => {
                    return value;
                  }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              }
            />
            <Area
              dataKey='expenses'
              type='natural'
              fill='url(#fillExpenses)'
              stroke='hsl(var(--muted-foreground))'
              strokeWidth={2}
              stackId='a'
            />
            <Area
              dataKey='income'
              type='natural'
              fill='url(#fillIncome)'
              stroke='hsl(var(--accent))'
              strokeWidth={2}
              stackId='a'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium text-accent'>
              Positive cash flow growth <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              6-month financial overview
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
