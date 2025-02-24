import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Image as ImageIcon, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  contentType?: 'text' | 'image' | 'preview';
  isTyping?: boolean;
}

const MARKETING_PROMPT = `As an expert marketing AI assistant with deep knowledge of digital marketing best practices, social media platforms, and campaign optimization, help create effective marketing campaigns. Consider:

1. Brand voice and target audience
2. Platform-specific content strategies
3. Industry trends and best practices
4. Performance metrics and ROI
5. Creative and engaging content approaches`;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    type: 'ai',
    content: "Hello! I'm your AI marketing assistant. Tell me about the campaign you want to create.",
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typewriterEffect = async (text: string, messageId: string) => {
    setIsTyping(true);
    const chars = text.split('');
    let typed = '';

    for (const char of chars) {
      typed += char;
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: typed, isTyping: true }
            : msg
        )
      );
      await new Promise(resolve => setTimeout(resolve, 25));
    }

    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isTyping: false }
          : msg
      )
    );
    setIsTyping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessageId = Date.now().toString();
    const aiMessageId = (Date.now() + 1).toString();

    // Add user message
    setMessages(prev => [...prev, { 
      id: userMessageId, 
      type: 'user', 
      content: input 
    }]);
    setInput('');

    // Add AI thinking message
    setMessages(prev => [...prev, { 
      id: aiMessageId, 
      type: 'ai', 
      content: '', 
      isTyping: true 
    }]);

    try {
      // Get AI response
      const res = await apiRequest("POST", "/api/chat", {
        message: `${MARKETING_PROMPT}\n\nUser: ${input}`,
      });
      const data = await res.json();

      // Display AI response with typewriter effect
      await typewriterEffect(data.response, aiMessageId);

      // If the response contains image prompts, add preview
      if (data.response.includes('image') || data.response.includes('visual')) {
        const previewId = (Date.now() + 2).toString();
        setMessages(prev => [...prev, {
          id: previewId,
          type: 'ai',
          content: 'Here\'s a preview of how your campaign might look:',
          contentType: 'preview'
        }]);
      }
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId
            ? { ...msg, content: "Sorry, I encountered an error. Please try again.", isTyping: false }
            : msg
        )
      );
      setIsTyping(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 p-4 flex flex-col space-y-4">
        <ScrollArea className="flex-1 pr-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 mb-4 ${
                message.type === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0">
                {message.type === 'user' ? (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-secondary'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.contentType === 'image' && (
                    <ImageIcon className="w-4 h-4 mt-1" />
                  )}
                  {message.contentType === 'preview' && (
                    <FileText className="w-4 h-4 mt-1" />
                  )}
                  <div>
                    {message.content}
                    {message.isTyping && <span className="animate-pulse">▋</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me about your campaign..."
            disabled={isTyping}
          />
          <Button type="submit" disabled={!input.trim() || isTyping}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}