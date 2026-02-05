import { GoogleGenAI } from "@google/genai";

export async function generateContent(apikey, prompt) {
  const ai = new GoogleGenAI({
    apiKey: apikey,
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text;
}