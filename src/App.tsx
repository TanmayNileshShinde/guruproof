import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  FlaskConical,
  Lightbulb,
  Play,
  RotateCcw,
  Shield,
  Terminal,
  X,
} from "lucide-react";
import { tutorApi } from "./api";
import { EvalSuiteView } from "./components/EvalSuiteView";
import { TraceStepper } from "./components/TraceStepper";
import {
  DiagnosticResponse,
  DiagnosticTopic,
  FixVerificationResult,
  HealthResponse,
  MasteryProofReport,
  PedagogicalEvalReport,
  TutorLanguage,
} from "./types";

const LANGUAGES: Array<{ id: TutorLanguage; label: string }> = [
  { id: "en", label: "English" },
  { id: "hinglish", label: "Hinglish" },
  { id: "hi", label: "हिन्दी" },
];

const UI_COPY: Record<
  TutorLanguage,
  {
    step1Title: string;
    step1Sub: string;
    diagnoseBtn: string;
    step2Title: string;
    nextHintBtn: string;
    step3Title: string;
    verifyFixBtn: string;
    resetCodeBtn: string;
    step4Title: string;
    step4Sub: string;
    proveMasteryBtn: string;
    nextLabBtn: string;
  }
> = {
  en: {
    step1Title: "1. Diagnostic pre-test",
    step1Sub: "Establish baseline intuition before hints appear",
    diagnoseBtn: "Diagnose concept and trace",
    step2Title: "2. Socratic diagnosis and docs",
    nextHintBtn: "Show next hint tier",
    step3Title: "3. Repair invariant and verify",
    verifyFixBtn: "Verify fix",
    resetCodeBtn: "Reset",
    step4Title: "4. Blind transfer post-test",
    step4Sub: "Apply the fixed invariant to an unseen scenario",
    proveMasteryBtn: "Verify mastery",
    nextLabBtn: "Next lab",
  },
  hinglish: {
    step1Title: "1. Diagnostic pre-test",
    step1Sub: "Hints dekhne se pehle apna baseline concept check karein",
    diagnoseBtn: "Concept diagnose karein",
    step2Title: "2. Socratic diagnosis aur docs",
    nextHintBtn: "Agla hint tier dekhein",
    step3Title: "3. Code repair aur test check",
    verifyFixBtn: "Fix verify karein",
    resetCodeBtn: "Reset",
    step4Title: "4. Blind transfer post-test",
    step4Sub: "Naye edge-case par bina help ke concept prove karein",
    proveMasteryBtn: "Mastery verify karein",
    nextLabBtn: "Next lab",
  },
  hi: {
    step1Title: "1. निदानात्मक पूर्व-परीक्षण",
    step1Sub: "संकेत देखने से पहले अपनी वर्तमान समझ जांचें",
    diagnoseBtn: "कोड और अवधारणा जांचें",
    step2Title: "2. सुकराती निदान और संदर्भ",
    nextHintBtn: "अगला संकेत स्तर देखें",
    step3Title: "3. कोड सुधारें और सत्यापित करें",
    verifyFixBtn: "सुधार सत्यापित करें",
    resetCodeBtn: "रीसेट",
    step4Title: "4. ब्लाइंड ट्रांसफर पोस्ट-टेस्ट",
    step4Sub: "एक नए परिदृश्य पर अपनी समझ प्रमाणित करें",
    proveMasteryBtn: "मास्टरी सत्यापित करें",
    nextLabBtn: "अगली लैब",
  },
};

