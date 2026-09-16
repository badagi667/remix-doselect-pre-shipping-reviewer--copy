import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Brain, 
  Layers, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  FileSpreadsheet, 
  Activity,
  Cpu
} from "lucide-react";
import { cn } from "../lib/utils";

interface AssessmentReviewLoaderProps {
  jobRole?: string;
  questionCount?: number;
}

interface AuditStep {
  id: string;
  title: string;
  description: string;
  metricLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AUDIT_STEPS: AuditStep[] = [
  {
    id: "ingest",
    title: "Ingesting & Validating Schema",
    description: "Verifying question formats, option structures, and section categorizations...",
    metricLabel: "Schema Integrity: Verified",
    icon: FileSpreadsheet,
  },
  {
    id: "cognitive",
    title: "Cognitive Taxonomy Decomposition",
    description: "Evaluating Bloom's Taxonomy levels across Recall, Understand, Apply, and Analyze...",
    metricLabel: "Taxonomy Distribution: Computing",
    icon: Brain,
  },
  {
    id: "competency",
    title: "Target Job Role Benchmarking",
    description: "Cross-referencing technical skills against industry standards for the specified role...",
    metricLabel: "Competency Alignment: Correlating",
    icon: Layers,
  },
  {
    id: "differentiation",
    title: "Candidate Differentiation Calibration",
    description: "Simulating discrimination thresholds to evaluate Basic, Moderate, and High candidate separation...",
    metricLabel: "Discrimination Curve: Simulating",
    icon: TrendingUp,
  },
  {
    id: "vulnerability",
    title: "Vulnerability & Risk Flagging",
    description: "Scanning for ambiguous stems, obsolete technologies, and misleading answer distractors...",
    metricLabel: "Quality Flags: Auditing",
    icon: ShieldAlert,
  },
  {
    id: "synthesis",
    title: "Synthesizing Dual Audit Reports",
    description: "Compiling candid Internal Diagnostic actions and polished Client Shipping Evaluation...",
    metricLabel: "Final Verdict: Assembling",
    icon: Sparkles,
  },
];

export const AssessmentReviewLoader: React.FC<AssessmentReviewLoaderProps> = ({
  jobRole = "Target Job Role",
  questionCount,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(12);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Progressive step cycle timer
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < AUDIT_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    return () => clearInterval(stepInterval);
  }, []);

  // Smooth realistic progress bar movement
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Target progress based on step index, asymptotic to 96%
        const target = Math.min(18 + currentStepIndex * 15 + Math.random() * 5, 96);
        if (prev < target) {
          return Math.min(prev + 1.2, 96);
        }
        return prev;
      });
    }, 120);

    return () => clearInterval(progressInterval);
  }, [currentStepIndex]);

  // Live telemetry ticker rotation
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % 5);
    }, 1800);
    return () => clearInterval(tickerInterval);
  }, []);

  const activeStep = AUDIT_STEPS[currentStepIndex];
  const ActiveIcon = activeStep.icon;

  const telemetryLines = [
    `[TARGET ROLE: ${jobRole.toUpperCase()}] • [AI MODEL: GEMINI AUDITOR v2.5]`,
    `[TAXONOMY ENGINE: DECOMPOSING BLOOM LEVELS] • [QUESTIONS: ${questionCount || "VERIFIED"}]`,
    `[CANDIDATE DIFFERENTIATION: CALIBRATING DISCRIMINATION CURVE]`,
    `[VULNERABILITY SCAN: AUDITING DISTRACTORS & OBSOLETE SYNTAX]`,
    `[REPORT SYNTHESIS: GENERATING DUAL CLIENT + INTERNAL DIAGNOSTICS]`,
  ];

  return (
    <div className="max-w-3xl mx-auto my-6 p-6 sm:p-8 bg-white border border-border rounded-xl shadow-xl space-y-6 text-text-main animate-in fade-in zoom-in-95 duration-200">
      {/* Top Banner with Trend Pulse Radar */}
      <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-border">
        {/* Animated Radar Visual */}
        <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
          {/* Glowing pulse rings */}
          <div className="absolute inset-0 rounded-full bg-client-accent/15 animate-ping opacity-60" />
          <div className="absolute inset-1 rounded-full bg-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-client-accent/40 animate-[spin_10s_linear_infinite]" />
          
          {/* Center core */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-client-accent via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-client-accent/30">
            <ActiveIcon className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Header Text & Active Stage */}
        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-client-accent/10 text-client-accent border border-client-accent/20">
              <Activity className="w-3 h-3 animate-spin" />
              Live Diagnostic Audit
            </span>
            <span className="text-[10px] font-mono text-text-muted font-bold">
              Step {currentStepIndex + 1} of {AUDIT_STEPS.length}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-main">
            {activeStep.title}
          </h2>

          <p className="text-xs text-text-muted leading-relaxed max-w-xl">
            {activeStep.description}
          </p>
        </div>

        {/* Dynamic Metric / Percent Dial */}
        <div className="shrink-0 text-center sm:text-right bg-bg border border-border/80 px-4 py-2.5 rounded-lg">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-text-muted">
            Audit Progress
          </span>
          <span className="text-2xl font-black font-mono text-client-accent">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Modern Gradient Progress Bar with Shimmer */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono font-medium text-text-muted">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-client-accent" />
            <span>Target Role: <strong className="text-text-main">{jobRole}</strong></span>
          </span>
          <span className="text-client-accent font-bold">{activeStep.metricLabel}</span>
        </div>

        <div className="relative w-full h-2.5 bg-bg border border-border/70 rounded-full overflow-hidden">
          {/* Animated gradient bar */}
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-300 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer beam effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Step Stepper List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
        {AUDIT_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300 text-left",
                isCurrent
                  ? "bg-client-accent/5 border-client-accent shadow-xs scale-[1.01]"
                  : isCompleted
                  ? "bg-emerald-50/50 border-emerald-200 opacity-90"
                  : "bg-bg/40 border-border/60 opacity-45"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all",
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-client-accent text-white shadow-[0_0_10px_rgba(26,115,232,0.4)]"
                    : "bg-border/60 text-text-muted"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <StepIcon className={cn("w-3.5 h-3.5", isCurrent && "animate-pulse")} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-[11px] font-bold truncate leading-tight",
                    isCurrent
                      ? "text-client-accent"
                      : isCompleted
                      ? "text-emerald-900"
                      : "text-text-muted"
                  )}
                >
                  {step.title}
                </span>
                <span className="block text-[9px] text-text-muted truncate">
                  {isCompleted
                    ? "Completed"
                    : isCurrent
                    ? "In progress..."
                    : "Queued"}
                </span>
              </div>

              {isCurrent && (
                <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded bg-client-accent/10 border border-client-accent/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-client-accent animate-ping" />
                  <span className="text-[9px] font-mono font-bold text-client-accent uppercase">
                    Active
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trend Telemetry Stream / Terminal Ticker */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-text-muted bg-bg/80 p-2.5 rounded-lg border">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
          <span className="text-text-main font-semibold truncate">
            {telemetryLines[tickerIndex]}
          </span>
        </div>

        {/* Animated computing bars */}
        <div className="flex items-end gap-1 shrink-0 ml-2">
          <div className="w-1 bg-client-accent h-3 animate-[pulse_0.6s_ease-in-out_infinite]" />
          <div className="w-1 bg-client-accent h-4 animate-[pulse_0.8s_ease-in-out_infinite]" />
          <div className="w-1 bg-client-accent h-2 animate-[pulse_0.5s_ease-in-out_infinite]" />
          <div className="w-1 bg-client-accent h-5 animate-[pulse_0.9s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};
