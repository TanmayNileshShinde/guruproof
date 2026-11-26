import React from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { PedagogicalEvalReport } from "../types";

interface EvalSuiteViewProps {
  report: PedagogicalEvalReport | null;
  loading: boolean;
  onRefresh: () => void;
}

export const EvalSuiteView: React.FC<EvalSuiteViewProps> = ({ report, loading, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-6">
        <div className="max-w-2xl space-y-1">
          <div className="text-[12px] font-mono text-[#7a8296]">Pedagogical evaluation suite</div>
          <h2 className="text-[20px] font-medium tracking-[-0.01em] text-[#eef0f5]">
            Tutor quality and anti-spoiler checks
          </h2>
          <p className="text-[14px] leading-relaxed text-[#a3a9b8]">
            Verifies zero answer leakage across Socratic hint tiers, buggy-code detection fidelity,
            and English, Hinglish, and Hindi curriculum parity.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="ease-unslop inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#eef0f5]/[0.1] bg-[#1a1e28] px-4 text-[14px] font-medium text-[#eef0f5] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors duration-150 hover:bg-[#222736] active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 text-[#a3a9b8] ${loading ? "animate-spin" : ""}`}
            strokeWidth={1.5}
          />
          Re-run evals
        </button>
      </div>

      {report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[12px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-5">
              <div className="text-[13px] text-[#7a8296]">Suite verdict</div>
              <div className="mt-2 flex items-center gap-2 text-[24px] font-medium tabular-nums text-[#eef0f5]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    report.suitePassed ? "bg-[#4cc38a]" : "bg-[#e5484d]"
                  }`}
                />
                <span>{report.suitePassed ? "All passed" : "Failed"}</span>
              </div>
              <div className="mt-1 font-mono text-[12px] tabular-nums text-[#7a8296]">
                {report.metrics.totalEvalChecks} automated checks
              </div>
            </div>

            <div className="rounded-[12px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-5">
              <div className="text-[13px] text-[#7a8296]">Spoiler leakage rate</div>
              <div className="mt-2 font-mono text-[28px] font-medium leading-none tabular-nums text-[#4cc38a]">
                {report.metrics.spoilerLeakagePct}%
              </div>
              <div className="mt-2 font-mono text-[12px] text-[#7a8296]">Target 0% across tiers</div>
            </div>

            <div className="rounded-[12px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-5">
              <div className="text-[13px] text-[#7a8296]">Diagnostic catch rate</div>
              <div className="mt-2 font-mono text-[28px] font-medium leading-none tabular-nums text-[#eef0f5]">
                {report.metrics.diagnosticCatchRatePct}%
              </div>
              <div className="mt-2 font-mono text-[12px] text-[#7a8296]">Buggy starter rejection</div>
            </div>

            <div className="rounded-[12px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-5">
              <div className="text-[13px] text-[#7a8296]">Multilingual coverage</div>
              <div className="mt-2 font-mono text-[28px] font-medium leading-none tabular-nums text-[#eef0f5]">
                {report.metrics.multilingualCoveragePct}%
              </div>
              <div className="mt-2 font-mono text-[12px] text-[#7a8296]">EN, Hinglish, Hindi</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[12px] border border-[#eef0f5]/[0.08] bg-[#11141c]">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-[#eef0f5]/[0.08] bg-[#07080d] text-[13px] font-medium text-[#7a8296]">
                <tr>
                  <th className="px-5 py-3">Curriculum lab</th>
                  <th className="px-5 py-3">Anti-spoiler</th>
                  <th className="px-5 py-3">Bug caught</th>
                  <th className="px-5 py-3">Multilingual</th>
                  <th className="px-5 py-3">Transfer test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f5]/[0.06]">
                {report.cases.map((item) => (
                  <tr
                    key={item.topicId}
                    className="ease-unslop transition-colors duration-150 hover:bg-[#1a1e28]/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#eef0f5]">{item.title}</div>
                      <div className="font-mono text-[12px] text-[#7a8296]">{item.topicId}</div>
                    </td>
                    {[
                      item.antiSpoilerPass,
                      item.buggyCodeCaught,
                      item.multilingualReady,
                      item.transferQuestionPresent,
                    ].map((ok, i) => (
                      <td key={i} className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-2 text-[13px] tabular-nums ${
                            ok ? "text-[#a3a9b8]" : "text-[#e5484d]"
                          }`}
                        >
                          {ok ? (
                            <Check className="h-4 w-4 text-[#4cc38a]" strokeWidth={1.5} />
                          ) : (
                            <X className="h-4 w-4 text-[#e5484d]" strokeWidth={1.5} />
                          )}
                          <span>{ok ? "Pass" : "Fail"}</span>
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-[12px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-8 text-center text-[14px] text-[#7a8296]">
          Loading evaluation report
        </div>
      )}
    </div>
  );
};
