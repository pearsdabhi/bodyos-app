
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Paperclip, Loader2, User, Sparkles, X } from 'lucide-react';
import { chatWithPro } from '../geminiService';
import { Message } from '../types';

const InsightChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am BODYOS Insights. Upload an image or just start typing to get deep multimodal analysis.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentImg = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await chatWithPro(currentInput || "Analyze this image", currentImg?.split(',')[1]);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || "I'm sorry, I couldn't process that.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "Error: Failed to connect to Gemini Pro. Please check your API configuration.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-white">BODYOS Insights</h2>
            <p className="text-xs text-slate-500">Gemini 3 Pro Multimodal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-violet-500/20 text-violet-400' : 
                msg.role === 'system' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`space-y-2`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                    : msg.role === 'system'
                    ? 'bg-rose-950/30 text-rose-200 border border-rose-900/50'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'
                }`}>
                  {msg.image && (
                    <img src={msg.image} alt="User Upload" className="mb-3 rounded-lg max-h-80 w-full object-cover border border-slate-700/50" />
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className={`text-[10px] text-slate-500 font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Loader2 className="animate-spin" size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-slate-400 text-sm italic">
                Analyzing request...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-slate-900 border-t border-slate-800">
        {selectedImage && (
          <div className="mb-4 relative w-24 group">
            <img src={selectedImage} alt="Preview" className="w-24 h-24 object-cover rounded-xl border-2 border-cyan-500/50 shadow-lg" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-slate-950 rounded-full p-1 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex gap-3 items-center bg-slate-800/80 rounded-2xl p-2 pl-4 border border-slate-700 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all shadow-inner">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
            title="Upload Image"
          >
            <ImageIcon size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
          />
          <button className="text-slate-400 hover:text-cyan-400 transition-colors p-1">
            <Paperclip size={20} />
          </button>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask BODYOS anything..."
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-100 text-sm py-2"
          />
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className={`
              p-2.5 rounded-xl transition-all duration-200 shadow-lg
              ${(!input.trim() && !selectedImage) || isLoading 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-tr from-cyan-500 to-violet-600 text-white hover:shadow-cyan-500/25 hover:scale-105 active:scale-95'
              }
            `}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightChat;
