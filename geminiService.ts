
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDynamicBriefing = async (levelTitle: string, operatorName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a high-ranking tactical commander. Write a 2-sentence mission briefing for an elite developer operator named ${operatorName}. The mission title is "${levelTitle}". The tone should be serious, military-style, but include a subtle developer-related joke or technical jargon.`,
    });
    return response.text || "Mission intel is classified. Proceed with caution.";
  } catch (error) {
    console.error("Gemini failed, using fallback briefing.", error);
    return "The system is dark. Proceed to target coordinates and await signal.";
  }
};
