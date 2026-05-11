export interface Project {
  id?: string;
  name: string;
  language: string;
  code: string;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type SupportedLanguage = 
  | 'python' 
  | 'javascript' 
  | 'java' 
  | 'c' 
  | 'cpp' 
  | 'csharp' 
  | 'php' 
  | 'html' 
  | 'sql';

export const SUPPORTED_LANGUAGES: { value: SupportedLanguage; label: string; extension: string }[] = [
  { value: 'python', label: 'Python', extension: '.py' },
  { value: 'javascript', label: 'JavaScript', extension: '.js' },
  { value: 'java', label: 'Java', extension: '.java' },
  { value: 'c', label: 'C', extension: '.c' },
  { value: 'cpp', label: 'C++', extension: '.cpp' },
  { value: 'csharp', label: 'C#', extension: '.cs' },
  { value: 'php', label: 'PHP', extension: '.php' },
  { value: 'html', label: 'HTML/CSS', extension: '.html' },
  { value: 'sql', label: 'SQL', extension: '.sql' }
];

export const DEFAULT_BOILERPLATE: Record<SupportedLanguage, string> = {
  python: 'print("Hello, CodeNexus!")',
  javascript: 'console.log("Hello, CodeNexus!");',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeNexus!");\n    }\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, CodeNexus!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, CodeNexus!" << std::endl;\n    return 0;\n}',
  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, CodeNexus!");\n    }\n}',
  php: '<?php\necho "Hello, CodeNexus!";',
  html: '<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        body { font-family: sans-serif; }\n        h1 { color: #3b82f6; }\n    </style>\n</head>\n<body>\n    <h1>Hello, CodeNexus!</h1>\n    <p>This is a live preview.</p>\n</body>\n</html>',
  sql: 'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);\nINSERT INTO users (name) VALUES ("CodeNexus");\nSELECT * FROM users;'
};
