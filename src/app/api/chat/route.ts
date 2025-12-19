import { NextRequest, NextResponse } from 'next/server';

// This is a mock API route for demonstration purposes
// Replace this with actual AI provider integration later (OpenAI, Anthropic, etc.)

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    // Mock response for demonstration
    const mockResponses = [
      "I'm here to help! However, I'm currently in demo mode. To enable full AI capabilities, you'll need to configure an AI provider (like OpenAI or Anthropic) in the backend.",
      "That's an interesting question! In production, I would provide a detailed response based on your query.",
      "I understand your request. This is a demo response. Configure your AI provider to get real, intelligent responses.",
      "Great question! Once you connect an AI provider, I'll be able to give you comprehensive answers.",
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    // Simulate streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const text = randomResponse;
        
        // Simulate typing effect
        for (let i = 0; i < text.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 20));
          controller.enqueue(encoder.encode(text[i]));
        }
        
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
