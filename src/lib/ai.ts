import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithAI(messages: { role: 'user' | 'model', parts: { text: string }[] }[], systemInstruction?: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages,
    config: {
      systemInstruction: systemInstruction || "You are a professional coding assistant named CodeNexus AI. You help users write, debug, and understand code across many languages. You are concise, accurate, and educational."
    }
  });

  const response = await model;
  return response.text;
}

export async function explainCode(code: string, language: string) {
  const prompt = `Explain the following ${language} code line by line:\n\n\`\`\`${language}\n${code}\n\`\`\``;
  return chatWithAI([{ role: 'user', parts: [{ text: prompt }] }]);
}

export async function debugCode(code: string, error: string, language: string) {
  const prompt = `I have a bug in my ${language} code. Here is the code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nAnd here is the error:\n${error}\n\nPlease help me fix it and explain the solution.`;
  return chatWithAI([{ role: 'user', parts: [{ text: prompt }] }]);
}

export async function generateCode(prompt: string, language: string) {
  const fullPrompt = `Generate a code snippet for the following requirement in ${language}:\n\n${prompt}`;
  return chatWithAI([{ role: 'user', parts: [{ text: fullPrompt }] }]);
}

export async function convertCode(code: string, fromLang: string, toLang: string) {
  const prompt = `Convert the following ${fromLang} code to ${toLang}:\n\n\`\`\`${fromLang}\n${code}\n\`\`\``;
  return chatWithAI([{ role: 'user', parts: [{ text: prompt }] }]);
}
