
import { GoogleGenAI } from "@google/genai";

export const generateNotes = async (subject: string, topic: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Generate comprehensive yet simple and well-structured study notes for the following:
    Subject: ${subject}
    Topic: ${topic}
    
    Structure the notes using:
    - A clear title
    - An introductory overview
    - Key concepts (use bullet points)
    - Detailed explanation of sub-topics
    - Important formulas or dates (if applicable)
    - A brief summary or conclusion
    
    Use professional but easy-to-understand language. Return the response in Markdown format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Error generating notes:", error);
    throw new Error("Failed to generate notes. Please try again later.");
  }
};
