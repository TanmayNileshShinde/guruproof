import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  ExternalLink,
  FlaskConical,
  Globe,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Terminal,
  XCircle,
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

const LANGUAGES: Array<{ id: TutorLanguage; label: string; native: string }> = [
  { id: "en", label: "English", native: "EN" },
  { id: "hinglish", label: "Hinglish", native: "HI-EN" },
  { id: "hi", label: "हिन्दी", native: "HI" },
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
    step1Title: "1. Diagnostic Pre-Test",
    step1Sub: "Measure baseline intuition before viewing hints",
    diagnoseBtn: "Diagnose Concept & Trace",
    step2Title: "2. Socratic Diagnosis & Grounded Docs",
    nextHintBtn: "Request Next Hint Tier",
    step3Title: "3. Repair Code & Verify Live Tests",
    verifyFixBtn: "Verify My Fix",
    resetCodeBtn: "Reset Buggy Code",
    step4Title: "4. Blind Transfer Post-Test",
    step4Sub: "Apply the fixed invariant to a fresh edge-case scenario",
    proveMasteryBtn: "Verify Mastery Proof",
    nextLabBtn: "Advance to Next Lab",
  },
  hinglish: {
    step1Title: "1. Diagnostic Pre-Test",
    step1Sub: "Hints dekhne se pehle apna current concept check karo",
    diagnoseBtn: "Concept Diagnose Karo",
    step2Title: "2. Socratic Diagnosis & Citations",
    nextHintBtn: "Agla Hint Tier Dekho",
    step3Title: "3. Code Fix Karo & Tests Chalao",
    verifyFixBtn: "Mera Fix Verify Karo",
    resetCodeBtn: "Original Code Reset",
    step4Title: "4. Blind Transfer Post-Test",
    step4Sub: "Ab bina code dekhe naye scenario par concept prove karo",
    proveMasteryBtn: "Mastery Proof Generate Karo",
    nextLabBtn: "Next Lab Start Karo",
  },
  hi: {
    step1Title: "1. निदानात्मक पूर्व-परीक्षण (Pre-Test)",
    step1Sub: "संकेत देखने से पहले अपनी वर्तमान समझ जांचें",
    diagnoseBtn: "कोड और अवधारणा जांचें",
    step2Title: "2. सुकराती निदान और संदर्भ (Citations)",
    nextHintBtn: "अगला संकेत स्तर देखें",
    step3Title: "3. कोड सुधारें और परीक्षण चलाएं",
    verifyFixBtn: "सुधार सत्यापित करें",
    resetCodeBtn: "मूल कोड रीसेट करें",
    step4Title: "4. ब्लाइंड ट्रांसफर पोस्ट-टेस्ट",
    step4Sub: "एक नए परिदृश्य पर अपनी समझ प्रमाणित करें",
    proveMasteryBtn: "मास्टरी प्रूफ बनाएं",
    nextLabBtn: "अगली लैब पर जाएं",
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
      const preScore = diagnosis?.preScorePct ?? (preAnswerIndex === activeTopic.preQuiz.correctIndex ? 100 : 25);
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
    <div className="min-h-screen bg-[#070b12] text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#070b12]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">GuruProof</h1>
                <span className="rounded-full border border-indigo-500/40 bg-indigo-500/15 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                  Track C3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multilingual Socratic AI Tutor · Diagnostic Trace + Blind Mastery Proof
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Health indicator */}
            <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs text-slate-300 md:flex">
              <span
                className={`h-2 w-2 rounded-full ${
                  health?.status === "healthy" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span>
                {health?.integrations.olostep ? "Olostep Live Grounding Ready" : "Curated Docs Mode"}
              </span>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("tutor")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  activeTab === "tutor"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Tutor Lab
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("evals")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  activeTab === "evals"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FlaskConical className="h-3.5 w-3.5" />
                Pedagogical Evals
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
              <Globe className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    language === lang.id
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {errorBanner && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
            <span>{errorBanner}</span>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-xs font-semibold text-rose-300 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === "evals" ? (
          <EvalSuiteView report={evalReport} loading={evalLoading} onRefresh={handleRefreshEvals} />
        ) : (
          <div className="space-y-6">
            {/* Topic Selector Strip */}
            <section className="rounded-2xl border border-slate-800 bg-[#0d1420] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  Select Interactive DSA Diagnostic Lab
                </div>

                <button
                  type="button"
                  onClick={() => setCustomMode((m) => !m)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                    customMode
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  {customMode ? "Custom Snippet Active" : "Diagnose Custom Code"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {topics.map((topic) => {
                  const selected = topic.id === activeTopic?.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => selectTopic(topic)}
                      className={`rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-indigo-500 bg-indigo-500/15 shadow-sm shadow-indigo-500/10"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-indigo-300">
                          {topic.category}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                            topic.difficulty === "Beginner"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {topic.difficulty}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-100">{topic.title}</div>
                    </button>
                  );
                })}
              </div>

              {customMode && (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-slate-950/70 p-3.5">
                  <label className="mb-1.5 block text-xs font-semibold text-amber-200">
                    Paste Your Own Java/DSA Code to Diagnose Misconceptions:
                  </label>
                  <textarea
                    rows={4}
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="Paste code containing a loop, pointer, recursion, or off-by-one bug..."
                    className="w-full rounded-lg border border-slate-800 bg-[#070b12] p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
              )}
            </section>

            {activeTopic && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Column: Pre-Test + Diagnosis + Trace + Citations */}
                <div className="space-y-6 lg:col-span-6">
                  {/* Stage 1: Diagnostic Pre-Test */}
                  <section className="rounded-2xl border border-slate-800 bg-[#0d1420] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-white">{copy.step1Title}</h2>
                        <p className="mt-0.5 text-xs text-slate-400">{copy.step1Sub}</p>
                      </div>
                      {diagnosis && (
                        <span
                          className={`rounded-full px-2.5 py-1 font-mono text-xs font-bold ${
                            diagnosis.preCorrect
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          Pre: {diagnosis.preScorePct}%
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-200">
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
                            className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs transition sm:text-sm ${
                              chosen
                                ? "border-indigo-500 bg-indigo-500/15 text-white"
                                : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                                chosen
                                  ? "bg-indigo-500 text-white"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDiagnose(1)}
                        disabled={loadingDiagnosis}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                      >
                        <Play className="h-4 w-4" />
                        {loadingDiagnosis ? "Analyzing..." : copy.diagnoseBtn}
                      </button>
                      {preAnswerIndex === undefined && (
                        <span className="text-xs text-slate-500">
                          Pick an option above for accurate baseline scoring
                        </span>
                      )}
                    </div>
                  </section>

                  {/* Stage 2: Socratic Diagnosis, Anti-Spoiler Hints & Grounded Docs */}
                  {diagnosis && (
                    <section className="space-y-4 rounded-2xl border border-indigo-500/30 bg-[#0d1420] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-white">{copy.step2Title}</h2>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {diagnosis.spoilerGuardrailPassed
                              ? "0% Spoiler Leak Verified"
                              : "Guardrail Alert"}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                          <span>Misconception: {diagnosis.misconceptionDetected}</span>
                          <span className="font-mono">Bug near Line {diagnosis.brokenLine}</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-200 sm:text-sm">
                          {diagnosis.diagnosisSummary}
                        </p>
                      </div>

                      {/* Socratic Hint Tier Card */}
                      <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                            <Lightbulb className="h-4 w-4 text-amber-400" />
                            Socratic Hint Tier {diagnosis.hintLevel} / 3
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {diagnosis.llmProviderUsed}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-100 sm:text-sm">
                          {diagnosis.socraticHint}
                        </p>

                        {diagnosis.hintLevel < 3 && (
                          <button
                            type="button"
                            onClick={() => handleDiagnose(diagnosis.hintLevel + 1)}
                            disabled={loadingDiagnosis}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/25"
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                            {copy.nextHintBtn} ({diagnosis.hintLevel + 1}/3)
                          </button>
                        )}
                      </div>

                      {/* Visual Memory Trace Stepper */}
                      <TraceStepper
                        buggyTrace={diagnosis.visualTrace}
                        fixedTrace={activeTopic.visualTraceFixed}
                        showFixedTrace={Boolean(fixResult?.passed)}
                      />

                      {/* Grounded Documentation Citations */}
                      <div className="rounded-xl border border-slate-800 bg-[#0b111c] p-4">
                        <div className="mb-2.5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">
                            Grounded Documentation References
                          </span>
                          <span className="text-[11px] text-sky-400">Olostep Search API</span>
                        </div>
                        <div className="space-y-2">
                          {diagnosis.citations.map((c, idx) => (
                            <a
                              key={idx}
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-lg border border-slate-800/90 bg-slate-900/70 p-2.5 transition hover:border-sky-500/40"
                            >
                              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-sky-300">
                                <span className="truncate">{c.title}</span>
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              </div>
                              <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
                                {c.snippet}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column: Code Editor + Verify Fix + Blind Transfer Post-Test + Mastery Proof */}
                <div className="space-y-6 lg:col-span-6">
                  {/* Stage 3: Interactive Code Repair */}
                  <section className="rounded-2xl border border-slate-800 bg-[#0d1420] p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-white">{copy.step3Title}</h2>
                        <p className="text-xs text-slate-400">
                          Inspect line{" "}
                          <span className="font-mono text-amber-300">
                            #{diagnosis?.brokenLine ?? activeTopic.bugLine}
                          </span>{" "}
                          and repair the invariant below
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditorCode(activeTopic.buggyCode);
                          setFixResult(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {copy.resetCodeBtn}
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#070b12]">
                      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-3.5 py-2 text-[11px] font-mono text-slate-400">
                        <span>Solution.java</span>
                        <span>Expected Concept: {activeTopic.expectedConcept}</span>
                      </div>
                      <textarea
                        value={editorCode}
                        onChange={(e) => setEditorCode(e.target.value)}
                        rows={11}
                        spellCheck={false}
                        className="w-full resize-y bg-transparent p-4 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none sm:text-[13px]"
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleVerifyFix}
                        disabled={loadingVerify}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {loadingVerify ? "Running Tests..." : copy.verifyFixBtn}
                      </button>

                      {fixResult && (
                        <span
                          className={`rounded-full px-3 py-1 font-mono text-xs font-bold ${
                            fixResult.passed
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {fixResult.testsPassed} / {fixResult.testsRun} Tests Passed
                        </span>
                      )}
                    </div>

                    {fixResult && (
                      <div className="mt-4 space-y-2.5">
                        <div
                          className={`rounded-xl border p-3 text-xs leading-relaxed ${
                            fixResult.passed
                              ? "border-emerald-500/40 bg-emerald-950/25 text-emerald-200"
                              : "border-rose-500/40 bg-rose-950/25 text-rose-200"
                          }`}
                        >
                          {fixResult.feedback}
                        </div>

                        {fixResult.testCases.map((tc, i) => (
                          <div
                            key={i}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              {tc.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-rose-400" />
                              )}
                              <span className="font-semibold text-slate-200">{tc.name}</span>
                            </div>
                            <div className="font-mono text-[11px] text-slate-400">
                              Expected: <span className="text-slate-200">{tc.expected}</span> ·
                              Actual:{" "}
                              <span className={tc.passed ? "text-emerald-300" : "text-rose-300"}>
                                {tc.actual}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Stage 4: Blind Transfer Post-Test & Mastery Proof */}
                  <section
                    className={`rounded-2xl border p-5 transition ${
                      fixResult?.readyForTransferTest
                        ? "border-emerald-500/40 bg-[#0d1420]"
                        : "border-slate-800 bg-[#0d1420]/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-base font-bold text-white">{copy.step4Title}</h2>
                        <p className="mt-0.5 text-xs text-slate-400">{copy.step4Sub}</p>
                      </div>
                      {fixResult?.readyForTransferTest && (
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                          Unlocked by Green Build
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-200">
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
                            className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs transition sm:text-sm ${
                              selected
                                ? "border-emerald-500 bg-emerald-500/15 text-white"
                                : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                                selected
                                  ? "bg-emerald-500 text-slate-950"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmitTransfer}
                      disabled={transferIndex === undefined || loadingTransfer}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
                    >
                      <Award className="h-4 w-4" />
                      {loadingTransfer ? "Evaluating..." : copy.proveMasteryBtn}
                    </button>

                    {masteryReport && (
                      <div className="mt-5 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 to-[#0a1622] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Award
                              className={`h-5 w-5 ${
                                masteryReport.verdict === "VERIFIED MASTERY"
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }`}
                            />
                            <span className="text-sm font-extrabold tracking-wide text-white">
                              {masteryReport.verdict}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-slate-400">
                            {masteryReport.pedagogicalEval.languageFidelity}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                          <div className="rounded-lg border border-slate-800 bg-[#070b12] p-2.5">
                            <div className="text-[11px] text-slate-400">Pre-Test</div>
                            <div className="font-mono text-lg font-bold text-slate-300">
                              {masteryReport.preScorePct}%
                            </div>
                          </div>
                          <div className="rounded-lg border border-slate-800 bg-[#070b12] p-2.5">
                            <div className="text-[11px] text-slate-400">Post-Test</div>
                            <div className="font-mono text-lg font-bold text-emerald-400">
                              {masteryReport.postScorePct}%
                            </div>
                          </div>
                          <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-2.5">
                            <div className="text-[11px] text-emerald-300">Mastery Delta</div>
                            <div className="font-mono text-lg font-extrabold text-emerald-300">
                              +{masteryReport.masteryDeltaPct}%
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 text-xs leading-relaxed text-slate-300">
                          {masteryReport.transferExplanation}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                          <span>
                            Hints used: {masteryReport.hintsUsed}/3 · Spoiler leakage:{" "}
                            {masteryReport.pedagogicalEval.spoilerLeakPct}%
                          </span>
                          <button
                            type="button"
                            onClick={handleAdvanceLab}
                            className="inline-flex items-center gap-1 font-semibold text-indigo-300 hover:text-indigo-200"
                          >
                            {copy.nextLabBtn}
                            <ArrowRight className="h-3.5 w-3.5" />
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
