import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  },
});

export const geminiFlashFast = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b", // even faster, still free
  generationConfig: {
    temperature: 0.5,
    maxOutputTokens: 512,
  },
});

export async function generateText(prompt: string): Promise<string> {
  const result = await geminiFlash.generateContent(prompt);
  return result.response.text();
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as T;
}