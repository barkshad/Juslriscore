import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, DocumentFile } from "../types";

// Initialize the Gemini API client lazily
// The API key is injected via process.env.GEMINI_API_KEY
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please configure it in your environment.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const SYSTEM_INSTRUCTION = `
You are JurisCore, an advanced legal AI assistant designed for legal professionals.
Your task is to analyze legal documents (cases, contracts, statutes) with high precision.
Maintain a professional, objective, and analytical tone.
Do not provide legal advice; instead, provide legal information and analysis.

When analyzing a document, you must return a JSON object with the following structure:
{
  "summary": "A concise executive overview of the document.",
  "deadlines": ["List of specific procedural dates, deadlines, or time-sensitive obligations found in the text."],
  "citations": ["List of cases, statutes, or regulations cited in the document."],
  "logic_check": "A critical analysis of potential risks, counter-arguments, or logical inconsistencies."
}
`;

export const analyzeDocument = async (file: DocumentFile): Promise<AnalysisResult> => {
  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: file.data,
            },
          },
          {
            text: "Analyze this legal document and provide the structured output as requested.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            deadlines: { type: Type.ARRAY, items: { type: Type.STRING } },
            citations: { type: Type.ARRAY, items: { type: Type.STRING } },
            logic_check: { type: Type.STRING },
          },
          required: ["summary", "deadlines", "citations", "logic_check"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export const verifyCitations = async (citations: string[]): Promise<string> => {
  if (citations.length === 0) return "No citations to verify.";
  
  try {
    const client = getAiClient();
    const prompt = `Verify the following legal citations. Check if they are valid, overturned, or questioned. Provide a brief status for each:\n\n${citations.join("\n")}`;
    
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text || "Could not verify citations.";
  } catch (error) {
    console.error("Error verifying citations:", error);
    throw error;
  }
};
