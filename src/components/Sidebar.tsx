import { 
  FileCode, 
  FolderOpen, 
  Plus, 
  Search, 
  MessageSquare, 
  Zap, 
  HardDrive,
  Trash2,
  Clock,
  Files,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Library
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, Project } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  projects: Project[];
  activeProjectId?: string;
  onProjectSelect: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  isAIPanelOpen: boolean;
  onAIPanelToggle: () => void;
}

export default function Sidebar({
  projects,
  activeProjectId,
  onProjectSelect,
  onNewProject,
  onDeleteProject,
  isAIPanelOpen,
  onAIPanelToggle
}: SidebarProps) {
  return (
    <div className="h-full flex shrink-0">
      {/* Activity Bar */}
      <nav className="w-12 border-r border-slate-800 flex flex-col items-center py-4 gap-6 bg-panel-bg shrink-0">
        <Files className="w-6 h-6 text-slate-200 cursor-pointer" />
        <SearchIcon className="w-6 h-6 text-slate-500 cursor-pointer hover:text-slate-300 transition-colors" />
        <Library className="w-6 h-6 text-slate-500 cursor-pointer hover:text-slate-300 transition-colors" />
        <MessageSquare 
           onClick={onAIPanelToggle}
           className={cn("w-6 h-6 cursor-pointer transition-colors mt-2", isAIPanelOpen ? "text-brand-indigo" : "text-slate-500 hover:text-slate-300")} 
        />
        <div className="mt-auto flex flex-col items-center gap-6">
          <Zap className="w-5 h-5 text-slate-500 cursor-pointer hover:text-amber-400 transition-colors" />
          <SettingsIcon className="w-6 h-6 text-slate-500 cursor-pointer hover:text-slate-300 transition-colors" />
        </div>
      </nav>

      {/* Explorer Panel */}
      <aside className="w-56 bg-panel-bg border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
          <span>Explorer</span>
          <button onClick={onNewProject} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-0.5">
            {projects.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <HardDrive className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                <p className="text-[10px] text-slate-600 uppercase tracking-tight">No Projects</p>
              </div>
            ) : (
              projects.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "group flex items-center justify-between px-3 py-1.5 cursor-pointer transition-all border-l-2",
                    activeProjectId === p.id 
                      ? "bg-slate-800/40 border-brand-indigo text-slate-100" 
                      : "border-transparent text-slate-400 hover:bg-slate-800/20 hover:text-slate-200"
                  )}
                >
                  <div 
                    className="flex items-center gap-2.5 flex-1 min-w-0"
                    onClick={() => p.id && onProjectSelect(p.id)}
                  >
                    <FileCode size={14} className={cn(activeProjectId === p.id ? "text-brand-indigo" : "text-slate-600")} />
                    <span className="text-xs truncate font-medium">{p.name}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); p.id && onDeleteProject(p.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
             )}
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 mt-auto">
           <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">
             <span>Resources</span>
           </div>
           <div className="space-y-1">
             <SidebarLink icon={<Clock size={14} />} label="Recent" />
             <SidebarLink icon={<Zap size={14} />} label="Upgrade" />
           </div>
        </div>
      </aside>
    </div>
  );
}

function SidebarLink({ icon, label, active }: { icon: React.ReactNode, label: string; active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all",
      active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
    )}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
