'use client';

import { useState, useRef, useEffect } from 'react';
import { aiCodingAssistant } from '@/ai/flows/ai-coding-assistant';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  User,
  Bot,
  Terminal,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Code2,
  Cpu,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const suggestedPrompts = [
  'Explain Dijkstra’s Algorithm in C++ with time & space complexity',
  'Optimize this O(n²) nested loop to O(n) using a Hash Map',
  'Implement an LRU Cache with O(1) get and put in Python',
  'How do I solve the 3Sum problem using Two Pointers?',
];

const promptResponseCache = new Map<string, string>();

export default function AiCodingAssistantPage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport =
        scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    // Check instant in-memory cache
    if (promptResponseCache.has(text)) {
      const cachedAns = promptResponseCache.get(text)!;
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'model', content: cachedAns },
      ]);
      if (!textToSend) setInput('');
      return;
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = newMessages.slice(0, -1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const result = await aiCodingAssistant({
        prompt: text,
        conversationHistory,
      });

      promptResponseCache.set(text, result.response);

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'model', content: result.response },
      ]);

      // Save interaction to Firebase
      const currentUid = user?.uid || auth.currentUser?.uid;
      if (currentUid) {
        const codeHistoryCol = collection(firestore, 'users', currentUid, 'codeAssistantHistory');
        addDocumentNonBlocking(codeHistoryCol, {
          userId: currentUid,
          prompt: text,
          response: result.response,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      toast({
        title: 'Error generating code response',
        description: 'Failed to connect to the AI model. Please try again.',
        variant: 'destructive',
      });
      // Restore user input so it is never lost
      if (!textToSend) setInput(text);
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: 'Code copied to clipboard' });
  };

  const clearChat = () => {
    setMessages([]);
    toast({ title: 'Conversation cleared' });
  };

  return (
    <div className="w-full h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-headline font-bold text-white tracking-tight">
                DSA & Coding Practice AI
              </h1>
              <Badge variant="outline" className="text-[10px] font-mono border-violet-500/30 text-violet-300">
                Gemini 2.5
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous algorithmic companion for problem solving, code optimization, and complexity analysis.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.05] text-xs h-8"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl glass-card overflow-hidden border-violet-500/20">
        <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/30 flex items-center justify-center">
                  <Code2 className="w-8 h-8 text-violet-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-base font-semibold text-white">How can I help you code today?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ask any data structure or algorithm question, paste a LeetCode problem statement, or ask for step-by-step code optimizations.
                </p>
              </div>

              {/* Starter prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl w-full pt-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 text-left rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 hover:bg-violet-950/20 text-slate-300 text-xs transition-all flex items-start justify-between group"
                  >
                    <span className="pr-2">{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3.5',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'model' && (
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shrink-0 shadow-md shadow-violet-500/20">
                      <Bot size={18} />
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed transition-all relative group',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-md shadow-violet-500/20 rounded-tr-sm'
                        : 'bg-[#11182B] border border-white/[0.08] text-slate-200 rounded-tl-sm shadow-md'
                    )}
                  >
                    {message.role === 'model' && (
                      <button
                        onClick={() => copyToClipboard(message.content, index)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white"
                        title="Copy Response"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <div className="prose prose-invert prose-xs max-w-none">
                      <ReactMarkdown
                        components={{
                          pre: ({ node, ...props }) => (
                            <pre
                              className="bg-[#090D1A] p-3.5 rounded-xl border border-white/[0.08] overflow-x-auto my-2.5 font-mono text-xs text-slate-200"
                              {...props}
                            />
                          ),
                          code: ({ node, ...props }) => (
                            <code
                              className="bg-[#090D1A] px-1.5 py-0.5 rounded text-violet-300 font-mono text-[11px]"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="p-2 rounded-xl bg-slate-800 text-slate-200 shrink-0 border border-white/[0.08]">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                    <Bot size={18} />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#11182B] border border-white/[0.08] flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                    <span>Analyzing algorithm complexity and drafting solution...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#090D1A]/60">
          <div className="flex items-end gap-2.5 max-w-4xl mx-auto">
            <div className="flex-1 relative rounded-xl border border-white/10 focus-within:border-violet-500/60 bg-[#11182B] transition-all">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask an algorithmic question, paste code, or ask for optimization..."
                className="w-full bg-transparent border-0 focus-visible:ring-0 resize-none text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 min-h-[48px] max-h-36 py-3 px-3.5"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="h-11 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium shadow-md shadow-violet-500/20 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between max-w-4xl mx-auto mt-2 text-[10px] font-mono text-slate-400 px-1">
            <span>Press Enter to send, Shift + Enter for new line</span>
            <span className="flex items-center gap-1 text-violet-400">
              <Cpu className="w-3 h-3" /> Gemini 2.5 Flash
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
