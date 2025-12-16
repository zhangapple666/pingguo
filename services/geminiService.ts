import { GoogleGenAI, Type } from "@google/genai";
import { TaskAnalysis } from "../types";

const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey: apiKey });
}

export const analyzeTaskPriority = async (taskContent: string): Promise<TaskAnalysis> => {
  if (!ai) {
    console.warn("API Key not found, returning default");
    return { isUrgent: false, isImportant: false, reasoning: "API Key missing" };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following task and categorize it into the Eisenhower Matrix (Urgency/Importance). 
      Task: "${taskContent}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isUrgent: { type: Type.BOOLEAN, description: "Does this task require immediate attention?" },
            isImportant: { type: Type.BOOLEAN, description: "Does this task contribute to long-term mission, values, or goals?" },
            reasoning: { type: Type.STRING, description: "Short explanation for the classification." }
          },
          required: ["isUrgent", "isImportant", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as TaskAnalysis;
  } catch (error) {
    console.error("Error analyzing task:", error);
    // Fallback to Q2 (Schedule) as a safe default if AI fails
    return { isUrgent: false, isImportant: true, reasoning: "AI analysis failed." };
  }
};
