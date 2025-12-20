'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
import { Bot, Send, Sparkles, User, Zap, Lightbulb, FileText, MessageSquare, Paperclip, X, Upload, Cloud } from 'lucide-react';
import { useEffect, useRef, useState, FormEvent, DragEvent, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AIChart } from '@/components/ui/ai-chart';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fileUrl?: string;
  fileName?: string;
  chartData?: any;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');
  const hasSentInitialPrompt = useRef(false);
  
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

        if (initialPrompt && !hasSentInitialPrompt.current) {
            hasSentInitialPrompt.current = true;
            // Add user message to UI
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'user',
                content: initialPrompt
            }]);
            setIsLoading(true);
            
            // Send via socket
            sendChatMessage(initialPrompt);
        }
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

  const handleFileUpload = async (file: File) => {
    console.log('Starting upload for:', file.name, file.type, file.size);
    
    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'csv', 'xlsx', 'xls'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      alert('Only images (JPG, PNG, GIF, WebP), PDF, CSV, and Excel files are allowed.');
      return;
    }
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
X
      console.log('Sending upload request...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error response:', errorData);
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      setUploadedFile({ url: data.url, name: file.name });
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      console.log('File dropped:', file.name);
      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && !uploadedFile) || isLoading || !isConnected) return;

    let messageContent = input.trim();
    let displayContent = input.trim();
    const attachments: string[] = [];
    
    // If file is attached, add to attachments array and show filename in display
    if (uploadedFile) {
      attachments.push(uploadedFile.url);
      displayContent = displayContent ? `${displayContent}\n\n📎 ${uploadedFile.name}` : `📎 ${uploadedFile.name}`;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: displayContent,
      fileUrl: uploadedFile?.url,
      fileName: uploadedFile?.name
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedFile(null);
    
    // Reset file input to allow new uploads
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsLoading(true);

    try {
      // Send message via Socket.io with attachments array
      sendChatMessage(messageContent, undefined, attachments);
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
      <div 
        className='flex-1 flex flex-col relative overflow-hidden'
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div className='absolute inset-0 z-50 bg-accent/20 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-accent'>
            <div className='text-center'>
              <Upload className='h-16 w-16 text-accent mx-auto mb-4' />
              <p className='text-xl font-semibold'>Drop file to upload</p>
            </div>
          </div>
        )}
        
        {/* Connection Status */}
        {!isConnected && (
          <div className='bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-center'>
            <p className='text-sm text-destructive'>
              Connecting to AI server...
            </p>
          </div>
        )}
        
        {/* Chat Messages */}
        <div className='flex-1 overflow-y-auto px-2 sm:px-4' ref={scrollRef}>
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
                  title='Analyze transactions'
                  description='Review recent financial activity'
                  prompt='Analyze my recent transactions and identify spending patterns'
                  onClick={setInput}
                />
                <SuggestedPrompt
                  icon={<Lightbulb className='h-5 w-5' />}
                  title='Investment advice'
                  description='Get portfolio recommendations'
                  prompt='What investment strategies would you recommend for long-term growth?'
                  onClick={setInput}
                />
                <SuggestedPrompt
                  icon={<FileText className='h-5 w-5' />}
                  title='Budget planning'
                  description='Create a financial plan'
                  prompt='Help me create a monthly budget based on my income and expenses'
                  onClick={setInput}
                />
                <SuggestedPrompt
                  icon={<MessageSquare className='h-5 w-5' />}
                  title='Financial reports'
                  description='Generate insights from data'
                  prompt='Generate a summary report of my financial performance this quarter'
                  onClick={setInput}
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
      </div>
      
      {/* Input Area - Fixed at bottom */}
      <div className='border-t bg-background px-4 py-4 flex-shrink-0'>
        <div className='mx-auto max-w-4xl'>
          {/* File Preview */}
          {uploadedFile && (
            <div className='mb-2 flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-lg px-3 py-2'>
              <Paperclip className='h-4 w-4 text-accent' />
              <span className='text-sm flex-1 truncate'>{uploadedFile.name}</span>
              <button
                onClick={() => setUploadedFile(null)}
                className='text-muted-foreground hover:text-foreground'
                type='button'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className='relative'>
            <input
              ref={fileInputRef}
              type='file'
              onChange={handleFileSelect}
              className='hidden'
              accept='image/*,.pdf,.csv,.xlsx,.xls'
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type='button'
                  size='icon'
                  variant='ghost'
                  disabled={isUploading || isLoading}
                  className='absolute left-2 top-1 h-10 w-10 text-muted-foreground hover:text-foreground'
                >
                  {isUploading ? (
                    <div className='h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin' />
                  ) : (
                    <Paperclip className='h-4 w-4' />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Upload File</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  try {
                    const userStr = localStorage.getItem('user');
                    let userEmail = '';
                    if (userStr) {
                       const user = JSON.parse(userStr);
                       userEmail = user.email;
                    }
                    
                    if (!userEmail) {
                        alert('User email not found. Please log in again.');
                        return;
                    }

                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    const response = await fetch(`${API_URL}/google/login?email=${encodeURIComponent(userEmail)}`);
                    const data = await response.json();
                    
                    if (data.url) {
                        window.location.href = data.url;
                    }
                  } catch (e) {
                    console.error('Failed to initiate Google Drive connection:', e);
                    alert('Failed to connect to Google Drive. Please try again.');
                  }
                }}>
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>Connect Google Drive</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Ask me anything...'
              className='pl-12 pr-12 h-12 text-base'
              disabled={isLoading}
            />
            <Button
              type='submit'
              size='icon'
              disabled={(!input.trim() && !uploadedFile) || isLoading || !isConnected}
              className='absolute right-1 top-1 h-10 w-10 bg-accent text-accent-foreground hover:bg-accent/90'
            >
              <Send className='h-4 w-4' />
            </Button>
          </form>
          <p className='mt-2 text-center text-xs text-muted-foreground'>
            {isConnected ? (
              <></>
            ) : (
              <>Connecting to AI server...</>
            )}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

function ChatMessage({
  role,
  content,
  chartData,
  isLoading = false
}: {
  role: 'user' | 'assistant';
  content: string;
  chartData?: any;
  isLoading?: boolean;
}) {
  const isUser = role === 'user';

  const processedData = useMemo(() => {
    if (chartData) return { text: content, chart: chartData };
    
    if (content.includes('CHART_DATA_START')) {
      try {
        const parts = content.split('CHART_DATA_START');
        const textBefore = parts[0];
        const chartPart = parts[1].split('CHART_DATA_END')[0];
        const textAfter = parts[1].split('CHART_DATA_END')[1] || '';
        const chartJson = JSON.parse(chartPart);
        return { text: textBefore + textAfter, chart: chartJson };
      } catch (e) {
        console.error('Failed to parse chart data', e);
        return { text: content, chart: null };
      }
    }
    return { text: content, chart: null };
  }, [content, chartData]);

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
      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser && "items-end")}>
        <Card
          className={cn(
            'px-4 py-3',
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
            isUser ? (
              <p className='whitespace-pre-wrap text-sm leading-relaxed'>{processedData.text}</p>
            ) : (
              <div className='prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed'>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                    ul: ({ children }) => <ul className='mb-2 ml-4 list-disc'>{children}</ul>,
                    ol: ({ children }) => <ol className='mb-2 ml-4 list-decimal'>{children}</ol>,
                    li: ({ children }) => <li className='mb-1'>{children}</li>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className='px-1.5 py-0.5 rounded bg-muted text-accent font-mono text-xs'>{children}</code>
                      ) : (
                        <code className='block p-2 rounded bg-muted font-mono text-xs overflow-x-auto'>{children}</code>
                      );
                    },
                    pre: ({ children }) => <pre className='mb-2 overflow-x-auto'>{children}</pre>,
                    strong: ({ children }) => <strong className='font-semibold'>{children}</strong>,
                    a: ({ children, href }) => <a href={href} className='text-accent hover:underline' target='_blank' rel='noopener noreferrer'>{children}</a>
                  }}
                >
                  {processedData.text}
                </ReactMarkdown>
              </div>
            )
          )}
        </Card>
        
        {processedData.chart && (
          <div className="w-full mt-2">
            <AIChart data={processedData.chart} />
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestedPrompt({
  icon,
  title,
  description,
  prompt,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  prompt: string;
  onClick: (value: string) => void;
}) {
  return (
    <Card 
      className='p-4 cursor-pointer transition-all hover:border-accent hover:shadow-md group'
      onClick={() => onClick(prompt)}
    >
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
