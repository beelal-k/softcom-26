import { Sparkles } from 'lucide-react';

export default function ChatLoading() {
  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col items-center justify-center'>
      <div className='flex items-center gap-3'>
        <div className='animate-pulse flex items-center justify-center rounded-lg bg-accent p-3'>
          <Sparkles className='h-8 w-8 text-accent-foreground' />
        </div>
        <div className='text-xl font-semibold'>Loading AI Assistant...</div>
      </div>
    </div>
  );
}
