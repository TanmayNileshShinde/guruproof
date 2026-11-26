import React from "react";
import { CheckCircle2, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { PedagogicalEvalReport } from "../types";

interface EvalSuiteViewProps {
  report: PedagogicalEvalReport | null;
  loading: boolean;
  onRefresh: () => void;
}

export const EvalSuiteView: React.FC<EvalSuiteViewProps> = ({ report, loading, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0d1420] p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <ShieldCheck className="h-4 w-4" />
            Automated Pedagogical Evaluation Harness
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-100">
            Tutor Quality & Anti-Spoiler Verification Suite
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Verifies zero answer leakage across hint tiers, buggy-code detection fidelity, and
            English/Hinglish/Hindi curriculum completeness.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/25 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Re-run Eval Suite
        </button>
      </div>

      {report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-[#0d1420] p-4">
              <div className="text-xs text-slate-400">Suite Status</div>
              <div className="mt-2 flex items-center gap-2 text-lg font-bold text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                {report.suitePassed ? "100% PASSED" : "ATTENTION NEEDED"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0d1420] p-4">
              <div className="text-xs text-slate-400">Spoiler Leakage Rate</div>
              <div className="mt-2 font-mono text-2xl font-bold text-emerald-400">
                {report.metrics.spoilerLeakagePct}%
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0d1420] p-4">
              <div className="text-xs text-slate-400">Diagnostic Catch Rate</div>
              <div className="mt-2 font-mono text-2xl font-bold text-sky-400">
                {report.metrics.diagnosticCatchRatePct}%
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0d1420] p-4">
              <div className="text-xs text-slate-400">Multilingual Coverage</div>
              <div className="mt-2 font-mono text-2xl font-bold text-indigo-300">
                {report.metrics.multilingualCoveragePct}% ({report.metrics.totalEvalChecks} checks)
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1420]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/70 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Curriculum Lab</th>
                  <th className="px-5 py-3.5">Anti-Spoiler Guardrail</th>
                  <th className="px-5 py-3.5">Buggy Code Caught</th>
                  <th className="px-5 py-3.5">EN / Hinglish / HI</th>
                  <th className="px-5 py-3.5">Blind Transfer Quiz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {report.cases.map((item) => (
                  <tr key={item.topicId} className="hover:bg-slate-900/40">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-100">{item.title}</div>
                      <div className="font-mono text-xs text-slate-500">{item.topicId}</div>
                    </td>
                    {[
                      item.antiSpoilerPass,
                      item.buggyCodeCaught,
                      item.multilingualReady,
                      item.transferQuestionPresent,
                    ].map((ok, i) => (
                      <td key={i} className="px-5 py-4">
                        {ok ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-medium text-rose-300">
                            <XCircle className="h-3.5 w-3.5" /> Fail
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-[#0d1420] p-8 text-center text-sm text-slate-400">
          Loading pedagogical evaluation metrics...
        </div>
      )}
    </div>
  );
};
