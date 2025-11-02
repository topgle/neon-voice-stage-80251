import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, Loader2, Bot, User, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const VoiceAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Olá! Sou seu assistente do Neon Voice Stage. Como posso ajudar? Você pode me pedir para:\n\n• Buscar músicas de karaokê\n• Adicionar músicas a playlists\n• Iniciar modo The Voices\n• Listar suas playlists ou músicas',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: { 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Erro ao processar comando');
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro ao processar seu pedido. Tente novamente.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const exampleCommands = [
    "Listar minhas playlists",
    "Buscar Bohemian Rhapsody karaoke",
    "Iniciar modo The Voices com Ana, João e Maria",
    "Mostrar minhas músicas"
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b">
          <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Assistente de Voz</h3>
            <p className="text-sm text-muted-foreground">
              Comandos em linguagem natural
            </p>
          </div>
        </div>

        <ScrollArea 
          ref={scrollRef}
          className="h-[400px] pr-4 mb-4"
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === 'user' 
                    ? 'bg-primary' 
                    : 'bg-gradient-primary'
                )}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <div className={cn(
                  "flex flex-col gap-1 max-w-[80%]",
                  message.role === 'user' ? 'items-end' : 'items-start'
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-2",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground px-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-secondary rounded-2xl px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Experimente estes comandos:
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleCommands.map((cmd, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(cmd)}
                  className="text-xs"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {cmd}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite seu comando aqui..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};