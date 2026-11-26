import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Cpu } from "lucide-react";
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
    <div className="rounded-xl border border-slate-800 bg-[#0b111c] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-sky-400" />
          <h4 className="text-sm font-semibold text-slate-100">Visual Memory Trace</h4>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setViewMode("buggy");
              setActiveIndex(0);
            }}
            className={`rounded-md px-2.5 py-1 font-medium transition ${
              viewMode === "buggy"
                ? "bg-rose-500/20 text-rose-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Buggy State
          </button>
          <button
            type="button"
            disabled={!showFixedTrace}
            onClick={() => {
              setViewMode("fixed");
              setActiveIndex(0);
            }}
            className={`rounded-md px-2.5 py-1 font-medium transition ${
              viewMode === "fixed"
                ? "bg-emerald-500/20 text-emerald-300"
                : showFixedTrace
                  ? "text-slate-400 hover:text-slate-200"
                  : "cursor-not-allowed text-slate-600"
            }`}
            title={showFixedTrace ? "Inspect verified execution trace" : "Verify your fix to unlock Fixed Trace"}
          >
            Verified State
          </button>
        </div>
      </div>

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const selected = idx === activeIndex;
          return (
            <button
              key={`${viewMode}-${step.step}`}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                selected
                  ? step.isError
                    ? "border-rose-500/60 bg-rose-500/15 text-rose-200"
                    : "border-sky-500/60 bg-sky-500/15 text-sky-100"
                  : step.isError
                    ? "border-rose-500/25 bg-slate-900/70 text-rose-300/80 hover:border-rose-500/40"
                    : "border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="font-mono font-semibold">Step {step.step}</span>
            </button>
          );
        })}
      </div>

      <div
        className={`rounded-lg border p-3.5 ${
          current.isError
            ? "border-rose-500/40 bg-rose-950/20"
            : viewMode === "fixed"
              ? "border-emerald-500/35 bg-emerald-950/15"
              : "border-slate-800 bg-slate-900/80"
        }`}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {current.isError ? (
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            ) : (
              <CheckCircle2
                className={`h-4 w-4 ${viewMode === "fixed" ? "text-emerald-400" : "text-sky-400"}`}
              />
            )}
            <span className={current.isError ? "text-rose-300" : "text-slate-200"}>
              {current.label}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            {activeIndex + 1} / {steps.length}
          </span>
        </div>

        <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-[#070b12] p-2.5 font-mono text-xs leading-relaxed text-slate-200">
          {current.state}
        </pre>

        <div className="mt-2.5 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <button
            type="button"
            disabled={activeIndex >= steps.length - 1}
            onClick={() => setActiveIndex((i) => Math.min(steps.length - 1, i + 1))}
            className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
