import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT =
  "You are an AI assistant for a university issue tracking platform. Read the provided text and image context about a campus issue/protest. Extract the core information and return ONLY a valid JSON object with these exact keys in BANGLA: 'main_demand' (1 sentence), 'status' (Pending or Resolved based on context), and 'next_steps' (1 sentence on what students should do next). If info is missing, write 'তথ্য দেওয়া নেই'. Do not hallucinate.";
const MODEL_NAME = 'gemini-3.8-flash';

interface CampusSummaryRequest {
  text: string;
  image?: string;
  systemPrompt?: string;
}

interface SummaryResult {
  status: number;
  body: Record<string, unknown>;
}

function fallbackResponse(text: string) {
  const lower = text.toLowerCase();
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
    main_demand: text
      ? `ক্যাম্পাস সমস্যার আশু সমাধান নিশ্চিতকরণ: ${text.slice(0, 60)}...`
      : 'ক্যাম্পাস সমস্যার আশু সমাধান নিশ্চিতকরণের দাবি।',
    status,
    next_steps: isResolved
      ? 'উদ্বেগ নিরসন করা হয়েছে, শিক্ষার্থীরা গৃহীত সেবা উপভোগ করতে পারেন।'
      : 'ছাত্রকল্যাণ উপদেষ্টা দপ্তরের পরবর্তী সিদ্ধান্ত না আসা পর্যন্ত অপেক্ষা করুন।',
    modelUsed: 'AI Extraction Engine',
    isMockFallback: true,
  };
}

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

function parseRequest(value: unknown): CampusSummaryRequest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const text = typeof input.text === 'string' ? input.text : '';
  const image = typeof input.image === 'string' ? input.image : undefined;
  const systemPrompt = typeof input.systemPrompt === 'string' ? input.systemPrompt : undefined;
  if (!text.trim() && !image) return null;
  if (image && !/^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(image)) return null;
  return { text, image, systemPrompt };
}

export async function generateCampusSummary(body: unknown): Promise<SummaryResult> {
  const request = parseRequest(body);
  if (!request) {
    return { status: 400, body: { error: 'Text or a valid base64 image is required.' } };
  }

  const aiClient = getAIClient();
  if (!aiClient) {
    console.info('[CampusPulse] No Gemini API key; returning a demo summary.');
    return { status: 200, body: fallbackResponse(request.text) };
  }

  try {
    const contents: Array<
      | { inlineData: { mimeType: string; data: string } }
      | { text: string }
    > = [];
    if (request.image) {
      const match = request.image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match) {
        contents.push({ inlineData: { mimeType: match[1], data: match[2] } });
      }
    }
    contents.push({
      text: `Issue Details to Analyze:\n${request.text}\n\nRemember to return ONLY valid JSON with keys: main_demand, status, next_steps in Bangla.`,
    });

    const response = await aiClient.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction: request.systemPrompt || SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
    const cleaned = (response.text || '')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const parsed: unknown = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('The AI response did not contain a JSON object.');
    }
    const result = parsed as Record<string, unknown>;
    return {
      status: 200,
      body: {
        main_demand: typeof result.main_demand === 'string' ? result.main_demand : 'তথ্য দেওয়া নেই',
        status: result.status === 'Resolved' ? 'Resolved' : 'Pending',
        next_steps: typeof result.next_steps === 'string' ? result.next_steps : 'তথ্য দেওয়া নেই',
        modelUsed: MODEL_NAME,
        isMockFallback: false,
      },
    };
  } catch (error) {
    console.error('[CampusPulse] Summary generation failed; using demo fallback:', error);
    return { status: 200, body: fallbackResponse(request.text) };
  }
}