export function App() {
  const [activeTab, setActiveTab] = useState<"tutor" | "evals">("tutor");
  const [language, setLanguage] = useState<TutorLanguage>("en");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [topics, setTopics] = useState<DiagnosticTopic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [evalReport, setEvalReport] = useState<PedagogicalEvalReport | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const [preAnswerIndex, setPreAnswerIndex] = useState<number | undefined>(undefined);
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [customMode, setCustomMode] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [editorCode, setEditorCode] = useState("");

  const [diagnosis, setDiagnosis] = useState<DiagnosticResponse | null>(null);
  const [fixResult, setFixResult] = useState<FixVerificationResult | null>(null);
  const [transferIndex, setTransferIndex] = useState<number | undefined>(undefined);
  const [masteryReport, setMasteryReport] = useState<MasteryProofReport | null>(null);

  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const copy = UI_COPY[language];

  const activeTopic = useMemo(
    () => topics.find((t) => t.id === selectedTopicId) || topics[0] || null,
    [topics, selectedTopicId]
  );

  const codeLines = useMemo(() => editorCode.split(/\r?\n/), [editorCode]);
  const highlightedLine = diagnosis?.brokenLine ?? activeTopic?.bugLine ?? 1;

  useEffect(() => {
    let mounted = true;
    Promise.all([tutorApi.getHealth(), tutorApi.getTopics(), tutorApi.getEvals()])
      .then(([h, topicList, evals]) => {
        if (!mounted) return;
        setHealth(h);
        setTopics(topicList);
        if (topicList.length > 0) {
          setSelectedTopicId(topicList[0].id);
          setEditorCode(topicList[0].buggyCode);
        }
        setEvalReport(evals);
      })
      .catch((err) => {
        if (mounted) setErrorBanner(err.message || "Failed to connect to GuruProof API");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const selectTopic = (topic: DiagnosticTopic) => {
    setSelectedTopicId(topic.id);
    setEditorCode(topic.buggyCode);
    setPreAnswerIndex(undefined);
    setHintLevel(1);
    setDiagnosis(null);
    setFixResult(null);
    setTransferIndex(undefined);
    setMasteryReport(null);
    setErrorBanner(null);
  };

  const handleLanguageChange = async (nextLang: TutorLanguage) => {
    setLanguage(nextLang);
    if (diagnosis && activeTopic) {
      const useCustom = customMode && Boolean(customCode.trim());
      setLoadingDiagnosis(true);
      try {
        const refreshed = await tutorApi.diagnose({
          topicId: useCustom ? "custom" : activeTopic.id,
          language: nextLang,
          preAnswerIndex,
          hintLevel,
          customCode: useCustom ? customCode : undefined,
        });
        setDiagnosis(refreshed);
      } catch (err: any) {
        setErrorBanner(err.message);
      } finally {
        setLoadingDiagnosis(false);
      }
    }
  };

  const handleDiagnose = async (overrideHintLevel?: number) => {
    if (!activeTopic) return;
    const useCustom = customMode && Boolean(customCode.trim());
    const nextHint = overrideHintLevel ?? hintLevel;
    setHintLevel(nextHint);
    setLoadingDiagnosis(true);
    setErrorBanner(null);
    try {
      const res = await tutorApi.diagnose({
        topicId: useCustom ? "custom" : activeTopic.id,
        language,
        preAnswerIndex,
        hintLevel: nextHint,
        customCode: useCustom ? customCode : undefined,
      });
      setDiagnosis(res);
      if (useCustom) {
        setEditorCode(customCode);
      }
    } catch (err: any) {
      setErrorBanner(err.message);
    } finally {
      setLoadingDiagnosis(false);
    }
  };

  const handleVerifyFix = async () => {
    if (!activeTopic) return;
    setLoadingVerify(true);
    setErrorBanner(null);
    try {
      const res = await tutorApi.verifyFix({
        topicId: activeTopic.id,
        fixedCode: editorCode,
        language,
      });
      setFixResult(res);
    } catch (err: any) {
      setErrorBanner(err.message);
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleSubmitTransfer = async () => {
    if (!activeTopic || transferIndex === undefined) return;
    setLoadingTransfer(true);
    setErrorBanner(null);
    try {
      const preScore =
        diagnosis?.preScorePct ?? (preAnswerIndex === activeTopic.preQuiz.correctIndex ? 100 : 25);
      const report = await tutorApi.submitTransferCheck({
        topicId: activeTopic.id,
        preScorePct: preScore,
        hintsUsed: diagnosis?.hintLevel ?? hintLevel,
        selectedIndex: transferIndex,
        language,
      });
      setMasteryReport(report);
    } catch (err: any) {
      setErrorBanner(err.message);
    } finally {
      setLoadingTransfer(false);
    }
  };

  const handleRefreshEvals = async () => {
    setEvalLoading(true);
    try {
      const data = await tutorApi.getEvals();
      setEvalReport(data);
    } catch (err: any) {
      setErrorBanner(err.message);
    } finally {
      setEvalLoading(false);
    }
  };

  const handleAdvanceLab = () => {
    if (!activeTopic || topics.length === 0) return;
    const idx = topics.findIndex((t) => t.id === activeTopic.id);
    const nextTopic = topics[(idx + 1) % topics.length];
    selectTopic(nextTopic);
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#eef0f5]">
      {/* Compact single-row workbench top bar */}
      <header className="sticky top-0 z-30 border-b border-[#eef0f5]/[0.08] bg-[#07080d]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              className="shrink-0 text-[#eef0f5]"
            >
              <path
                d="M5.5 4.5L2 9L5.5 13.5M12.5 4.5L16 9L12.5 13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="9" r="1.5" fill="#38bdf8" />
            </svg>
            <h1 className="text-[16px] font-semibold tracking-[-0.01em] text-[#eef0f5]">
              GuruProof
            </h1>
            <span className="hidden font-mono text-[12px] text-[#7a8296] sm:inline">
              Diagnostic coding tutor
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation switch */}
            <nav className="inline-flex items-center rounded-[8px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-0.5 text-[13px]">
              <button
                type="button"
                onClick={() => setActiveTab("tutor")}
                className={`ease-unslop inline-flex h-8 items-center gap-2 rounded-[6px] px-3 transition-colors duration-150 ${
                  activeTab === "tutor"
                    ? "bg-[#1a1e28] font-medium text-[#eef0f5] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-[#7a8296] hover:text-[#a3a9b8]"
                }`}
              >
                <Code2 className="h-4 w-4 text-[#a3a9b8]" strokeWidth={1.5} />
                <span>Tutor lab</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("evals")}
                className={`ease-unslop inline-flex h-8 items-center gap-2 rounded-[6px] px-3 transition-colors duration-150 ${
                  activeTab === "evals"
                    ? "bg-[#1a1e28] font-medium text-[#eef0f5] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-[#7a8296] hover:text-[#a3a9b8]"
                }`}
              >
                <FlaskConical className="h-4 w-4 text-[#a3a9b8]" strokeWidth={1.5} />
                <span>Pedagogical evals</span>
              </button>
            </nav>

            {/* Language switch */}
            <div className="inline-flex items-center rounded-[8px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-0.5 text-[13px]">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`ease-unslop h-8 rounded-[6px] px-2.5 transition-colors duration-150 ${
                    language === lang.id
                      ? "bg-[#1a1e28] font-medium text-[#38bdf8] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      : "text-[#7a8296] hover:text-[#a3a9b8]"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Quiet grounding meta indicator */}
            <div className="hidden items-center gap-2 font-mono text-[12px] text-[#7a8296] lg:flex">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  health?.status === "healthy" ? "bg-[#4cc38a]" : "bg-[#d99b43]"
                }`}
              />
              <span>{health?.integrations.olostep ? "Olostep live" : "Curated docs"}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-6">
        {errorBanner && (
          <div className="mb-6 flex items-center justify-between rounded-[10px] border border-[#e5484d]/30 bg-[#11141c] px-4 py-3 text-[13px] text-[#eef0f5]">
            <span>{errorBanner}</span>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-[12px] font-medium text-[#a3a9b8] underline hover:text-[#eef0f5]"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === "evals" ? (
          <EvalSuiteView report={evalReport} loading={evalLoading} onRefresh={handleRefreshEvals} />
        ) : (
          <div className="space-y-6">
            {/* Lab selector bar */}
            <section className="rounded-[14px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-[#a3a9b8]">
                  Diagnostic DSA curriculum
                </span>

                <button
                  type="button"
                  onClick={() => setCustomMode((m) => !m)}
                  className={`ease-unslop inline-flex h-8 items-center gap-2 rounded-[8px] border px-3 text-[12px] font-medium transition-colors duration-150 active:scale-[0.98] ${
                    customMode
                      ? "border-[#38bdf8]/40 bg-[#1a1e28] text-[#38bdf8]"
                      : "border-[#eef0f5]/[0.08] bg-[#1a1e28] text-[#a3a9b8] hover:text-[#eef0f5]"
                  }`}
                >
                  <Terminal className="h-4 w-4 text-[#7a8296]" strokeWidth={1.5} />
                  <span>{customMode ? "Custom snippet active" : "Custom code"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {topics.map((topic) => {
                  const selected = topic.id === activeTopic?.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => selectTopic(topic)}
                      className={`ease-unslop flex flex-col justify-between rounded-[10px] border p-4 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38bdf8] ${
                        selected
                          ? "border-[#38bdf8]/50 bg-[#1a1e28] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "border-[#eef0f5]/[0.06] bg-[#07080d]/60 hover:border-[#eef0f5]/[0.14] hover:bg-[#1a1e28]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[12px]">
                        <span className={selected ? "text-[#38bdf8]" : "text-[#7a8296]"}>
                          {topic.category}
                        </span>
                        <span className="font-mono text-[#7a8296]">{topic.difficulty}</span>
                      </div>
                      <div className="mt-2 text-[14px] font-medium leading-snug text-[#eef0f5]">
                        {topic.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              {customMode && (
                <div className="mt-4 rounded-[10px] border border-[#eef0f5]/[0.08] bg-[#07080d] p-4">
                  <label className="mb-2 block text-[13px] font-medium text-[#a3a9b8]">
                    Custom Java or DSA snippet
                  </label>
                  <textarea
                    rows={4}
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="Paste code with a pointer, loop boundary, or recursion bug"
                    className="w-full rounded-[8px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-3 font-mono text-[13px] leading-relaxed text-[#eef0f5] placeholder-[#7a8296] focus:border-[#38bdf8]/50 focus:outline-none"
                  />
                </div>
              )}
            </section>

            {activeTopic && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Workbench Column */}
                <div className="space-y-6 lg:col-span-6">
                  {/* Stage 1: Diagnostic Pre-Test */}
                  <section className="rounded-[14px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-[16px] font-medium text-[#eef0f5]">{copy.step1Title}</h2>
                        <p className="mt-1 text-[13px] text-[#7a8296]">{copy.step1Sub}</p>
                      </div>
                      {diagnosis && (
                        <span className="shrink-0 rounded-[4px] border border-[#eef0f5]/[0.08] bg-[#1a1e28] px-2 py-1 font-mono text-[12px] tabular-nums text-[#a3a9b8]">
                          Pre {diagnosis.preScorePct}%
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-[14px] leading-relaxed text-[#eef0f5]">
                      {activeTopic.preQuiz.question[language]}
                    </p>

                    <div className="mt-3 space-y-2">
                      {activeTopic.preQuiz.options[language].map((opt, idx) => {
                        const chosen = preAnswerIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPreAnswerIndex(idx)}
                            className={`ease-unslop flex min-h-[40px] w-full items-center gap-3 rounded-[8px] border px-3 py-2 text-left text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38bdf8] ${
                              chosen
                                ? "border-[#38bdf8]/50 bg-[#1a1e28] text-[#eef0f5]"
                                : "border-[#eef0f5]/[0.08] bg-[#07080d]/60 text-[#a3a9b8] hover:border-[#eef0f5]/[0.14] hover:text-[#eef0f5]"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border font-mono text-[12px] tabular-nums ${
                                chosen
                                  ? "border-[#38bdf8]/40 bg-[#38bdf8]/15 text-[#38bdf8]"
                                  : "border-[#eef0f5]/[0.08] bg-[#11141c] text-[#7a8296]"
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDiagnose(1)}
                        disabled={loadingDiagnosis}
                        className="ease-unslop inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#eef0f5] px-4 text-[14px] font-medium text-[#07080d] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                      >
                        <Play className="h-4 w-4 text-[#07080d]" strokeWidth={1.5} />
                        <span>{loadingDiagnosis ? "Analyzing" : copy.diagnoseBtn}</span>
                      </button>
                    </div>
                  </section>

                  {/* Stage 2: Socratic Diagnosis, Memory Trace, Grounded References */}
                  {diagnosis && (
                    <section className="space-y-4 rounded-[14px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-[16px] font-medium text-[#eef0f5]">{copy.step2Title}</h2>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] tabular-nums text-[#a3a9b8]">
                          <Shield className="h-4 w-4 text-[#4cc38a]" strokeWidth={1.5} />
                          <span>
                            {diagnosis.spoilerGuardrailPassed
                              ? "0% spoiler leak"
                              : "Guardrail check"}
                          </span>
                        </span>
                      </div>

                      {/* Misconception Redline Callout */}
                      <div className="rounded-[10px] border border-[#eef0f5]/[0.08] border-l-2 border-l-[#e5484d] bg-[#07080d] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                          <span className="font-medium text-[#eef0f5]">
                            {diagnosis.misconceptionDetected}
                          </span>
                          <span className="rounded-[4px] border border-[#e5484d]/30 bg-[#e5484d]/[0.08] px-2 py-0.5 font-mono text-[12px] tabular-nums text-[#e5484d]">
                            Line {diagnosis.brokenLine}
                          </span>
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed text-[#a3a9b8]">
                          {diagnosis.diagnosisSummary}
                        </p>
                      </div>

                      {/* Progressive Socratic Hint Tier */}
                      <div className="rounded-[10px] border border-[#eef0f5]/[0.08] bg-[#1a1e28] p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#eef0f5]">
                            <Lightbulb className="h-4 w-4 text-[#7a8296]" strokeWidth={1.5} />
                            <span className="tabular-nums">
                              Socratic hint {diagnosis.hintLevel} of 3
                            </span>
                          </span>
                          <span className="font-mono text-[12px] text-[#7a8296]">
                            {diagnosis.llmProviderUsed}
                          </span>
                        </div>
                        <p className="text-[14px] leading-relaxed text-[#eef0f5]">
                          {diagnosis.socraticHint}
                        </p>

                        {diagnosis.hintLevel < 3 && (
                          <button
                            type="button"
                            onClick={() => handleDiagnose(diagnosis.hintLevel + 1)}
                            disabled={loadingDiagnosis}
                            className="ease-unslop mt-3 inline-flex h-8 items-center gap-2 rounded-[6px] border border-[#eef0f5]/[0.1] bg-[#11141c] px-3 text-[12px] font-medium text-[#eef0f5] transition-colors duration-150 hover:border-[#38bdf8]/40 active:scale-[0.98]"
                          >
                            <span className="tabular-nums">
                              {copy.nextHintBtn} ({diagnosis.hintLevel + 1}/3)
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Visual Memory Trace Moment */}
                      <TraceStepper
                        buggyTrace={diagnosis.visualTrace}
                        fixedTrace={activeTopic.visualTraceFixed}
                        showFixedTrace={Boolean(fixResult?.passed)}
                      />

                      {/* Grounded CS Documentation References */}
                      <div className="rounded-[12px] border border-[#eef0f5]/[0.08] bg-[#07080d] p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[13px] font-medium text-[#a3a9b8]">
                            Grounded references
                          </span>
                          <span className="font-mono text-[12px] text-[#7a8296]">
                            Olostep search
                          </span>
                        </div>
                        <div className="divide-y divide-[#eef0f5]/[0.06]">
                          {diagnosis.citations.map((c, idx) => (
                            <a
                              key={idx}
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="ease-unslop group block py-2.5 first:pt-0 last:pb-0 transition-colors duration-150"
                            >
                              <div className="flex items-center justify-between gap-2 text-[13px] font-medium text-[#eef0f5] group-hover:text-[#38bdf8]">
                                <span className="truncate">{c.title}</span>
                                <ArrowUpRight
                                  className="h-4 w-4 shrink-0 text-[#7a8296] group-hover:text-[#38bdf8]"
                                  strokeWidth={1.5}
                                />
                              </div>
                              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#7a8296]">
                                {c.snippet}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Workbench Column: Code Repair + Blind Transfer Post-Test */}
                <div className="space-y-6 lg:col-span-6">
                  {/* Stage 3: Live Code Repair */}
                  <section className="rounded-[14px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-[16px] font-medium text-[#eef0f5]">{copy.step3Title}</h2>
                        <p className="mt-1 text-[13px] text-[#7a8296]">
                          Check invariant near{" "}
                          <span className="rounded-[4px] border border-[#e5484d]/30 bg-[#e5484d]/[0.08] px-1.5 py-0.5 font-mono text-[12px] tabular-nums text-[#e5484d]">
                            Line {highlightedLine}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditorCode(activeTopic.buggyCode);
                          setFixResult(null);
                        }}
                        className="ease-unslop inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-[#eef0f5]/[0.08] bg-[#1a1e28] px-3 text-[12px] font-medium text-[#a3a9b8] transition-colors duration-150 hover:text-[#eef0f5] active:scale-[0.98]"
                      >
                        <RotateCcw className="h-4 w-4 text-[#7a8296]" strokeWidth={1.5} />
                        <span>{copy.resetCodeBtn}</span>
                      </button>
                    </div>

                    {/* Code editor with signature redline gutter */}
                    <div className="overflow-hidden rounded-[10px] border border-[#eef0f5]/[0.08] bg-[#07080d]">
                      <div className="flex items-center justify-between gap-3 border-b border-[#eef0f5]/[0.08] bg-[#11141c] px-4 py-2 font-mono text-[12px] text-[#7a8296]">
                        <span className="text-[#a3a9b8]">Solution.java</span>
                        <span className="truncate">{activeTopic.expectedConcept}</span>
                      </div>

                      <div className="flex">
                        <div
                          aria-hidden="true"
                          className="select-none border-r border-[#eef0f5]/[0.06] bg-[#0b0d14] py-4 pl-3 pr-2.5 text-right font-mono text-[12px] leading-[1.625] tabular-nums"
                        >
                          {codeLines.map((_, idx) => {
                            const lineNum = idx + 1;
                            const isFault = lineNum === highlightedLine && !fixResult?.passed;
                            return (
                              <div
                                key={lineNum}
                                className={
                                  isFault
                                    ? "font-medium text-[#e5484d]"
                                    : "text-[#7a8296]/70"
                                }
                              >
                                {lineNum}
                              </div>
                            );
                          })}
                        </div>
                        <textarea
                          value={editorCode}
                          onChange={(e) => setEditorCode(e.target.value)}
                          rows={Math.max(10, codeLines.length)}
                          spellCheck={false}
                          className="w-full resize-y bg-transparent p-4 font-mono text-[13px] leading-[1.625] text-[#eef0f5] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleVerifyFix}
                        disabled={loadingVerify}
                        className="ease-unslop inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#eef0f5] px-4 text-[14px] font-medium text-[#07080d] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                      >
                        <Check className="h-4 w-4 text-[#07080d]" strokeWidth={1.5} />
                        <span>{loadingVerify ? "Running tests" : copy.verifyFixBtn}</span>
                      </button>

                      {fixResult && (
                        <span
                          className={`font-mono text-[13px] font-medium tabular-nums ${
                            fixResult.passed ? "text-[#4cc38a]" : "text-[#e5484d]"
                          }`}
                        >
                          {fixResult.testsPassed} / {fixResult.testsRun} passed
                        </span>
                      )}
                    </div>

                    {fixResult && (
                      <div className="mt-4 space-y-2">
                        <div
                          className={`rounded-[8px] border p-3 text-[13px] leading-relaxed ${
                            fixResult.passed
                              ? "border-[#4cc38a]/30 bg-[#07080d] text-[#eef0f5]"
                              : "border-[#e5484d]/30 bg-[#07080d] text-[#eef0f5]"
                          }`}
                        >
                          {fixResult.feedback}
                        </div>

                        <div className="divide-y divide-[#eef0f5]/[0.06] rounded-[8px] border border-[#eef0f5]/[0.08] bg-[#07080d]">
                          {fixResult.testCases.map((tc, i) => (
                            <div
                              key={i}
                              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-[12px]"
                            >
                              <div className="flex items-center gap-2">
                                {tc.passed ? (
                                  <Check className="h-4 w-4 text-[#4cc38a]" strokeWidth={1.5} />
                                ) : (
                                  <X className="h-4 w-4 text-[#e5484d]" strokeWidth={1.5} />
                                )}
                                <span className="font-medium text-[#eef0f5]">{tc.name}</span>
                              </div>
                              <div className="font-mono tabular-nums text-[#7a8296]">
                                Expected <span className="text-[#a3a9b8]">{tc.expected}</span> ·
                                Actual{" "}
                                <span
                                  className={tc.passed ? "text-[#4cc38a]" : "text-[#e5484d]"}
                                >
                                  {tc.actual}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Stage 4: Blind Transfer Post-Test & Mastery Proof Moment */}
                  <section className="rounded-[14px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="text-[16px] font-medium text-[#eef0f5]">{copy.step4Title}</h2>
                        <p className="mt-1 text-[13px] text-[#7a8296]">{copy.step4Sub}</p>
                      </div>
                      {fixResult?.readyForTransferTest && (
                        <span className="font-mono text-[12px] text-[#4cc38a]">
                          Green build ready
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-[14px] leading-relaxed text-[#eef0f5]">
                      {activeTopic.transferTest.question[language]}
                    </p>

                    <div className="mt-3 space-y-2">
                      {activeTopic.transferTest.options[language].map((opt, idx) => {
                        const selected = transferIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTransferIndex(idx)}
                            className={`ease-unslop flex min-h-[40px] w-full items-center gap-3 rounded-[8px] border px-3 py-2 text-left text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38bdf8] ${
                              selected
                                ? "border-[#38bdf8]/50 bg-[#1a1e28] text-[#eef0f5]"
                                : "border-[#eef0f5]/[0.08] bg-[#07080d]/60 text-[#a3a9b8] hover:border-[#eef0f5]/[0.14] hover:text-[#eef0f5]"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border font-mono text-[12px] tabular-nums ${
                                selected
                                  ? "border-[#38bdf8]/40 bg-[#38bdf8]/15 text-[#38bdf8]"
                                  : "border-[#eef0f5]/[0.08] bg-[#11141c] text-[#7a8296]"
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmitTransfer}
                      disabled={transferIndex === undefined || loadingTransfer}
                      className="ease-unslop mt-4 inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#38bdf8] px-4 text-[14px] font-medium text-[#07080d] transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                    >
                      <span>{loadingTransfer ? "Evaluating" : copy.proveMasteryBtn}</span>
                      <ArrowRight className="h-4 w-4 text-[#07080d]" strokeWidth={1.5} />
                    </button>

                    {/* Mastery Proof Scorecard Moment */}
                    {masteryReport && (
                      <div className="mt-5 rounded-[12px] border border-[#eef0f5]/[0.1] bg-[#07080d] p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                masteryReport.verdict === "VERIFIED MASTERY"
                                  ? "bg-[#4cc38a]"
                                  : "bg-[#d99b43]"
                              }`}
                            />
                            <span className="text-[15px] font-medium text-[#eef0f5]">
                              {masteryReport.verdict === "VERIFIED MASTERY"
                                ? "Verified mastery"
                                : "Needs practice"}
                            </span>
                          </div>
                          <span className="font-mono text-[12px] text-[#7a8296]">
                            {masteryReport.pedagogicalEval.languageFidelity}
                          </span>
                        </div>

                        {/* Asymmetric hero delta paired with compact Pre/Post comparison */}
                        <div className="mt-4 grid grid-cols-1 gap-4 border-y border-[#eef0f5]/[0.08] py-4 sm:grid-cols-12">
                          <div className="sm:col-span-6">
                            <div className="text-[12px] text-[#7a8296]">Mastery gain</div>
                            <div className="mt-1 font-mono text-[32px] font-medium leading-none tracking-[-0.02em] tabular-nums text-[#4cc38a]">
                              +{masteryReport.masteryDeltaPct}%
                            </div>
                            <div className="mt-1.5 font-mono text-[12px] tabular-nums text-[#7a8296]">
                              vs pre-test baseline
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:col-span-6">
                            <div className="rounded-[8px] border border-[#eef0f5]/[0.06] bg-[#11141c] p-3">
                              <div className="text-[12px] text-[#7a8296]">Pre-test</div>
                              <div className="mt-1 font-mono text-[20px] font-medium leading-none tabular-nums text-[#a3a9b8]">
                                {masteryReport.preScorePct}%
                              </div>
                            </div>
                            <div className="rounded-[8px] border border-[#eef0f5]/[0.06] bg-[#11141c] p-3">
                              <div className="text-[12px] text-[#7a8296]">Post-test</div>
                              <div className="mt-1 font-mono text-[20px] font-medium leading-none tabular-nums text-[#eef0f5]">
                                {masteryReport.postScorePct}%
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="mt-4 text-[13px] leading-relaxed text-[#a3a9b8]">
                          {masteryReport.transferExplanation}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#7a8296]">
                          <span className="font-mono tabular-nums">
                            Hints {masteryReport.hintsUsed}/3 · Spoiler leak{" "}
                            {masteryReport.pedagogicalEval.spoilerLeakPct}%
                          </span>
                          <button
                            type="button"
                            onClick={handleAdvanceLab}
                            className="ease-unslop inline-flex items-center gap-1.5 font-medium text-[#38bdf8] transition-colors duration-150 hover:text-[#eef0f5]"
                          >
                            <span>{copy.nextLabBtn}</span>
                            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
