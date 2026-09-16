import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { AssessmentAnalysis } from "../types";
import { getDimensionBreakdown } from "../lib/scoreCalculator";
import { cn } from "../lib/utils";

interface ScoreDimensionTooltipProps {
  scores?: AssessmentAnalysis['scores'];
  overallScore?: number;
  size?: "sm" | "md" | "lg";
  align?: "right" | "left" | "center";
  className?: string;
  label?: string;
}

export const ScoreDimensionTooltip: React.FC<ScoreDimensionTooltipProps> = ({
  scores,
  overallScore,
  size = "md",
  align = "right",
  className,
  label = "Score dimension details",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const breakdown = getDimensionBreakdown(scores);
  const displayedScore = typeof overallScore === "number" ? overallScore : breakdown.overallScore;

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
    }, 180);
  };

  const handleClickToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const buttonSizeClasses = {
    sm: "w-4 h-4 text-[10px]",
    md: "w-5 h-5 text-xs",
    lg: "w-6 h-6 text-sm",
  }[size];

  const alignClasses = {
    right: "right-0 left-auto",
    left: "left-0 right-auto",
    center: "left-1/2 -translate-x-1/2",
  }[align];

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 'i' button trigger */}
      <button
        type="button"
        id="score-dimension-info-trigger"
        onClick={handleClickToggle}
        aria-label={label}
        aria-expanded={isOpen}
        title="View Score Dimension Breakdown (Hover to inspect weights)"
        className={cn(
          buttonSizeClasses,
          "rounded-full flex items-center justify-center font-bold transition-all duration-150 cursor-pointer shadow-2xs select-none",
          "border border-border/80 bg-white text-text-muted hover:text-client-accent hover:border-client-accent hover:bg-client-accent/5",
          "focus:outline-none focus:ring-2 focus:ring-client-accent/30 active:scale-95",
          isOpen && "border-client-accent bg-client-accent/10 text-client-accent ring-2 ring-client-accent/20"
        )}
      >
        <span className="font-serif italic font-bold leading-none select-none text-[11px] scale-90">i</span>
      </button>

      {/* Hover / Click Tooltip Overlay */}
      {isOpen && (
        <div
          role="tooltip"
          id="score-dimension-tooltip"
          className={cn(
            "absolute z-50 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white text-text-main rounded-md border border-border/90 shadow-xl p-3.5",
            "transition-all duration-150 animate-in fade-in zoom-in-95 origin-top",
            alignClasses
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border pb-2.5 mb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-client-accent shrink-0" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-main">
                  Score Dimensions
                </h4>
              </div>
              <p className="text-[9px] text-text-muted mt-0.5 leading-tight">
                Evaluated strictly on a <strong>0 to 10 scale</strong> across 6 weighted dimensions.
              </p>
            </div>
            <div className="bg-client-accent/10 border border-client-accent/20 rounded px-1.5 py-0.5 text-right shrink-0">
              <span className="block text-[7px] uppercase font-bold text-text-muted leading-none">Scale</span>
              <span className="text-[10px] font-bold text-client-accent font-mono leading-tight">Max 10.0</span>
            </div>
          </div>

          {/* Dimension Breakdown List */}
          <div className="space-y-2">
            {breakdown.items.map((dim) => (
              <div key={dim.key} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="font-semibold text-text-main text-[11px] whitespace-nowrap">{dim.displayName}</span>
                    <span className="font-mono text-text-muted/70 text-[10px] select-none font-bold">--&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-client-accent text-[11.5px] tracking-tight">
                      {dim.displayRatio}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar proportional to dimension contribution */}
                <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden flex border border-border/40">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      dim.percentageOfMax >= 75
                        ? "bg-success"
                        : dim.percentageOfMax >= 50
                        ? "bg-client-accent"
                        : "bg-warning"
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(5, dim.percentageOfMax))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Summary - Strict Out of 10 Total */}
          <div className="mt-3 pt-2.5 border-t border-border/80 flex items-center justify-between text-[11px] bg-bg/50 -mx-3.5 -mb-3.5 p-2.5 rounded-b-md">
            <div>
              <span className="block text-[8px] uppercase tracking-wider font-bold text-text-muted">
                Overall Composite Score
              </span>
              <span className="text-[9px] text-text-muted font-mono">
                Weighted average of all 6 dimensions
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-client-accent font-mono">
                {displayedScore.toFixed(1)}
              </span>
              <span className="text-[10px] font-bold text-text-muted">/ 10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ScoreDimensionTooltip;
