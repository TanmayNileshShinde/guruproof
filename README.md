# GuruProof — A Tutor for Every Learner

> **Homingo Hackathon (Edition 01) · Track 3 · Statement C3**

**GuruProof** is an interactive, multilingual (**English**, **Hinglish**, **हिन्दी**) Socratic Coding & DSA Mastery Tutor built to prove real student understanding rather than handing out direct code answers.

## Key Capabilities

1. **Diagnostic Pre-Test & Custom Bug Analyzer**: Identifies exact conceptual misconceptions before teaching starts across interactive Java/DSA labs (`circular-linked-list`, `binary-search`, `postfix-stack`, `recursion-base`) or pasted student code.
2. **Visual Memory Trace Stepper**: Side-by-side step-by-step trace contrasting buggy vs. corrected execution states.
3. **3-Tier Socratic Hints with Anti-Spoiler Guardrail**: Progressive hints (`1 → 2 → 3`) that never leak the literal answer code, verified by an automated spoiler guardrail check.
4. **Live Grounded Documentation Citations**: Uses the **Olostep Search API** (`/v1/searches`) with curated DSA fallback citations (and optional Gemini / Groq enhancement).
5. **Live Fix Verification**: Executes structured test cases against student-edited code (`POST /api/verify-fix`).
6. **Blind Transfer Post-Test & Mastery Proof Scorecard**: Measures Pre-Test % vs. Blind Transfer Post-Test % (`+Delta%`) to generate a **Verified Mastery** report.
7. **Pedagogical Evals Suite**: Built-in evaluation metrics tracking spoiler leakage rate, diagnostic catch rate, and multilingual coverage (`GET /api/evals`).

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Express + TypeScript (local dev on port `5001`, Vercel Serverless adapter at `api/index.ts`)
- **Grounding & Inference**: Olostep API (`OLOSTEP_API_KEY`), optional `GEMINI_API_KEY` / `GROQ_API_KEY`

## Local Setup

```bash
npm install
cp .env.example .env
# Add OLOSTEP_API_KEY to .env
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`
- Automated Test & Eval Suite: `npm test`
- Production Build Check: `npm run build`

## Contributors

- **Tanmay Nilesh Shinde** (`@TanmayNileshShinde`) — Backend Diagnostic Engine, Olostep Grounding, Vercel API Adapter, Automated Test & Pedagogical Eval Suite
- **Antara Parab** (`@Antara-Parab`) — Multilingual Interactive Tutor Frontend, Visual Trace Stepper, Live Code Fix Runner & Mastery Proof Scorecard
