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

const transactionsData = [
  {
    name: 'QuickBooks Sync',
    description: 'Monthly subscription revenue',
    icon: 'QB',
    amount: '+$12,450.00',
    type: 'income',
    time: '2 hours ago'
  },
  {
    name: 'Office Supplies',
    description: 'Equipment and materials',
    icon: 'OS',
    amount: '-$2,350.00',
    type: 'expense',
    time: '5 hours ago'
  },
  {
    name: 'Client Payment',
    description: 'Project Alpha milestone',
    icon: 'CP',
    amount: '+$8,900.00',
    type: 'income',
    time: 'Yesterday'
  },
  {
    name: 'Cloud Services',
    description: 'AWS infrastructure costs',
    icon: 'CS',
    amount: '-$1,280.00',
    type: 'expense',
    time: 'Yesterday'
  },
  {
    name: 'Consulting Fee',
    description: 'Q4 advisory services',
    icon: 'CF',
    amount: '+$5,500.00',
    type: 'income',
    time: '2 days ago'
  }
];

export function RecentSales() {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest financial activity from all sources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {transactionsData.map((transaction, index) => (
            <div key={index} className='flex items-center'>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                transaction.type === 'income' ? 'bg-accent/10' : 'bg-muted'
              }`}>
                <span className='text-sm font-semibold'>{transaction.icon}</span>
              </div>
              <div className='ml-4 flex-1 space-y-1'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm leading-none font-medium'>{transaction.name}</p>
                  {transaction.type === 'income' ? (
                    <IconArrowUp className='h-4 w-4 text-accent' />
                  ) : (
                    <IconArrowDown className='h-4 w-4 text-muted-foreground' />
                  )}
                </div>
                <p className='text-muted-foreground text-xs'>{transaction.description}</p>
                <p className='text-muted-foreground text-xs'>{transaction.time}</p>
              </div>
              <div className={`ml-4 font-semibold ${
                transaction.type === 'income' ? 'text-accent' : 'text-foreground'
              }`}>
                {transaction.amount}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
