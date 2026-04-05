
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  UserCircle2, 
  Wand2, 
  RefreshCw, 
  Target, 
  ArrowRight,
  Camera,
  Video,
  Clock,
  Zap,
  Command
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Message, AppTab } from '../types';
// Fixed: Removed the missing 'optimizeWorkoutPlan' import from geminiService
import { chatWithPro } from '../geminiService';

const TypingIndicator = () => (
  <div className="flex items-center space-x-1.5 bg-slate-800 w-fit p-3 px-4 rounded-2xl rounded-tl-none">
    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
  </div>
);

const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "BODYOS Nexus online. Biometrics analyzed. Your weight has plateaued (84.2kg), and your 'Anatomy Engine' flags your Back as 'Cold'. I recommend a high-volume pulling session today. Short on time?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      const response = await chatWithPro(textToSend, { 
        weight_plateau: true, 
        cold_muscle: 'back',
        short_on_time: textToSend.toLowerCase().includes('time') || textToSend.toLowerCase().includes('hurry')
      });
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response || "Consulting Nexus mainframe...", timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const nexusCommands = [
    { label: "Back is 'Cold'", cmd: "My back is cold, prioritize it today.", icon: <Zap size={14}/> },
    { label: "Short on Time", cmd: "I'm in a hurry, use supersets.", icon: <Clock size={14}/> },
    { label: "Plateau Fix", cmd: "Adjust my nutrition for this plateau.", icon: <Target size={14}/> },
  ];

  return (
    <div className="flex h-dvh flex-col bg-slate-950 text-white overflow-hidden lg:h-[calc(100vh-80px)] lg:rounded-[2.5rem] lg:border lg:border-slate-900 shadow-2xl">
      <header className="p-4 border-b border-slate-900 bg-slate-900/50 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Command size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">BODYOS Nexus</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Deep Logic Active</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-950/20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-lg ${
                msg.role === 'user' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-cyan-400 border border-slate-700'
              }`}>
                {msg.role === 'user' ? <UserCircle2 size={18} /> : <Sparkles size={18} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none shadow-xl'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700"><Loader2 className="animate-spin" size={16} /></div>
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {nexusCommands.map((nc) => (
            <button key={nc.label} onClick={() => handleSend(nc.cmd)} className="whitespace-nowrap px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 flex items-center gap-2 transition-all">
               {nc.icon} {nc.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 bg-slate-950 rounded-2xl p-2 border border-slate-800">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Instruct Nexus..."
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-slate-100 placeholder:text-slate-600"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl ${!input.trim() || isLoading ? 'bg-slate-800 text-slate-600' : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95'}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
