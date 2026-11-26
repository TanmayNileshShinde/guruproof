import {
  DiagnosticResponse,
  DiagnosticTopic,
  FixVerificationResult,
  HealthResponse,
  MasteryProofReport,
  PedagogicalEvalReport,
  TutorLanguage,
} from "./types";

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error || `Request failed (${res.status})`);
  }
  return payload as T;
}

export const tutorApi = {
  getHealth: () => requestJson<HealthResponse>("/api/health"),

  getTopics: async (): Promise<DiagnosticTopic[]> => {
    const res = await requestJson<{ success: boolean; topics: DiagnosticTopic[] }>("/api/topics");
    return res.topics;
  },

  diagnose: async (params: {
    topicId: string;
    language: TutorLanguage;
    preAnswerIndex?: number;
    hintLevel?: number;
    customCode?: string;
  }): Promise<DiagnosticResponse> => {
    const res = await requestJson<{ success: boolean; data: DiagnosticResponse }>("/api/diagnose", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return res.data;
  },

  verifyFix: async (params: {
    topicId: string;
    fixedCode: string;
    language: TutorLanguage;
  }): Promise<FixVerificationResult> => {
    const res = await requestJson<{ success: boolean; data: FixVerificationResult }>("/api/verify-fix", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return res.data;
  },

  submitTransferCheck: async (params: {
    topicId: string;
    preScorePct: number;
    hintsUsed: number;
    selectedIndex: number;
    language: TutorLanguage;
  }): Promise<MasteryProofReport> => {
    const res = await requestJson<{ success: boolean; data: MasteryProofReport }>("/api/transfer-check", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return res.data;
  },

  getEvals: async (): Promise<PedagogicalEvalReport> => {
    const res = await requestJson<{ success: boolean; data: PedagogicalEvalReport }>("/api/evals");
    return res.data;
  },
};
