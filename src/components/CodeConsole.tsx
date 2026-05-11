import React from 'react';
import { Terminal, XCircle, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConsoleOutput {
  type: 'stdout' | 'stderr' | 'error' | 'system';
  content: string;
}

interface CodeConsoleProps {
  outputs: ConsoleOutput[];
  onClear: () => void;
  isLoading?: boolean;
}

export default function CodeConsole({ outputs, onClear, isLoading }: CodeConsoleProps) {
  return (
    <div id="console" className="h-48 flex flex-col bg-panel-bg border-t border-slate-800 shrink-0">
      <div className="flex items-center gap-4 px-4 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        <span className="text-slate-200 border-b border-brand-indigo pb-0.5 px-1">OUTPUT</span>
        <span className="hover:text-slate-300 cursor-pointer">TERMINAL</span>
        <span className="hover:text-slate-300 cursor-pointer">DEBUG CONSOLE</span>
        <div className="ml-auto flex items-center gap-2">
          <Trash2 
            size={12} 
            className="cursor-pointer hover:text-slate-300 transition-colors"
            onClick={onClear}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-1">
        {outputs.length === 0 && !isLoading && (
          <div className="text-slate-600 italic">No output yet. Run your code to see results.</div>
        )}
        
        {outputs.map((out, i) => (
          <div key={i} className={cn(
            "break-words py-0.5 border-l-2 pl-3",
            out.type === 'stdout' && "text-slate-100 border-emerald-500/50",
            out.type === 'stderr' && "text-rose-400 border-rose-500/50 bg-rose-500/5",
            out.type === 'error' && "text-rose-500 border-rose-600 bg-rose-600/5 font-bold",
            out.type === 'system' && "text-blue-400 border-blue-500/50 italic"
          )}>
            {out.content}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-blue-400 italic">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Executing code...
          </div>
        )}
      </div>
    </div>
  );
}
