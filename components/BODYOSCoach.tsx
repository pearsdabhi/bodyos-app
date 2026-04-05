
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  UserCircle2, 
  Target, 
  Clock, 
  Zap, 
  Command,
  Database,
  Code
} from 'lucide-react';
import { Message } from '../types';
import { chatWithPro } from '../geminiService';

const BODYOSCoach: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "NEXUS Core Online. I am auditing your pull-to-push symmetry and muscle fatigue scores. Request logic injection below.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Mocking context injection for symmetry and fatigue
      const response = await chatWithPro(textToSend, { 
        symmetry_audit: "0.72 (PUSH DOMINANT)",
        fatigue_score: "82% (RECOVERY REQUIRED)"
      });
      
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response || "NEXUS: Error in logic stream.", timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-slate-950 text-white overflow-hidden lg:rounded-[2.5rem] lg:border lg:border-slate-900 shadow-2xl">
      <header className="p-4 border-b border-slate-900 bg-slate-900/50 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Command size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Nexus Logic Engine</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Backend Control Protocol</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          // Parse out logic payload for visualization
          const logicMatch = msg.content.match(/<logic_payload>([\s\S]*?)<\/logic_payload>/);
          const cleanText = msg.content.replace(/<logic_payload>[\s\S]*?<\/logic_payload>/, '').trim();
          
          return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-lg ${
                  msg.role === 'user' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}>
                  {msg.role === 'user' ? <UserCircle2 size={18} /> : <Database size={18} />}
                </div>
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none shadow-xl'
                  }`}>
                    {cleanText}
                  </div>
                  
                  {logicMatch && (
                    <div className="bg-slate-900 border border-cyan-500/20 p-4 rounded-2xl overflow-hidden animate-in slide-in-from-top-2">
                       <div className="flex items-center gap-2 mb-2 text-cyan-400">
                          <Code size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Logic Payload Syncing...</span>
                       </div>
                       <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap leading-tight bg-black/30 p-2 rounded-lg">
                         {logicMatch[1]}
                       </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700"><Loader2 className="animate-spin" size={16} /></div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950 rounded-2xl p-2 border border-slate-800 focus-within:border-cyan-500/50 transition-colors">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Instruct Nexus..."
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-slate-100 placeholder:text-slate-600 font-medium"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all ${!input.trim() || isLoading ? 'bg-slate-800 text-slate-600' : 'bg-cyan-500 text-slate-950 shadow-lg active:scale-95'}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BODYOSCoach;
