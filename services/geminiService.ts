
import { GoogleGenAI } from "@google/genai";
import { NoteLevel } from "../types";

export const generateNotes = async (subject: string, topic: string, level: NoteLevel): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const levelDescriptions = {
    [NoteLevel.BEGINNER]: "Focus on fundamental concepts, use simple analogies, avoid overly technical jargon unless explained, and provide very clear, slow-paced step-by-step instructions.",
    [NoteLevel.INTERMEDIATE]: "Provide a comprehensive overview with technical details, practical examples, common use cases, and standard industry-standard step-by-step workflows.",
    [NoteLevel.ADVANCED]: "Deep dive into complex theories, architectural patterns, edge cases, performance implications, and sophisticated, optimized implementation steps."
  };

  const prompt = `
    Generate high-quality, structured study notes with a strong focus on practical, step-by-step knowledge.
    
    Target Audience Level: ${level} (${levelDescriptions[level]})
    Subject: ${subject}
    Topic: ${topic}
    
    Structure the response in Markdown format using the following sections:
    
    1. # Title (Engaging and clear)
    2. ## Overview (Set the context and explain why this topic matters)
    3. ## Key Concepts & Definitions (Bullet points for quick reference)
    4. ## Theoretical Core (Explain the 'Why' behind the topic)
    5. ## Practical Step-by-Step Implementation (This is the most important section. Provide a clear, numbered sequence of actions or a tutorial-style guide. Use "1. ", "2. " for steps.)
    6. ## Real-World Scenario (Describe a concrete situation where this knowledge is applied)
    7. ## Pro-Tips & Common Pitfalls (What to watch out for at the ${level} level)
    8. ## Summary & Next Steps (Key takeaways and what to learn next)
    
    Make it extremely detailed, authoritative, and practical. Ensure the "Step-by-Step" section is actionable.
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
