import { GoogleGenAI } from "@google/genai";
import { text } from "express";

export async function generateContent(apikey, prompt, text) {
  const ai = new GoogleGenAI({
    apiKey: apikey,
  });

  const input = prompt + " " + text.slice(7).trim();

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: input,
  });
  return response.text;
}

export default generateContent;
