import React from 'react';

interface PreviewProps {
  html: string;
}

export default function Preview({ html }: PreviewProps) {
  const srcDoc = `
    <html>
      <head>
        <style>
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #f1f1f1; }
          ::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #555; }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.onerror = function(msg, url, line) {
            window.parent.postMessage({ type: 'error', content: msg + " at line " + line }, '*');
          };
        </script>
      </body>
    </html>
  `;

  return (
    <div className="h-full w-full bg-white overflow-hidden">
      <iframe
        srcDoc={srcDoc}
        title="preview"
        sandbox="allow-scripts"
        className="w-full h-full border-none"
      />
    </div>
  );
}
