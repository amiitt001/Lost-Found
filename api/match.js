import { GoogleGenAI, Type } from '@google/genai';
import admin from 'firebase-admin';

// Initialize Firebase Admin if possible (server environment should provide credentials)
try {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
} catch (e) {
  console.warn('Firebase Admin init skipped or failed (may not be configured):', e.message || e);
}

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
                required: ['itemId', 'confidence', 'reasoning']
              }
            }
          },
          required: ['matches']
        }
      }
    });

    const text = response.text;
    if (!text) return res.status(502).json({ matches: [] });
    const parsed = cleanAndParseJSON(text);

    // If Firestore admin is available, persist each returned match's confidence to the matched item document.
    // This ensures FOUND candidate items receive a `matchConfidence` field so visibility rules can act on them.
    try {
      if (admin.apps.length && parsed.matches && Array.isArray(parsed.matches)) {
        const db = admin.firestore();
        for (const m of parsed.matches) {
          const candidateId = m.itemId || m.id;
          const c = typeof m.confidence === 'number' ? m.confidence : parseFloat(m.confidence || 0);
          if (!candidateId) continue;
          try {
            await db.collection('items').doc(String(candidateId)).set({ matchConfidence: c }, { merge: true });
          } catch (innerErr) {
            console.warn(`Failed to write matchConfidence for item ${candidateId}:`, innerErr.message || innerErr);
          }
        }
      }
    } catch (writeErr) {
      console.warn('Failed to write matchConfidence to Firestore:', writeErr.message || writeErr);
    }
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('api/match error:', err);
    const errMsg = (err && (err.message || JSON.stringify(err))) || '';
    if (err?.error?.code === 403 || /leak|leaked|PERMISSION_DENIED/i.test(errMsg)) {
      return res.status(403).json({ error: 'Gemini API key denied or reported leaked. Rotate the key and set `GEMINI_API_KEY` in your deployment environment.', matches: [] });
    }
    return res.status(500).json({ error: String(err), matches: [] });
  }
}
