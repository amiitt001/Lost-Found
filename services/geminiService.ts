import { GoogleGenAI, Type } from "@google/genai";
import { Item, AIAnalysisResult, MatchResponse } from "../types";

const getAIClient = () => {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to parse JSON that might be wrapped in markdown code blocks
 */
const cleanAndParseJSON = <T>(text: string): T => {
  let cleanText = text.trim();
  // Remove markdown code blocks if present (e.g. ```json ... ```)
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
  }
  return JSON.parse(cleanText) as T;
};

/**
 * Analyzes an image to automatically populate item details.
 */
export const analyzeItemImage = async (base64Data: string, mimeType: string): Promise<AIAnalysisResult> => {
  const ai = getAIClient();

  const prompt = `
    Analyze this image of a lost or found item. 
    Identify the object, its color, and any distinctive features.
    **CRITICAL**: If there is any text, brand name, or model number visible (e.g. "Nike", "Apple", "SG", "Samsung"), you MUST include it in the title and description.
    
    Return the result as a JSON object matching this schema:
    {
      "title": "A short, descriptive title including Brand/Model if visible (e.g. 'Blue Nike Backpack', 'SG Cricket Bat')",
      "description": "A detailed description of the visual appearance. Mention specific logos, text, scratches, or unique identifiers.",
      "category": "One of: Electronics, Keys, Wallet/Purse, Clothing, Pets, Documents, Jewelry, Accessories, Other",
      "color": "Dominant color",
      "tags": ["array", "of", "keywords", "including", "brand", "names"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            color: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "category", "color", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return cleanAndParseJSON<AIAnalysisResult>(text);
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

/**
 * Finds potential matches for a specific item against a list of candidates.
 */
export const findSmartMatches = async (targetItem: Item, candidates: Item[]): Promise<MatchResponse> => {
  const ai = getAIClient();

  // Filter candidates to only include opposing types (Lost vs Found) and exclude resolved items
  const potentialMatches = candidates.filter(
    c => c.type !== targetItem.type && c.status !== 'RESOLVED' && c.id !== targetItem.id
  );

  if (potentialMatches.length === 0) {
    return { matches: [] };
  }

  // Prepare a simplified list for the prompt to save tokens
  const candidatesJson = potentialMatches.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    location: c.location,
    date: c.date
  }));

  const targetJson = {
    type: targetItem.type,
    title: targetItem.title,
    description: targetItem.description,
    category: targetItem.category,
    location: targetItem.location,
    date: targetItem.date
  };

  const prompt = `
    You are an expert Lost & Found matcher.
    I have a target item that is ${targetItem.type}.
    Target Item Details: ${JSON.stringify(targetJson)}

    Here is a list of potential matches (items that were ${targetItem.type === 'LOST' ? 'FOUND' : 'LOST'}):
    ${JSON.stringify(candidatesJson)}

    Analyze the descriptions, locations, dates, and categories.
    Identify which candidates are likely to be the same physical object as the target item.
    
    Matching Rules:
    1. **Category Match**: High importance.
    2. **Keyword Match**: Look for matching brand names (e.g. "SG", "Nike") or specific object types (e.g. "Cricket Bat").
    3. **Fuzzy Description**: Be lenient with minor color or description discrepancies (e.g. "Blue decals" vs "Red decals") if the core object and brand match strongly.
    4. **Location**: Plausible proximity is good, but items move.
    5. **Date**: Lost date must be before or same as Found date.

    Return a JSON object with a "matches" array. Each match should have:
    - "itemId": The ID of the matching candidate.
    - "confidence": A number 0-100 indicating confidence level.
    - "reasoning": A short explanation of why it matches.

    Return matches with confidence > 30.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemId: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING }
                },
                required: ["itemId", "confidence", "reasoning"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return { matches: [] };
    return cleanAndParseJSON<MatchResponse>(text);
  } catch (error) {
    console.error("Error finding matches:", error);
    return { matches: [] };
  }
};