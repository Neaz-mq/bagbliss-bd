import { GoogleGenerativeAI } from "@google/generative-ai";

const getClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("⚠️  GEMINI_API_KEY is not set — AI features will be disabled");
    return null;
  }
  return new GoogleGenerativeAI(key);
};

const genAI = getClient();

export const geminiFlash = genAI?.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
});

export async function generateText(prompt: string): Promise<string> {
  if (!genAI) throw new Error("Gemini API key not configured");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  if (!genAI) throw new Error("Gemini API key not configured");
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text()) as T;
}