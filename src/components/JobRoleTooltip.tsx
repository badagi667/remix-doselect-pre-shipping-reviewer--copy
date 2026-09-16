import React, { useState, useRef, useEffect } from "react";
import { Info, Briefcase, CheckCircle2, AlertTriangle, Layers, Brain, X } from "lucide-react";
import { cn } from "../lib/utils";

interface JobRoleTooltipProps {
  className?: string;
}

export const JobRoleTooltip: React.FC<JobRoleTooltipProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleClickToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleDocumentClick);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center shrink-0", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleClickToggle}
        aria-label="Target Job Role guidance and review impact"
        aria-expanded={isOpen}
        className={cn(
          "w-4 h-4 inline-flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-client-accent",
          isOpen
            ? "text-client-accent bg-client-accent/15"
            : "text-text-muted hover:text-client-accent hover:bg-client-accent/10"
        )}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-50 left-0 top-full mt-2 w-80 sm:w-96 p-4 rounded-lg bg-white border border-border shadow-2xl text-text-main text-left animate-in fade-in zoom-in-95 duration-150"
          style={{ maxWidth: "calc(100vw - 32px)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-client-accent/10 text-client-accent">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-main leading-tight">
                  Target Job Role
                </h4>
                <p className="text-[10px] text-text-muted">
                  Why specifying the job role is required
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-main p-0.5 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User instruction */}
          <div className="py-2.5 text-[11px] leading-relaxed text-text-main bg-bg/80 rounded p-2.5 my-2 border border-border/60">
            <span className="font-semibold text-client-accent block mb-0.5">
              What to enter:
            </span>
            Please specify the exact <strong>Target Job Role</strong> or job title being hired for (e.g. <em>Senior Backend Engineer (Python)</em>, <em>Full Stack Developer</em>, <em>Data Analyst</em>, <em>Cloud DevOps Engineer</em>).
          </div>

          {/* Impact on review report */}
          <div className="space-y-2 pt-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Impact on Overall Assessment Review Report:
            </span>

            <div className="space-y-2 text-[10.5px]">
              <div className="flex items-start gap-2">
                <Layers className="w-3.5 h-3.5 text-client-accent shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <strong className="text-text-main font-semibold">Competency Benchmarking:</strong>{" "}
                  <span className="text-text-muted">
                    Evaluates whether topics and questions test the true core technical skills needed for this specific role.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Brain className="w-3.5 h-3.5 text-client-accent shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <strong className="text-text-main font-semibold">Cognitive Depth Calibration:</strong>{" "}
                  <span className="text-text-muted">
                    Checks if the balance of Recall vs. Apply vs. Analyze problems aligns with the role&apos;s daily problem-solving expectations.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <strong className="text-text-main font-semibold">Candidate Differentiation:</strong>{" "}
                  <span className="text-text-muted">
                    Determines how accurately the assessment filters baseline candidates from top-tier talent for this target position.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <strong className="text-text-main font-semibold">Risk & Flagged Items:</strong>{" "}
                  <span className="text-text-muted">
                    Surfaces missing competencies, obsolete questions, or irrelevant sections that could cause misleading hiring outcomes.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[9px] text-text-muted">
            <span>Doselect AI Assessment Reviewer</span>
            <span className="font-mono text-client-accent font-semibold">Impact: Role Calibrated</span>
          </div>
        </div>
      )}
    </div>
  );
};
