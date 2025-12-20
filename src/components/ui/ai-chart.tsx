'use client';

import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
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

interface AIChartProps {
  data: any;
}

const COLORS_HEX = [
  '#ea580c', // orange-600
  '#f97316', // orange-500
  '#fb923c', // orange-400
  '#fdba74', // orange-300
  '#ffedd5', // orange-100
  '#fed7aa', // orange-200
  '#c2410c', // orange-700
  '#9a3412', // orange-800
];

export function AIChart({ data }: AIChartProps) {
  const { type, title, description, xAxis, yAxis, data: chartData } = data;

  const chartConfig = useMemo(() => {
    return {
      [yAxis]: {
        label: title || 'Value',
        color: 'hsl(var(--primary))'
      }
    } satisfies ChartConfig;
  }, [title, yAxis]);

  if (!chartData || chartData.length === 0) {
    return null;
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey={xAxis}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => {
                 // Try to format date if it looks like a date
                 if (typeof value === 'string' && (value.includes('-') || value.includes('/'))) {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                 }
                 return value;
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Bar dataKey={yAxis} fill="orange" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey={xAxis}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="orange"
              tickFormatter={(value) => {
                 if (typeof value === 'string' && (value.includes('-') || value.includes('/'))) {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                 }
                 return value;
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Line
              type="monotone"
              dataKey={yAxis}
              stroke="orange"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey={xAxis}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => {
                 if (typeof value === 'string' && (value.includes('-') || value.includes('/'))) {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                 }
                 return value;
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Area
              type="monotone"
              dataKey={yAxis}
              stroke="#ea580c"
              fill="#fed7aa"
              fillOpacity={0.2}
            />
          </AreaChart>
        );
      case 'pie':
        const nameKey = xAxis || Object.keys(chartData[0] || {}).find(k => k !== (yAxis || 'value')) || 'name';
        return (
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
            <Pie
              data={chartData}
              dataKey={yAxis || 'value'} 
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={2}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS_HEX[index % COLORS_HEX.length]} stroke="hsl(var(--background))" />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Unsupported chart type: {type}
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-video w-full">
          {renderChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

