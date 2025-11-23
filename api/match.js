import { GoogleGenAI, Type } from '@google/genai';

const cleanAndParseJSON = (text) => {
  let cleanText = text?.trim() || '';
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
  }
  return JSON.parse(cleanText);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { targetItem, candidates } = req.body || {};
  if (!targetItem || !Array.isArray(candidates)) return res.status(400).json({ error: 'Missing targetItem or candidates' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert Lost & Found matcher. Target: ${JSON.stringify(targetItem)} Candidates: ${JSON.stringify(candidates)} Return JSON with matches array containing itemId, confidence, reasoning.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: { type: Type.OBJECT }
      }
    });

    const text = response.text;
    if (!text) return res.status(502).json({ matches: [] });
    const parsed = cleanAndParseJSON(text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('api/match error:', err);
    return res.status(500).json({ error: String(err), matches: [] });
  }
}
