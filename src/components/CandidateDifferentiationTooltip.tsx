import React, { useState, useRef, useEffect } from "react";
import { Info, X, Users, Target, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface CandidateDifferentiationTooltipProps {
  className?: string;
  size?: "xs" | "sm" | "md";
  align?: "left" | "right" | "center";
}

export const CandidateDifferentiationTooltip: React.FC<CandidateDifferentiationTooltipProps> = ({
  className,
  size = "sm",
  align = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setIsOpen(prev => !prev);
  };

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

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  const alignmentClasses = {
    right: "right-0 translate-x-1 sm:translate-x-0",
    left: "left-0 -translate-x-1 sm:translate-x-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center align-middle select-none", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        id="candidate-differentiation-tooltip-trigger"
        onClick={handleClickToggle}
        aria-label="What is Candidate Differentiation and how is it used?"
        aria-expanded={isOpen}
        className="p-1 -m-1 text-text-muted hover:text-client-accent transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-client-accent/50 rounded-full inline-flex items-center justify-center cursor-help"
      >
        <Info className={cn(iconSizes[size], "opacity-80 hover:opacity-100")} />
      </button>

      {isOpen && (
        <div
          id="candidate-differentiation-tooltip-popover"
          role="tooltip"
          className={cn(
            "absolute z-50 bottom-full mb-2 w-80 sm:w-96 p-3.5 sm:p-4 rounded border border-border/80 bg-paper/98 text-text-main shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in zoom-in-95 font-sans normal-case tracking-normal",
            alignmentClasses[align]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-client-accent/10 text-client-accent">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                  Candidate Differentiation
                </h4>
                <p className="text-[9px] text-text-muted font-mono tracking-tight">
                  Talent Discrimination & Scoring Reliability
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-text-muted hover:text-text-main p-0.5 rounded transition-colors"
              aria-label="Close tooltip"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 text-[10px] leading-relaxed">
            {/* Intent Section */}
            <div>
              <div className="flex items-center gap-1.5 text-client-accent font-semibold text-[10px] mb-1">
                <Target className="w-3 h-3 shrink-0" />
                <span>What is the Intent?</span>
              </div>
              <p className="text-text-main/90 pl-4 font-normal">
                Measures the assessment's psychological and technical power to <strong>distinguish top-tier talent from average candidates</strong>, rather than clustering all applicants into the same score band.
              </p>
            </div>

            {/* Use Case / Why it matters Section */}
            <div>
              <div className="flex items-center gap-1.5 text-success font-semibold text-[10px] mb-1">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>What is it used for?</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-text-main/85">
                <li>
                  <strong className="font-semibold text-text-main">Prevents Score Bunching:</strong> Tests heavy in basic recall yield artificially high scores (80–90%) for everyone, providing little hiring signal.
                </li>
                <li>
                  <strong className="font-semibold text-text-main">Identifies True Problem Solvers:</strong> Incorporating applied and analytical questions isolates candidates who can think through real-world scenarios.
                </li>
                <li>
                  <strong className="font-semibold text-text-main">Informed Hiring Decisions:</strong> Gives recruiters and hiring teams immediate clarity on whether the test reliably filters unqualified applicants while spotlighting standouts.
                </li>
              </ul>
            </div>

            {/* Tier Legend */}
            <div className="pt-2 border-t border-border/50">
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                Differentiation Ratings
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[9px] font-medium text-center">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="block font-bold">High</span>
                  <span className="text-[8px] opacity-90 block">Sharp separation</span>
                </div>
                <div className="p-1.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="block font-bold">Moderate</span>
                  <span className="text-[8px] opacity-90 block">Balanced screen</span>
                </div>
                <div className="p-1.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                  <span className="block font-bold">Basic</span>
                  <span className="text-[8px] opacity-90 block">Rote recall risk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
