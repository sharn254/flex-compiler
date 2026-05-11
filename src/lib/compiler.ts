export interface ExecuteResponse {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  language: string;
  version: string;
}

export const LANGUAGE_VERSIONS: Record<string, string> = {
  python: "3.10.0",
  javascript: "18.15.0",
  java: "15.0.2",
  c: "10.2.1",
  cpp: "10.2.1",
  csharp: "6.12.0",
  php: "8.2.3",
  typescript: "5.0.3",
  go: "1.16.2",
  rust: "1.68.2",
  ruby: "3.0.1"
};

export const PISTON_LANGUAGE_MAP: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  php: "php",
  sql: "sqlite3",
  html: "html", // HTML/CSS doesn't run in Piston usually, but we'll handle it specially in UI
  css: "css"
};

export async function executeCode(language: string, sourceCode: string): Promise<ExecuteResponse> {
  const pistonLang = PISTON_LANGUAGE_MAP[language] || language;
  
  if (language === 'html' || language === 'css') {
    // Return dummy response for HTML/CSS as they are client-side
    return {
      run: {
        stdout: "HTML/CSS is rendered in the preview window.",
        stderr: "",
        code: 0,
        signal: null,
        output: "Rendered successfully."
      },
      language,
      version: "browser"
    };
  }

  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: pistonLang,
      version: LANGUAGE_VERSIONS[pistonLang] || "*",
      files: [{ content: sourceCode }]
    })
  });

  if (!response.ok) {
    throw new Error(`Execution failed: ${response.statusText}`);
  }

  return response.json();
}
