import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, Bug, RefreshCcw, Wand2, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { chatWithAI, explainCode, debugCode, generateCode, convertCode } from '../lib/ai';
import { ChatMessage, SupportedLanguage } from '../types';
import { cn } from '../lib/utils';

interface AIAssistantProps {
  currentCode: string;
  currentLanguage: SupportedLanguage;
  onCodeChange: (code: string) => void;
}

export default function AIAssistant({ currentCode, currentLanguage, onCodeChange }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await chatWithAI(history);
      setMessages(prev => [...prev, { role: 'model', content: response || 'Sorry, I encountered an error.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'Error connecting to Gemini API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const runTask = async (task: string) => {
    setIsLoading(true);
    let response = '';
    try {
      if (task === 'explain') response = await explainCode(currentCode, currentLanguage);
      if (task === 'debug') response = await debugCode(currentCode, "User requested debugging.", currentLanguage);
      if (task === 'suggest') response = await chatWithAI([{ role: 'user', parts: [{ text: `Suggest improvements and performance optimizations for this ${currentLanguage} code:\n\n${currentCode}` }] }]);
      
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-assistant" className="flex flex-col h-full bg-panel-bg border-l border-slate-800 w-80 lg:w-80 shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-indigo"></div>
          <h2 className="font-semibold text-sm text-slate-100 uppercase tracking-tight">CodeNexus AI</h2>
        </div>
        <span className="text-[10px] bg-brand-indigo/10 text-brand-indigo px-1.5 py-0.5 rounded border border-brand-indigo/20 font-bold">GEMINI 2.0</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="space-y-6 py-4">
            <div className="bg-slate-800/40 p-4 rounded-lg text-xs leading-relaxed text-slate-300 border border-slate-800/50">
              Hi! I'm your CodeNexus AI assistant. I can help you generate logic, debug errors, or explain complex code patterns. What's on your mind?
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Suggested Actions</span>
              <div className="grid grid-cols-1 gap-2">
                <QuickAction icon={<BookOpen size={14}/>} label="Explain current logic" onClick={() => runTask('explain')} />
                <QuickAction icon={<Bug size={14}/>} label="Debug active file" onClick={() => runTask('debug')} />
                <QuickAction icon={<RefreshCcw size={14}/>} label="Suggest optimizations" onClick={() => runTask('suggest')} />
              </div>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex flex-col max-w-[95%]", m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
             <div className={cn("p-3 rounded-lg text-xs leading-relaxed prose prose-invert prose-p:my-1 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-code:text-brand-indigo", 
              m.role === 'user' ? "bg-brand-indigo text-white shadow-lg shadow-brand-indigo/10" : "bg-slate-800/40 border border-slate-700/50 text-slate-300")}>
              <Markdown>{m.content}</Markdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-1.5 items-center bg-slate-800/30 p-2 rounded-lg mr-auto">
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse delay-75" />
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse delay-150" />
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/50 border-t border-slate-800">
        <div className="bg-slate-900 border border-slate-700 rounded p-2 flex flex-col gap-2 ring-1 ring-slate-800/50">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything..."
            className="w-full bg-transparent border-none text-xs text-slate-200 resize-none outline-none focus:ring-0 placeholder:text-slate-600 font-sans leading-relaxed"
            rows={3}
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
          />
          <div className="flex items-center justify-between border-t border-slate-800 pt-2">
            <div className="flex items-center gap-1.5">
               <Sparkles size={14} className="text-slate-600 hover:text-slate-400 cursor-pointer transition-colors" />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-1 px-3 bg-brand-indigo hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode, label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2.5 rounded border border-slate-800/60 hover:border-brand-indigo hover:bg-brand-indigo/5 text-[11px] text-slate-400 font-medium transition-all group flex items-center gap-3"
    >
      <span className="text-slate-600 group-hover:text-brand-indigo transition-colors">{icon}</span>
      <span className="group-hover:text-slate-200 transition-colors">{label}</span>
    </button>
  );
}
