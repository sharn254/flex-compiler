import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Save, 
  Download, 
  Share2, 
  Settings, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  Layout,
  Code2
} from 'lucide-react';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { User } from 'firebase/auth';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../types';
import { cn } from '../lib/utils';

interface NavbarProps {
  currentProjectName: string;
  onProjectNameChange: (name: string) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onRun: () => void;
  onSave: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export default function Navbar({
  currentProjectName,
  onProjectNameChange,
  currentLanguage,
  onLanguageChange,
  onRun,
  onSave,
  onDownload,
  onShare
}: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  return (
    <nav className="h-12 bg-panel-bg border-b border-slate-800 flex items-center justify-between px-4 z-50 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-indigo rounded flex items-center justify-center text-white">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white hidden sm:inline-block">CODENEXUS AI</span>
        </div>

        <div className="h-4 w-[1px] bg-slate-700 hidden md:block" />

        <div className="flex items-center gap-1 font-mono">
          <span className="text-xs text-slate-500">projects / </span>
          <input
            type="text"
            value={currentProjectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-slate-200 font-medium text-xs w-32 hover:bg-slate-800/50 rounded px-1 transition-colors outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative group">
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="appearance-none bg-slate-900 border border-slate-700 rounded py-1 px-3 pr-8 text-xs font-medium text-slate-300 focus:outline-none focus:border-brand-indigo cursor-pointer transition-colors"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
        </div>

        <button
          onClick={onRun}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-xs font-semibold transition-all shadow-lg shadow-emerald-600/10"
        >
          <Play size={12} className="fill-white" />
          <span className="hidden sm:inline">Run Code</span>
        </button>

        <div className="h-4 w-[px] bg-slate-800 mx-1" />

        <div className="flex items-center gap-0.5">
          <button onClick={onSave} title="Save" className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors">
            <Save size={16} />
          </button>
          <button onClick={onDownload} title="Download" className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors">
            <Download size={16} />
          </button>
          <button onClick={onShare} title="Share" className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors">
            <Share2 size={16} />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {!user ? (
          <button
            onClick={() => loginWithGoogle()}
            className="flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-900 px-4 py-1.5 rounded-md text-sm font-semibold transition-all"
          >
            Sign In
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 hover:bg-slate-800 p-1 rounded-lg transition-all"
            >
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-slate-700" />
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isUserMenuOpen && "rotate-180")} />
            </button>
            
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-medium text-slate-200 truncate">{user.email}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
                    <Layout size={16} /> Dashboard
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
                    <Settings size={16} /> Settings
                  </button>
                  <button
                    onClick={() => { logout(); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors border-t border-slate-800"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
