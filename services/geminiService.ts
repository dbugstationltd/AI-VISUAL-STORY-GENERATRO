
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a story using the Gemini API.
 * @param prompt - The prompt to send to the model.
 * @returns A promise that resolves to the generated story text.
 */
export const generateStory = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    
    const text = response.text.trim();
    if (!text) {
        throw new Error("Received an empty response from the AI.");
    }
    return text;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate story from Gemini API.');
  }
};

/**
 * Generates an image using the Gemini API.
 * @param prompt - The prompt to send to the model.
 * @returns A promise that resolves to the base64 encoded image data URL.
 */
export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;

    if (!base64ImageBytes) {
      throw new Error("Received no image data from the AI.");
    }
    
    return `data:image/jpeg;base64,${base64ImageBytes}`;

  } catch (error) {
    console.error('Error calling Gemini Image API:', error);
    throw new Error('Failed to generate image from Gemini API.');
  }
};
