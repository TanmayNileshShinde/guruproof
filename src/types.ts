export type TutorLanguage = "en" | "hinglish" | "hi";

export interface VisualTraceStep {
  step: number;
  label: string;
  state: string;
  isError?: boolean;
}

export interface GroundedDocCitation {
  title: string;
  url: string;
  snippet: string;
  source: "Olostep Live Search" | "Curated CS Reference";
}

export interface DiagnosticTopic {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate";
  buggyCode: string;
  bugLine: number;
  expectedConcept: string;
  preQuiz: {
    question: Record<TutorLanguage, string>;
    options: Record<TutorLanguage, string[]>;
    correctIndex: number;
  };
  visualTraceBuggy: VisualTraceStep[];
  visualTraceFixed: VisualTraceStep[];
  transferTest: {
    question: Record<TutorLanguage, string>;
    options: Record<TutorLanguage, string[]>;
    correctIndex: number;
    explanation: Record<TutorLanguage, string>;
  };
}

export interface DiagnosticResponse {
  sessionId: string;
  topicId: string;
  language: TutorLanguage;
  preScorePct: number;
  preCorrect: boolean;
  misconceptionDetected: string;
  brokenLine: number;
  diagnosisSummary: string;
  socraticHint: string;
  hintLevel: number;
  spoilerGuardrailPassed: boolean;
  visualTrace: VisualTraceStep[];
  citations: GroundedDocCitation[];
  llmProviderUsed: string;
}

export interface FixVerificationResult {
  passed: boolean;
  testsRun: number;
  testsPassed: number;
  testCases: Array<{
    name: string;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>;
  feedback: string;
  readyForTransferTest: boolean;
}

export interface MasteryProofReport {
  topicId: string;
  topicTitle: string;
  language: TutorLanguage;
  preScorePct: number;
  postScorePct: number;
  masteryDeltaPct: number;
  hintsUsed: number;
  transferCorrect: boolean;
  transferExplanation: string;
  verdict: "VERIFIED MASTERY" | "NEEDS PRACTICE";
  pedagogicalEval: {
    spoilerLeakPct: number;
    groundedCitationsCount: number;
    languageFidelity: string;
  };
  generatedAt: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  track: string;
  integrations: {
    olostep: boolean;
    gemini: boolean;
    groq: boolean;
  };
  timestamp: string;
}

export interface PedagogicalEvalReport {
  evaluatedAt: string;
  suitePassed: boolean;
  metrics: {
    spoilerLeakagePct: number;
    diagnosticCatchRatePct: number;
    multilingualCoveragePct: number;
    totalEvalChecks: number;
  };
  cases: Array<{
    topicId: string;
    title: string;
    antiSpoilerPass: boolean;
    multilingualReady: boolean;
    buggyCodeCaught: boolean;
    transferQuestionPresent: boolean;
  }>;
}
