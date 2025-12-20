import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentSalesProps {
  invoices?: any[];
  isLoading?: boolean;
}

export function RecentSales({ invoices = [], isLoading = false }: RecentSalesProps) {
  if (isLoading) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <Skeleton className='h-8 w-48 mb-2' />
          <Skeleton className='h-4 w-72' />
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='flex items-center'>
                <Skeleton className='h-10 w-10 rounded-lg' />
                <div className='ml-4 flex-1 space-y-1'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <Skeleton className='h-4 w-16' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardDescription>Latest invoices from QuickBooks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {invoices && invoices.length > 0 ? (
            invoices.map((invoice, index) => (
              <div key={invoice.Id || index} className='flex items-center'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10'>
                  <span className='text-sm font-semibold text-accent'>
                    {getInitials(invoice.CustomerRef?.name || 'Unknown')}
                  </span>
                </div>
                <div className='ml-4 flex-1 space-y-1'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm leading-none font-medium'>
                      {invoice.CustomerRef?.name || 'Unknown Customer'}
                    </p>
                    <IconArrowUp className='h-4 w-4 text-accent' />
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {invoice.Line?.[0]?.Description || `Invoice #${invoice.DocNumber}`}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {invoice.TxnDate}
                  </p>
                </div>
                <div className='ml-4 font-semibold text-accent'>
                  {formatCurrency(invoice.TotalAmt)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No recent invoices found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
