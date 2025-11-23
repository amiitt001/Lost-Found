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

  const { base64Data, mimeType } = req.body || {};
  if (!base64Data || !mimeType) return res.status(400).json({ error: 'Missing base64Data or mimeType' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Analyze this image of a lost or found item. Identify the object, its color, and any distinctive features. Return JSON with title, description, category, color and tags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            color: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['title', 'description', 'category', 'color', 'tags']
        }
      }
    });

    const text = response.text;
    if (!text) return res.status(502).json({ error: 'No response from AI' });
    const parsed = cleanAndParseJSON(text);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('api/analyze error:', err);
    return res.status(500).json({ error: String(err) });
  }
}
