'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  initializeSocket,
  joinRoom,
  sendChatMessage,
  onResponse,
  onStatus,
  onConnect,
  onDisconnect,
  onConnectionError,
  disconnectSocket
} from '@/lib/socket';
import { Bot, Send, Sparkles, User, Zap, Lightbulb, FileText, MessageSquare } from 'lucide-react';
import { useEffect, useRef, useState, FormEvent } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setMounted(true);
    
    // Initialize socket connection
    const initSocket = async () => {
      const socket = await initializeSocket();

      // Setup event listeners
      onConnect(() => {
        console.log('✅ Connected to AI server');
        setIsConnected(true);
        joinRoom(); // Join default user room
      });

      onDisconnect(() => {
        console.log('❌ Disconnected from AI server');
        setIsConnected(false);
      });

      onConnectionError((error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      onStatus((data) => {
        console.log('Status:', data.message);
      });

      onResponse((data) => {
        console.log('Received response:', data);
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message || data
        }]);
        
        setIsLoading(false);
      });
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isConnected) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message via Socket.io
      sendChatMessage(userMessage.content);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col'>
      {/* Connection Status */}
      {!isConnected && (
        <div className='bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-center'>
          <p className='text-sm text-destructive'>
            Connecting to AI server...
          </p>
        </div>
      )}
      
      {/* Chat Messages */}
      <ScrollArea className='flex-1 px-2 sm:px-4' ref={scrollRef}>
        <div className='mx-auto max-w-4xl space-y-4 sm:space-y-6 py-4 sm:py-6'>
          {messages.length === 0 ? (
            <div className='flex h-[calc(100vh-20rem)] flex-col items-center justify-center space-y-4'>
              <div className='flex items-center justify-center rounded-full bg-accent/10 p-6'>
                <Sparkles className='h-12 w-12 text-accent' />
              </div>
              <div className='text-center space-y-2'>
                <h2 className='text-xl sm:text-2xl font-bold'>How can I help you today?</h2>
                <p className='text-sm sm:text-base text-muted-foreground px-4'>
                  Ask me anything about your projects, tasks, or general questions.
                </p>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8'>
                <SuggestedPrompt
                  icon={<Zap className='h-5 w-5' />}
                  title='Explain a concept'
                  description='Help me understand complex topics'
                />
                <SuggestedPrompt
                  icon={<Lightbulb className='h-5 w-5' />}
                  title='Generate ideas'
                  description='Brainstorm creative solutions'
                />
                <SuggestedPrompt
                  icon={<FileText className='h-5 w-5' />}
                  title='Review my work'
                  description='Get feedback on my content'
                />
                <SuggestedPrompt
                  icon={<MessageSquare className='h-5 w-5' />}
                  title='Write content'
                  description='Draft emails or documents'
                />
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))
          )}
          {isLoading && (
            <ChatMessage
              role='assistant'
              content=''
              isLoading={true}
            />
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className='border-t bg-background px-4 py-4'>
        <div className='mx-auto max-w-4xl'>
          <form onSubmit={handleSubmit} className='relative'>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Ask me anything...'
              className='pr-12 h-12 text-base'
              disabled={isLoading}
            />
            <Button
              type='submit'
              size='icon'
              disabled={!input.trim() || isLoading || !isConnected}
              className='absolute right-1 top-1 h-10 w-10 bg-accent text-accent-foreground hover:bg-accent/90'
            >
              <Send className='h-4 w-4' />
            </Button>
          </form>
          <p className='mt-2 text-center text-xs text-muted-foreground'>
            {isConnected ? (
              <>AI Assistant can make mistakes. Consider checking important information.</>
            ) : (
              <>Connecting to AI server...</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({
  role,
  content,
  isLoading = false
}: {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className={cn('h-10 w-10', isUser ? 'bg-accent' : 'bg-muted')}>
        <AvatarFallback>
          {isUser ? (
            <User className='h-5 w-5' />
          ) : (
            <Bot className='h-5 w-5' />
          )}
        </AvatarFallback>
      </Avatar>
      <Card
        className={cn(
          'max-w-[80%] px-4 py-3',
          isUser
            ? 'bg-accent text-accent-foreground'
            : 'bg-card'
        )}
      >
        {isLoading ? (
          <div className='flex items-center gap-2'>
            <div className='flex gap-1'>
              <span className='animate-bounce delay-0 h-2 w-2 rounded-full bg-muted-foreground' style={{ animationDelay: '0ms' }}></span>
              <span className='animate-bounce delay-100 h-2 w-2 rounded-full bg-muted-foreground' style={{ animationDelay: '150ms' }}></span>
              <span className='animate-bounce delay-200 h-2 w-2 rounded-full bg-muted-foreground' style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className='text-sm text-muted-foreground'>Thinking...</span>
          </div>
        ) : (
          <p className='whitespace-pre-wrap text-sm leading-relaxed'>{content}</p>
        )}
      </Card>
    </div>
  );
}

function SuggestedPrompt({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className='p-4 cursor-pointer transition-all hover:border-accent hover:shadow-md group'>
      <div className='flex items-start gap-3'>
        <div className='flex items-center justify-center rounded-lg bg-accent/10 p-2 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors'>
          {icon}
        </div>
        <div className='flex-1'>
          <h3 className='font-semibold text-sm'>{title}</h3>
          <p className='text-xs text-muted-foreground mt-1'>{description}</p>
        </div>
      </div>
    </Card>
  );
}
