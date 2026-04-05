import { useState, useRef, useEffect } from 'react';
import { chatCompletion, CHAT_SYSTEM_PROMPT, type AIMessage } from '../../../lib/ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const aiMessages: AIMessage[] = [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        ...newMessages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ];
      const response = await chatCompletion(aiMessages);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderInline = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <p key={i} className="font-semibold mt-2 mb-1">{line.replace('## ', '')}</p>;
      }
      if (line.startsWith('- ')) {
        return (
          <div key={i} className="flex gap-1.5 ml-1">
            <span className="opacity-50">•</span>
            <span>{renderInline(line.replace('- ', ''))}</span>
          </div>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={i} className="flex gap-1.5 ml-1">
            <span className="opacity-50 min-w-[1.2rem]">{line.match(/^(\d+)\./)?.[1]}.</span>
            <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-1.5" />;
      if (line.startsWith('⚖️')) {
        return <p key={i} className="text-sm italic opacity-70 mt-2 pt-2 border-t border-white/10">{line}</p>;
      }
      return <p key={i} className="leading-relaxed">{renderInline(line)}</p>;
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#8B8B73' }}
        aria-label={open ? 'Close chat' : 'Open tenant advocate chat'}
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🛡️</span>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-22 right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] h-[500px] max-h-[calc(100vh-8rem)] rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden"
          style={{ backgroundColor: '#F7F3EE' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3" style={{ backgroundColor: '#8B8B73' }}>
            <span className="text-xl">🛡️</span>
            <div>
              <p className="text-sm font-semibold text-white">Tenant Advocate</p>
              <p className="text-sm text-white/70">Colorado rental rights advisor</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <p className="text-2xl">🛡️</p>
                <p className="text-sm font-medium text-text">Hi! I'm your Tenant Advocate.</p>
                <p className="text-sm text-text-muted leading-relaxed px-4">
                  Ask me about your rental rights in Colorado. I know habitability standards, 
                  security deposits, evictions, ESA protections, and more.
                </p>
                <div className="space-y-1.5 pt-2">
                  {[
                    'Can my landlord keep my security deposit?',
                    'What are my rights if the heat stops working?',
                    'Can I be evicted for having an ESA?',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="block w-full text-left px-3 py-2 text-sm rounded-lg border border-border bg-white hover:bg-sage-50 hover:border-sage-300 text-text-muted hover:text-text transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-sage-600 text-white rounded-br-sm'
                      : 'bg-white border border-border text-text rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? renderMessageContent(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border rounded-xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-white">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your tenant rights..."
                className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-sage-400/30 focus:border-sage-400"
                rows={1}
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="self-end px-3 py-2 rounded-lg text-white transition-all disabled:opacity-40"
                style={{ backgroundColor: '#8B8B73' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-text-muted/60 text-center mt-1.5">
              AI-powered · Not legal advice
            </p>
          </div>
        </div>
      )}
    </>
  );
}
