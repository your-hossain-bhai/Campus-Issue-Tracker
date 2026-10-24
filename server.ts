import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Support payload size for base64 image uploads
app.use(express.json({ limit: '15mb' }));

// Retrieve Google GenAI client prioritizing GEMINI_API_KEY1
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback Bangla response generator when API key is missing or model fails
function getFallbackAIResponse(text: string) {
  const lower = (text || '').toLowerCase();
  const isResolved =
    lower.includes('resolved') ||
    lower.includes('solved') ||
    lower.includes('completed') ||
    lower.includes('installed') ||
    lower.includes('সমাধান');

  const status = isResolved ? 'Resolved' : 'Pending';

  if (lower.includes('bus') || lower.includes('transport') || lower.includes('route')) {
    return {
      main_demand: 'ক্যাম্পাস ও শহরের মধ্যকার রুটে পিক আওয়ারে অতিরিক্ত বাস বরাদ্দ ও সুষ্ঠু পরিবহন ব্যবস্থাপনার দাবি।',
      status,
      next_steps: isResolved
        ? 'নতুন রুট ও শিডিউল অনুযায়ী বাসে যাতায়াত করুন।'
        : 'পরিবহন দপ্তরের নোটিশের অপেক্ষা করুন ও ছাত্র প্রতিনিধি দলের সাথে যোগাযোগ রাখুন।',
      modelUsed: 'AI Extraction Engine',
      isMockFallback: true,
    };
  }

  if (lower.includes('library') || lower.includes('study')) {
    return {
      main_demand: 'পরীক্ষার সময়ে কেন্দ্রীয় লাইব্রেরি পড়ার কক্ষ রাত পর্যন্ত খোলা রাখার জোর দাবি।',
      status,
      next_steps: isResolved
        ? 'বর্ধিত সময়সূচি লাইব্রেরি নোটিস বোর্ডে টানানো হয়েছে।'
        : 'প্রক্টোরিয়াল বডি ও লাইব্রেরিয়ানের স্মারকলিপির চূড়ান্ত অনুমোদনের জন্য অপেক্ষা করুন।',
      modelUsed: 'AI Extraction Engine',
      isMockFallback: true,
    };
  }

  if (lower.includes('cafeteria') || lower.includes('food') || lower.includes('water')) {
    return {
      main_demand: 'ক্যাফেটেরিয়ার খাবার পরিচ্ছন্নতা নিশ্চিতকরণ এবং নিরাপদ বিশুদ্ধ পানীয় জলের ফিল্টার বসানোর দাবি।',
      status,
      next_steps: isResolved
        ? 'কর্তৃপক্ষ নিয়মিত পরিদর্শন কমিটি গঠন করেছে; শিক্ষার্থীরা বিশুদ্ধ ফিল্টার পানি ব্যবহার করুন।'
        : 'খাবার মান কমিটি পরিদর্শন না করা পর্যন্ত স্বাস্থ্যবিধি মেনে চলার আহ্বান জানানো হচ্ছে।',
      modelUsed: 'AI Extraction Engine',
      isMockFallback: true,
    };
  }

  return {
    main_demand: `ক্যাম্পাস সমস্যার আশু সমাধান নিশ্চিতকরণ: ${text.slice(0, 60)}...`,
    status,
    next_steps: isResolved
      ? 'উদ্বেগ নিরসন করা হয়েছে, শিক্ষার্থীরা গৃহীত সেবা উপভোগ করতে পারেন।'
      : 'ছাত্রকল্যাণ উপদেষ্টা দপ্তরের পরবর্তী সিদ্ধান্ত না আসা পর্যন্ত অপেক্ষা করুন।',
    modelUsed: 'AI Extraction Engine',
    isMockFallback: true,
  };
}

// API endpoint for generating campus issue executive summary
app.post('/api/campus-summary', async (req, res) => {
  const { text, image, systemPrompt } = req.body;

  if (!text && !image) {
    return res.status(400).json({ error: 'Text or image context is required' });
  }

  const aiClient = getAIClient();

  // If no API key configured, return high fidelity fallback JSON immediately
  if (!aiClient) {
    console.log('[Campus Issue Tracker] No API key detected. Returning fallback Bangla summary.');
    const fallback = getFallbackAIResponse(text || '');
    return res.json(fallback);
  }

  try {
    const requiredSystemInstruction =
      systemPrompt ||
      "You are an AI assistant for a university issue tracking platform. Read the provided text and image context about a campus issue/protest. Extract the core information and return ONLY a valid JSON object with these exact keys in BANGLA: 'main_demand' (1 sentence), 'status' (Pending or Resolved based on context), and 'next_steps' (1 sentence on what students should do next). If info is missing, write 'তথ্য দেওয়া নেই'. Do not hallucinate.";

    const contents: any[] = [];

    // If an image was uploaded, include the base64 inline data
    if (image && typeof image === 'string') {
      const base64Match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (base64Match) {
        contents.push({
          inlineData: {
            mimeType: base64Match[1],
            data: base64Match[2],
          },
        });
      }
    }

    contents.push({
      text: `Issue Details to Analyze:\n${text}\n\nRemember to return ONLY valid JSON with keys: main_demand, status, next_steps in Bangla.`,
    });

    let rawResponseText = '';
    const modelNameUsed = 'gemini-3.8-flash';

    const response = await aiClient.models.generateContent({
      model: modelNameUsed,
      contents,
      config: {
        systemInstruction: requiredSystemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
    rawResponseText = response.text || '';

    // Clean JSON response (strip markdown fences if any)
    const cleaned = rawResponseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    return res.json({
      main_demand: parsed.main_demand || 'তথ্য দেওয়া নেই',
      status: parsed.status === 'Resolved' ? 'Resolved' : 'Pending',
      next_steps: parsed.next_steps || 'তথ্য দেওয়া নেই',
      modelUsed: modelNameUsed,
      isMockFallback: false,
    });
  } catch (error) {
    console.error('[Campus Issue Tracker] Error generating summary via AI:', error);
    // Graceful fallback so the app never crashes
    const fallback = getFallbackAIResponse(text || '');
    return res.json(fallback);
  }
});

// Setup server with Vite middleware in development or static files in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Campus Issue Tracker server listening on port ${PORT}`);
  });
}

startServer();
