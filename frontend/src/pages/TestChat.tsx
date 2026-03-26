import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const TestChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/test/ai', { message: userMsg });
      setMessages(prev => [...prev, { role: 'bot', content: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "Error: Could not connect to backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] max-w-5xl mx-auto bg-[#0a0b0d] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative animate-fade-in">
      {/* Mini Header */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <Sparkles className="text-emerald-400" size={18} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">AI Lab</h1>
            <div className="flex items-center gap-1.5 leading-none">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">Agent Active</span>
            </div>
          </div>
        </div>
        
        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] uppercase tracking-widest text-slate-500 font-black">
          Testing
        </div>
      </header>

      {/* Internal Scroll Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10 space-y-4 sm:space-y-6 scroll-smooth custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center opacity-40">
            <Bot size={64} className="mb-4 text-slate-700" />
            <h3 className="text-xl font-bold mb-1">Start chatting...</h3>
            <p className="text-sm max-w-xs px-4">Test your Manglish agent here. It will search the web if needed.</p>
          </div>
        )}

        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-bubble-in`}
          >
            <div className={`flex items-end gap-2 max-w-[90%] sm:max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-4 rounded-2xl sm:rounded-[2rem] text-[15px] sm:text-lg ${
                m.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none shadow-lg' 
                : 'bg-slate-900 border border-white/5 text-slate-200 rounded-bl-none'
              }`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-bubble-in">
            <div className="flex items-center gap-3 bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
              </div>
              <span className="text-[10px] text-cyan-400/50 font-black tracking-widest uppercase">Agent Thinking</span>
            </div>
          </div>
        )}
      </main>

      {/* Floating Style Input */}
      <footer className="p-4 sm:p-8 bg-gradient-to-t from-black to-transparent shrink-0">
        <div className="max-w-2xl mx-auto relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Try: 'Latest news enthandu aliya?'"
            className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 sm:py-5 pl-6 pr-16 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-base sm:text-xl shadow-2xl"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 rounded-xl transition-all shadow-lg active:scale-95 text-slate-950"
          >
            <Send size={24} />
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-bubble-in { animation: bubbleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default TestChat;
