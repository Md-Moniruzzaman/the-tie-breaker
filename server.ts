import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Lazy-initialized GenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    decisionTitle: {
      type: Type.STRING,
      description: 'Crisp, punchy formulation of the decision',
    },
    coreConflict: {
      type: Type.STRING,
      description: 'The fundamental trade-off (e.g., Short-term stability vs Long-term equity)',
    },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Slug like opt-1, opt-2' },
          name: { type: Type.STRING, description: 'Option title' },
          tagline: { type: Type.STRING, description: 'One-line summary essence' },
          pros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                impact: { type: Type.STRING, description: "'high', 'medium', or 'low'" },
                weight: { type: Type.INTEGER, description: 'Positive strength score from 1 to 5' },
                category: { type: Type.STRING, description: 'Domain e.g. Financial, Growth, Well-being, Freedom, Risk' },
              },
              required: ['id', 'text', 'impact', 'weight', 'category'],
            },
          },
          cons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                impact: { type: Type.STRING, description: "'high', 'medium', or 'low'" },
                weight: { type: Type.INTEGER, description: 'Negative risk score from 1 to 5' },
                category: { type: Type.STRING, description: 'Domain e.g. Financial, Growth, Well-being, Freedom, Risk' },
              },
              required: ['id', 'text', 'impact', 'weight', 'category'],
            },
          },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
          },
        },
        required: ['id', 'name', 'tagline', 'pros', 'cons', 'swot'],
      },
    },
    comparisonCriteria: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: 'Evaluation axis e.g. Financial Upside, Stress & Well-being, Growth Potential, Reversibility & Risk, Time & Effort' },
          description: { type: Type.STRING, description: 'Brief rationale on why this criteria matters for this decision' },
          scores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                optionId: { type: Type.STRING },
                score: { type: Type.INTEGER, description: 'Score out of 10' },
                verdict: { type: Type.STRING, description: 'Crisp justification' },
              },
              required: ['optionId', 'score', 'verdict'],
            },
          },
          winnerOptionId: { type: Type.STRING, description: 'Option id that outperforms on this axis' },
        },
        required: ['category', 'description', 'scores', 'winnerOptionId'],
      },
    },
    tiebreakerRecommendation: {
      type: Type.OBJECT,
      properties: {
        recommendedOptionId: { type: Type.STRING, description: 'The chosen option id or "draw"' },
        headlineVerdict: { type: Type.STRING, description: 'The definitive Tiebreaker ruling' },
        reasoning: { type: Type.STRING, description: 'Deep, clear 2-3 sentence strategic rationale' },
        conditionalAdvice: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              condition: { type: Type.STRING, description: "e.g., If your #1 priority right now is peace of mind..." },
              choice: { type: Type.STRING, description: 'Which option to pick and why' },
            },
            required: ['condition', 'choice'],
          },
        },
        blindspotWarning: { type: Type.STRING, description: 'The single biggest hidden risk or cognitive bias to beware of' },
        recommendedNextStep: { type: Type.STRING, description: 'Immediate, low-friction micro-action to break inertia' },
      },
      required: ['recommendedOptionId', 'headlineVerdict', 'reasoning', 'conditionalAdvice', 'blindspotWarning', 'recommendedNextStep'],
    },
  },
  required: ['decisionTitle', 'coreConflict', 'options', 'comparisonCriteria', 'tiebreakerRecommendation'],
};

app.post('/api/analyze', async (req, res) => {
  try {
    const { decision, options, context } = req.body;

    if (!decision || typeof decision !== 'string' || !decision.trim()) {
      res.status(400).json({ error: 'Please describe the decision you need to make.' });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.status(500).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the Secrets panel.',
      });
      return;
    }

    const optionsPrompt = Array.isArray(options) && options.filter((o: string) => o && o.trim()).length > 0
      ? `The user is specifically weighing between these options:\n${options.map((o: string, idx: number) => `Option ${idx + 1}: ${o}`).join('\n')}`
      : `Derive the 2 or 3 most realistic, actionable options representing this choice (e.g. Option A vs Option B or Yes vs No).`;

    const contextPrompt = context && typeof context === 'string' && context.trim()
      ? `Important user priorities, constraints, and context:\n"${context.trim()}"`
      : `No extra personal constraints provided. Evaluate with balanced real-world rigor.`;

    const prompt = `
You are "The Tiebreaker", an expert strategic decision scientist and pragmatic advisor.
Your mission is to help the user resolve a difficult dilemma with absolute clarity.

Decision to evaluate:
"${decision.trim()}"

${optionsPrompt}

${contextPrompt}

Provide a comprehensive, objective decision analysis including:
1. "options": 2 to 3 distinct options. For EACH option, provide:
   - 4-6 specific, nuanced Pros with real-world impact ('high'|'medium'|'low'), category, and weight (1-5).
   - 4-6 honest, critical Cons with real-world impact, category, and weight (1-5).
   - A complete SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) with 3-4 bullet points each.
2. "comparisonCriteria": 5 critical decision axes (e.g., Financial Impact/ROI, Mental Peace & Well-being, Career/Personal Trajectory, Reversibility & Downside Risk, Execution Effort & Time).
   Score each option (1-10) on each criterion with a short verdict, and name the criterion winner.
3. "tiebreakerRecommendation": Deliver a decisive, thoughtful Tiebreaker Verdict.
   - Pick the recommended option (or state why if tied).
   - Headline verdict (memorable and sharp).
   - Multi-sentence reasoning showing empathy and strategic acumen.
   - 2-3 conditional rules: "If you prioritize X over Y, choose Option A; but if Z is critical, choose Option B".
   - A vital "Blindspot Warning" identifying an overlooked assumption or cognitive bias.
   - A practical, low-friction "Next Step" to test the waters today.

Ensure every point is realistic, granular, and directly tailored to the user's specific scenario. Avoid generic platitudes.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error('No content returned from AI model.');
    }

    const parsedData = JSON.parse(jsonText);
    const analysisId = 'dec-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);

    res.json({
      id: analysisId,
      createdAt: new Date().toISOString(),
      ...parsedData,
    });
  } catch (error: any) {
    console.error('Error analyzing decision:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze decision. Please try again.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tiebreaker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
