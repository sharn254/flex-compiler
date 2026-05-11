import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import CodeConsole from './components/CodeConsole';
import AIAssistant from './components/AIAssistant';
import Preview from './components/Preview';
import { Project, SupportedLanguage, DEFAULT_BOILERPLATE } from './types';
import { executeCode } from './lib/compiler';
import { auth, getProjects, saveProject, deleteProject } from './lib/firebase';
import { User } from 'firebase/auth';
import { AnimatePresence, motion } from 'motion/react';
import { PanelLeftClose, PanelLeftOpen, Terminal } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project>({
    name: 'Untitled Project',
    language: 'python',
    code: DEFAULT_BOILERPLATE.python,
    userId: ''
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [outputs, setOutputs] = useState<{ type: 'stdout' | 'stderr' | 'error' | 'system', content: string }[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Auth & Project Loading
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const userProjects = await getProjects(u.uid);
        setProjects(userProjects as Project[]);
        setCurrentProject(prev => ({ ...prev, userId: u.uid }));
      } else {
        setProjects([]);
        setCurrentProject({
          name: 'Untitled Project',
          language: 'python',
          code: DEFAULT_BOILERPLATE.python,
          userId: ''
        });
      }
    });
    return unsubscribe;
  }, []);

  const handleLanguageChange = useCallback((lang: SupportedLanguage) => {
    setCurrentProject(prev => ({
      ...prev,
      language: lang,
      // Only reset code if it's currently boilerplate
      code: prev.code === DEFAULT_BOILERPLATE[prev.language as SupportedLanguage] 
        ? DEFAULT_BOILERPLATE[lang] 
        : prev.code
    }));
  }, []);

  const handleRun = async () => {
    setIsConsoleOpen(true);
    setIsExecuting(true);
    setOutputs(prev => [...prev, { type: 'system', content: `> Running ${currentProject.language} code...` }]);

    try {
      const result = await executeCode(currentProject.language, currentProject.code);
      
      if (result.run.stdout) {
        setOutputs(prev => [...prev, { type: 'stdout', content: result.run.stdout }]);
      }
      if (result.run.stderr) {
        setOutputs(prev => [...prev, { type: 'stderr', content: result.run.stderr }]);
      }
      if (!result.run.stdout && !result.run.stderr) {
        setOutputs(prev => [...prev, { type: 'system', content: "Program finished with no output." }]);
      }
    } catch (error) {
      setOutputs(prev => [...prev, { type: 'error', content: `Execution Error: ${error instanceof Error ? error.message : String(error)}` }]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert("Please sign in to save projects.");
      return;
    }
    
    try {
      const id = await saveProject(user.uid, {
        ...currentProject,
        userId: user.uid
      });
      
      if (!currentProject.id) {
        setCurrentProject(prev => ({ ...prev, id }));
      }
      
      const userProjects = await getProjects(user.uid);
      setProjects(userProjects as Project[]);
      setOutputs(prev => [...prev, { type: 'system', content: "Project saved successfully." }]);
    } catch (error) {
      console.error(error);
      setOutputs(prev => [...prev, { type: 'error', content: "Failed to save project." }]);
    }
  };

  const handleNewProject = () => {
    setCurrentProject({
      name: 'Untitled Project',
      language: 'python',
      code: DEFAULT_BOILERPLATE.python,
      userId: user?.uid || ''
    });
    setOutputs([{ type: 'system', content: "Created new project." }]);
  };

  const handleProjectSelect = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProject(project);
      setOutputs([{ type: 'system', content: `Loaded project: ${project.name}` }]);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
      if (user) {
        const userProjects = await getProjects(user.uid);
        setProjects(userProjects as Project[]);
      }
      if (currentProject.id === id) {
        handleNewProject();
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentProject.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ext = currentProject.language === 'python' ? 'py' : 
                currentProject.language === 'javascript' ? 'js' : 
                currentProject.language === 'html' ? 'html' : 'txt';
    a.href = url;
    a.download = `${currentProject.name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setOutputs(prev => [...prev, { type: 'system', content: "Share link copied to clipboard!" }]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Navbar 
        currentProjectName={currentProject.name}
        onProjectNameChange={(name) => setCurrentProject(prev => ({ ...prev, name }))}
        currentLanguage={currentProject.language as SupportedLanguage}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        onSave={handleSave}
        onDownload={handleDownload}
        onShare={handleShare}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar (Activity Bar + Explorer) */}
        <div className={cn(
          "transition-all duration-300 ease-in-out flex flex-col h-full bg-panel-bg shrink-0",
          isSidebarOpen ? "w-[272px]" : "w-0 overflow-hidden opacity-0"
        )}>
          <Sidebar 
            projects={projects}
            activeProjectId={currentProject.id}
            onProjectSelect={handleProjectSelect}
            onNewProject={handleNewProject}
            onDeleteProject={handleDelete}
            isAIPanelOpen={isAIPanelOpen}
            onAIPanelToggle={() => setIsAIPanelOpen(!isAIPanelOpen)}
          />
        </div>

        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-[272px] top-1/2 -translate-y-1/2 z-40 bg-slate-800 border-y border-r border-slate-700 p-0.5 rounded-r text-slate-500 hover:text-white transition-all shadow-xl"
          style={{ left: isSidebarOpen ? '272px' : '0' }}
        >
          {isSidebarOpen ? <PanelLeftClose size={12} /> : <PanelLeftOpen size={12} />}
        </button>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-editor-bg">
          <div className="flex-1 flex relative">
            <div className={cn("flex-1 flex flex-col min-w-0 transition-all")}>
              <div className="flex-1 overflow-hidden relative">
                {currentProject.language === 'html' ? (
                  <div className="flex h-full">
                    <div className="w-1/2 border-r border-slate-800">
                      <CodeEditor 
                        code={currentProject.code} 
                        language={currentProject.language as SupportedLanguage}
                        onChange={(val) => setCurrentProject(prev => ({ ...prev, code: val || '' }))}
                      />
                    </div>
                    <div className="w-1/2">
                      <Preview html={currentProject.code} />
                    </div>
                  </div>
                ) : (
                  <CodeEditor 
                    code={currentProject.code} 
                    language={currentProject.language as SupportedLanguage}
                    onChange={(val) => setCurrentProject(prev => ({ ...prev, code: val || '' }))}
                  />
                )}
              </div>
              
              <AnimatePresence>
                {isConsoleOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 192 }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <CodeConsole 
                      outputs={outputs} 
                      onClear={() => setOutputs([])}
                      isLoading={isExecuting}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className={cn(
                  "absolute right-6 bottom-4 z-40 p-2 rounded-lg shadow-lg transition-all border border-slate-700",
                  isConsoleOpen ? "bg-brand-indigo text-white" : "bg-slate-800 text-slate-400"
                )}
                title={isConsoleOpen ? "Hide Console" : "Show Console"}
              >
                <Terminal size={16} />
              </button>
            </div>

            {/* AI Assistant Panel */}
            <AnimatePresence>
              {isAIPanelOpen && (
                <motion.div
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="z-30 h-full"
                >
                  <AIAssistant 
                    currentCode={currentProject.code}
                    currentLanguage={currentProject.language as SupportedLanguage}
                    onCodeChange={(code) => setCurrentProject(prev => ({ ...prev, code }))}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-6 border-t border-slate-800 bg-brand-indigo flex items-center px-3 justify-between shrink-0 z-50">
        <div className="flex items-center gap-4 text-[10px] text-white font-medium uppercase tracking-tight">
          <div className="flex items-center gap-1 hover:bg-white/10 px-1 rounded cursor-pointer">
             <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
             main*
          </div>
          <div className="hidden sm:flex items-center gap-3">
             <span>Ln 1, Col 1</span>
             <span>Spaces: 4</span>
             <span>UTF-8</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-indigo-100 font-bold tracking-tighter">
          <div className="flex items-center gap-1.5">
            AI READY
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1">
            v2.4.0
          </div>
        </div>
      </footer>
    </div>
  );
}
