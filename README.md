# Campus Issue Tracker

> Democratic student grievance platform with open-source Gemma 2 AI intelligence briefing for university campuses.

## The problem
Students across university campuses (such as IIUC Kumira) face recurring bottlenecks—stranded at bus stops during peak city routes, inadequate study hall hours during exams, cafeteria food hygiene violations, and bureaucratic queues for fee verification. Notices remain scattered across Facebook groups, and student representatives struggle to synthesize dozens of messy posts into actionable demands for university authorities.

## The solution
**Campus Issue Tracker** provides a clean, Reddit-style hub where students report campus problems either anonymously or with their verified Student ID, upvote pressing concerns, and attach photographic evidence. Powered by Google's open-weights **Gemma 2** model, our AI engine automatically ingests issue reports and photos to extract a standardized 1-sentence Bangla executive summary with the main demand (`main_demand`), current status (`status`), and immediate student action (`next_steps`). This bridges student voices and university administration in seconds.

## How it works
- **Model(s) used**: Gemma 2 (`gemma-2-9b-it`) via `@google/genai` with fallback support for offline/demo reliability. Link: [https://huggingface.co/google/gemma-2-9b-it](https://huggingface.co/google/gemma-2-9b-it)
- **Tech stack**: 
  - Frontend: React 19, Tailwind CSS v4, Lucide React icons, Vite 8
  - Backend: Node.js, Express, tsx
  - SDK: `@google/genai` (Google AI Studio)
- **System Instruction**: 
  `"You are an AI assistant for a university issue tracking platform. Read the provided text and image context about a campus issue/protest. Extract the core information and return ONLY a valid JSON object with these exact keys in BANGLA: 'main_demand' (1 sentence), 'status' (Pending or Resolved based on context), and 'next_steps' (1 sentence on what students should do next). If info is missing, write 'তথ্য দেওয়া নেই'. Do not hallucinate."`

## How to run it
1. Clone the repository:
   ```bash
   git clone <YOUR_REPO_URL>
   cd campus-issue-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variable (Optional for live Gemma API calls):
   ```bash
   cp .env.example .env
   # Set your GEMINI_API_KEY in .env if available; otherwise graceful mock fallback works out of the box!
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features
- **Reddit-style Feed & Voting**: Upvote counter with instant toggle, responsive cards, category badges, and author privacy controls (Anonymous / Student ID).
- **Real-Time Search & Filters**: Live title/keyword search, category chips (Transport, Library, Cafeteria, Facilities, Administration), and Pending/Resolved status tabs.
- **AI Magic Card**: One-click "Generate AI Summary" button producing structured Bangla intelligence briefs.
- **One-Click Share & Copy**: Directly copy formatted Bangla briefings for student WhatsApp groups and administrative delegations.
- **Fail-Safe Resilience**: Safe JSON parser and built-in Bangla generator ensuring the demo never crashes even if network or API keys are unavailable.
