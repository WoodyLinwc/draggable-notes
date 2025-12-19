
import { GoogleGenAI } from "@google/genai";

// Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async summarizeNote(content: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Please summarize the following note content concisely. Keep it under 20 words:\n\n${content}`,
    });
    // Directly access the .text property from GenerateContentResponse
    return response.text || content;
  },

  async refineTone(content: string, tone: 'professional' | 'creative' | 'friendly'): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rewrite the following note content to have a ${tone} tone. Keep the core meaning identical:\n\n${content}`,
    });
    // Directly access the .text property from GenerateContentResponse
    return response.text || content;
  }
};
