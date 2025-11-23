import { Item, AIAnalysisResult, MatchResponse } from "../types";

const API_BASE = (import.meta as any).env.VITE_API_BASE || '/api';

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
  // Forward request to server-side API (keeps API key server-only)
  const resp = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data, mimeType })
  });
  if (!resp.ok) {
    // Try to parse structured JSON error from the server
    let text = '';
    try {
      const j = await resp.json();
      text = j.error || JSON.stringify(j);
    } catch (e) {
      text = await resp.text().catch(() => '');
    }

    if (resp.status === 404) {
      console.error(`AI analyze endpoint not found at ${API_BASE}/analyze. Make sure the server API is running or set VITE_API_BASE to the correct URL.`);
      throw new Error(`AI analyze endpoint not found (404).`);
    }

    if (resp.status === 403) {
      // Server has indicated the provider denied the key (often reported as leaked)
      const msg = text || 'Gemini API key denied or reported leaked. Rotate the key and set `GEMINI_API_KEY` in your deployment environment.';
      const userMsg = `Gemini API key denied: ${msg}`;
      // Provide an informative error that UI can detect
      const err: any = new Error(userMsg);
      err.code = 'GEMINI_KEY_DENIED';
      throw err;
    }

    throw new Error(`AI analyze failed: ${resp.status} ${text}`);
  }
  return await resp.json() as AIAnalysisResult;
};

/**
 * Finds potential matches for a specific item against a list of candidates.
 */
export const findSmartMatches = async (targetItem: Item, candidates: Item[]): Promise<MatchResponse> => {
  // Prepare and forward to server API
  const potentialMatches = candidates.filter(
    c => c.type !== targetItem.type && c.status !== 'RESOLVED' && c.id !== targetItem.id
  );
  if (potentialMatches.length === 0) return { matches: [] };

  const resp = await fetch(`${API_BASE}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetItem, candidates: potentialMatches })
  });
  if (!resp.ok) {
    // Try parse structured json response
    let text = '';
    try {
      const j = await resp.json();
      text = j.error || JSON.stringify(j);
    } catch (e) {
      text = await resp.text().catch(() => '');
    }

    if (resp.status === 404) {
      console.error(`Match API not found at ${API_BASE}/match (404). Ensure the server is deployed and VITE_API_BASE is configured if the API is hosted on a different domain.`);
      throw new Error('Match API not found (404).');
    }

    if (resp.status === 403) {
      const msg = text || 'Gemini API key denied or reported leaked. Rotate the key and set `GEMINI_API_KEY` in your deployment environment.';
      const err: any = new Error(`Gemini API key denied: ${msg}`);
      err.code = 'GEMINI_KEY_DENIED';
      throw err;
    }

    console.error('Match API failed', resp.status, text);
    return { matches: [] };
  }
  return await resp.json() as MatchResponse;
};