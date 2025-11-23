const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenAI, Type } = require('@google/genai');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY not set. API endpoints will return errors.');
}

const getAIClient = () => {
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing on the server');
  return new GoogleGenAI({ apiKey });
};

const cleanAndParseJSON = (text) => {
  let cleanText = text.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
  }
  return JSON.parse(cleanText);
};

app.post('/api/analyze', async (req, res) => {
  try {
    const { base64Data, mimeType } = req.body;
    if (!base64Data || !mimeType) return res.status(400).json({ error: 'Missing base64Data or mimeType' });

    const ai = getAIClient();
    const prompt = `
      Analyze this image of a lost or found item. 
      Identify the object, its color, and any distinctive features.
      Return the result as a JSON object with title, description, category, color and tags.
    `;

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
          type: Type.OBJECT
        }
      }
    });

    const text = response.text;
    if (!text) return res.status(502).json({ error: 'No response from AI' });
    const parsed = cleanAndParseJSON(text);
    res.json(parsed);
  } catch (err) {
    console.error('Server /api/analyze error:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/match', async (req, res) => {
  try {
    const { targetItem, candidates } = req.body;
    if (!targetItem || !Array.isArray(candidates)) return res.status(400).json({ error: 'Missing data' });

    const ai = getAIClient();

    const prompt = `You are an expert matcher. Target: ${JSON.stringify(targetItem)} Candidates: ${JSON.stringify(candidates)} Return JSON with matches array containing itemId, confidence and reasoning.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT
        }
      }
    });

    const text = response.text;
    if (!text) return res.json({ matches: [] });
    const parsed = cleanAndParseJSON(text);
    res.json(parsed);
  } catch (err) {
    console.error('Server /api/match error:', err);
    res.status(500).json({ error: String(err), matches: [] });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
