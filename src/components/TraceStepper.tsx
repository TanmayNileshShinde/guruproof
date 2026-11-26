import React, { useEffect, useState } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { VisualTraceStep } from "../types";

interface TraceStepperProps {
  buggyTrace: VisualTraceStep[];
  fixedTrace: VisualTraceStep[];
  showFixedTrace: boolean;
}

export const TraceStepper: React.FC<TraceStepperProps> = ({
  buggyTrace,
  fixedTrace,
  showFixedTrace,
}) => {
  const [viewMode, setViewMode] = useState<"buggy" | "fixed">(showFixedTrace ? "fixed" : "buggy");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setViewMode(showFixedTrace ? "fixed" : "buggy");
    setActiveIndex(0);
  }, [showFixedTrace, buggyTrace]);

  const steps = viewMode === "fixed" ? fixedTrace : buggyTrace;
  const current = steps[activeIndex] || steps[0];

  if (!steps.length || !current) return null;

  return (
    <div className="rounded-[12px] border border-[#eef0f5]/[0.08] bg-[#07080d] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[14px] font-medium text-[#eef0f5]">Memory trace</span>

        <div className="inline-flex items-center rounded-[8px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-0.5 text-[12px]">
          <button
            type="button"
            onClick={() => {
              setViewMode("buggy");
              setActiveIndex(0);
            }}
            className={`ease-unslop rounded-[6px] px-2.5 py-1 transition-colors duration-150 ${
              viewMode === "buggy"
                ? "bg-[#1a1e28] font-medium text-[#eef0f5] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                : "text-[#7a8296] hover:text-[#a3a9b8]"
            }`}
          >
            Buggy state
          </button>
          <button
            type="button"
            disabled={!showFixedTrace}
            onClick={() => {
              setViewMode("fixed");
              setActiveIndex(0);
            }}
            title={
              showFixedTrace ? "Inspect verified execution trace" : "Verify your fix to unlock"
            }
            className={`ease-unslop rounded-[6px] px-2.5 py-1 transition-colors duration-150 ${
              viewMode === "fixed"
                ? "bg-[#1a1e28] font-medium text-[#4cc38a] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                : showFixedTrace
                  ? "text-[#7a8296] hover:text-[#a3a9b8]"
                  : "cursor-not-allowed text-[#7a8296]/40"
            }`}
          >
            Verified state
          </button>
        </div>
      </div>

      {/* Stepper frame tabs */}
      <div className="mb-3 grid grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          const selected = idx === activeIndex;
          return (
            <button
              key={`${viewMode}-${step.step}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`ease-unslop flex h-8 items-center justify-between rounded-[6px] border px-2.5 font-mono text-[12px] tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38bdf8] ${
                selected
                  ? step.isError
                    ? "border-[#e5484d]/50 bg-[#e5484d]/[0.1] text-[#eef0f5]"
                    : "border-[#38bdf8]/50 bg-[#1a1e28] text-[#eef0f5]"
                  : "border-[#eef0f5]/[0.08] bg-[#11141c] text-[#7a8296] hover:text-[#a3a9b8]"
              }`}
            >
              <span>Step {step.step}</span>
              {step.isError && <span className="h-1.5 w-1.5 rounded-full bg-[#e5484d]" />}
            </button>
          );
        })}
      </div>

      {/* Active trace state panel */}
      <div className="rounded-[8px] border border-[#eef0f5]/[0.08] bg-[#11141c] p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[13px] font-medium">
            {current.isError ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-[#e5484d]" strokeWidth={1.5} />
            ) : (
              <Check
                className={`h-4 w-4 shrink-0 ${
                  viewMode === "fixed" ? "text-[#4cc38a]" : "text-[#a3a9b8]"
                }`}
                strokeWidth={1.5}
              />
            )}
            <span className={current.isError ? "text-[#e5484d]" : "text-[#eef0f5]"}>
              {current.label}
            </span>
          </div>
          <span className="font-mono text-[12px] tabular-nums text-[#7a8296]">
            {activeIndex + 1} / {steps.length}
          </span>
        </div>

        <pre className="overflow-x-auto whitespace-pre-wrap rounded-[6px] border border-[#eef0f5]/[0.06] bg-[#07080d] p-3 font-mono text-[12px] leading-relaxed text-[#eef0f5]">
          {current.state}
        </pre>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            className="ease-unslop inline-flex h-8 items-center gap-1 rounded-[6px] border border-[#eef0f5]/[0.08] bg-[#1a1e28] px-2.5 text-[12px] text-[#a3a9b8] transition-colors duration-150 hover:text-[#eef0f5] active:scale-[0.98] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            Prev
          </button>
          <button
            type="button"
            disabled={activeIndex >= steps.length - 1}
            onClick={() => setActiveIndex((i) => Math.min(steps.length - 1, i + 1))}
            className="ease-unslop inline-flex h-8 items-center gap-1 rounded-[6px] border border-[#eef0f5]/[0.08] bg-[#1a1e28] px-2.5 text-[12px] text-[#a3a9b8] transition-colors duration-150 hover:text-[#eef0f5] active:scale-[0.98] disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
