'use client';

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';

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
  { category: 'operations', amount: 42800, fill: 'hsl(var(--accent))' },
  { category: 'salaries', amount: 38200, fill: 'hsl(var(--chart-1))' },
  { category: 'marketing', amount: 28900, fill: 'hsl(var(--chart-2))' },
  { category: 'technology', amount: 19400, fill: 'hsl(var(--chart-3))' },
  { category: 'other', amount: 13590, fill: 'hsl(var(--chart-4))' }
];

const chartConfig = {
  amount: {
    label: 'Amount'
  },
  operations: {
    label: 'Operations',
    color: 'hsl(var(--accent))'
  },
  salaries: {
    label: 'Salaries',
    color: 'hsl(var(--chart-1))'
  },
  marketing: {
    label: 'Marketing',
    color: 'hsl(var(--chart-2))'
  },
  technology: {
    label: 'Technology',
    color: 'hsl(var(--chart-3))'
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-4))'
  }
} satisfies ChartConfig;

export function PieGraph() {
  const totalAmount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, []);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Expense distribution by category
          </span>
          <span className='@[540px]/card:hidden'>Category breakdown</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <defs>
              {['operations', 'salaries', 'marketing', 'technology', 'other'].map(
                (category) => {
                  const config = chartConfig[category as keyof typeof chartConfig];
                  const color = 'color' in config ? config.color : 'hsl(var(--accent))';
                  
                  return (
                    <linearGradient
                      key={category}
                      id={`fill${category}`}
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='0%'
                        stopColor={color}
                        stopOpacity={1}
                      />
                      <stop
                        offset='100%'
                        stopColor={color}
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  );
                }
              )}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => `$${Number(value).toLocaleString()}`} className='border-accent bg-card' />}
            />
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: `url(#fill${item.category})`
              }))}
              dataKey='amount'
              nameKey='category'
              innerRadius={60}
              strokeWidth={3}
              stroke='hsl(var(--background))'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          ${(totalAmount / 1000).toFixed(0)}k
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Expenses
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium text-accent'>
          Operations accounts for{' '}
          {((chartData[0].amount / totalAmount) * 100).toFixed(1)}% of expenses
        </div>
        <div className='text-muted-foreground leading-none'>
          Monthly expense distribution across categories
        </div>
      </CardFooter>
    </Card>
  );
}
