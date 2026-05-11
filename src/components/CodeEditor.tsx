import React from 'react';
import Editor from '@monaco-editor/react';
import { SupportedLanguage } from '../types';

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onChange: (value: string | undefined) => void;
  theme?: 'vs-dark' | 'light';
}

export default function CodeEditor({ code, language, onChange, theme = 'vs-dark' }: CodeEditorProps) {
  return (
    <div className="flex-1 w-full h-full min-h-0 bg-slate-900 overflow-hidden">
      <Editor
        height="100%"
        width="100%"
        language={language === 'html' ? 'html' : language === 'cpp' ? 'cpp' : language}
        value={code}
        onChange={onChange}
        theme={theme}
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          minimap: { enabled: true },
          padding: { top: 16, bottom: 16 },
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          formatOnPaste: true,
          wordWrap: 'on'
        }}
      />
    </div>
  );
}
