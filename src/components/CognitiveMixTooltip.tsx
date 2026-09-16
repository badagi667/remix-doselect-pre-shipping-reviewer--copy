import React, { useState, useRef, useEffect } from "react";
import { Info, Brain, X, Lightbulb, Target, CheckCircle2 } from "lucide-react";
import { CognitiveLevelDistribution } from "../types";
import { cn } from "../lib/utils";
import { normalizeBloomTaxonomy } from "../lib/cognitiveTaxonomy";

interface CognitiveMixTooltipProps {
  cognitiveDistribution?: CognitiveLevelDistribution[];
  totalQuestions?: number;
  className?: string;
}

interface BloomLevelDetail {
  key: string;
  name: string;
  category: "Foundational" | "Application" | "Higher-Order";
  badgeColor: string;
  barColor: string;
  definition: string;
  percentage: number;
  count: number;
}

export const CognitiveMixTooltip: React.FC<CognitiveMixTooltipProps> = ({
  cognitiveDistribution = [],
  totalQuestions = 0,
  className,
}) => {
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
    }, 250);
  };

  const handleClickToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Close on outside click or Escape
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

  // Aggregate and normalize data for all 6 standard Bloom's Taxonomy levels
  const bloomLevels: BloomLevelDetail[] = React.useMemo(() => {
    const normalized = normalizeBloomTaxonomy(cognitiveDistribution, totalQuestions);

    const stylingMap: Record<string, { badgeColor: string; barColor: string }> = {
      Remember: {
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        barColor: "bg-slate-400",
      },
      Understand: {
        badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
        barColor: "bg-sky-400",
      },
      Apply: {
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        barColor: "bg-blue-600",
      },
      Analyze: {
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        barColor: "bg-indigo-600",
      },
      Evaluate: {
        badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
        barColor: "bg-violet-600",
      },
      Create: {
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        barColor: "bg-emerald-600",
      },
    };

    return normalized.map((item) => {
      const styling = stylingMap[item.level] || stylingMap.Apply;
      return {
        key: item.level.toLowerCase(),
        name: item.level,
        category: item.category,
        badgeColor: styling.badgeColor,
        barColor: styling.barColor,
        definition: item.definition,
        percentage: item.percentage,
        count: item.questionCount,
      };
    });
  }, [cognitiveDistribution, totalQuestions]);

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center align-middle", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleClickToggle}
        aria-label="Bloom's Taxonomy details and cognitive breakdown"
        aria-expanded={isOpen}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-client-accent p-0.5",
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
          className="absolute z-50 left-0 sm:-left-6 top-full mt-2 w-80 sm:w-[460px] p-4 rounded-xl bg-white border border-border shadow-2xl text-text-main text-left max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
          style={{ maxWidth: "calc(100vw - 28px)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-border sticky top-0 bg-white/95 backdrop-blur-xs z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-client-accent/10 text-client-accent shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-text-main leading-tight">
                    Bloom&apos;s Taxonomy Framework
                  </h4>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-client-accent border border-blue-100 uppercase">
                    Cognitive Mix
                  </span>
                </div>
                <p className="text-[10px] text-text-muted">
                  Educational classification for assessment depth & candidate separation
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-main p-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section 1: Definition in short */}
          <div className="mt-3 p-3 bg-bg/90 rounded-lg border border-border/70 space-y-2">
            <div className="flex items-start gap-2 text-[11px] leading-relaxed">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-text-main block text-[11px]">
                  What is Bloom&apos;s Taxonomy?
                </span>
                <p className="text-[10.5px] text-text-muted mt-0.5">
                  A hierarchical pedagogical framework that categorizes cognitive learning skills into six progressive tiers—from foundational knowledge retrieval to high-order problem solving and synthesis.
                </p>
              </div>
            </div>

            {/* Section 2: Use Case */}
            <div className="flex items-start gap-2 pt-2 border-t border-border/60 text-[10.5px] leading-relaxed">
              <Target className="w-4 h-4 text-client-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-text-main block text-[11px]">
                  Assessment Review Use Case:
                </span>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Ensures tests evaluate practical competence and technical judgment required on the job rather than simple rote memorization. A healthy ratio of <strong>Apply & Analyze</strong> questions prevents lucky guessing and effectively separates top performers from baseline candidates.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: The 6 Bloom's Levels with Explanations & Question Counts */}
          <div className="mt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-client-accent" />
                6 Cognitive Levels & Given Question Count
              </span>
              {totalQuestions > 0 && (
                <span className="text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded bg-bg text-text-muted border border-border">
                  Total: {totalQuestions} Questions
                </span>
              )}
            </div>

            <div className="space-y-2">
              {bloomLevels.map((lvl) => (
                <div
                  key={lvl.key}
                  className="p-2.5 rounded-lg border border-border/70 bg-white hover:border-client-accent/40 transition-colors space-y-1.5"
                >
                  {/* Title & Count Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-main">
                        {lvl.name}
                      </span>
                      <span
                        className={cn(
                          "text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded border",
                          lvl.badgeColor
                        )}
                      >
                        {lvl.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-extrabold text-client-accent">
                        {lvl.count} {lvl.count === 1 ? "Question" : "Questions"}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-text-muted bg-bg px-1.5 py-0.5 rounded border border-border/60">
                        {lvl.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden border border-border/50">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", lvl.barColor)}
                      style={{ width: `${Math.min(lvl.percentage, 100)}%` }}
                    />
                  </div>

                  {/* Definition / Explanation */}
                  <p className="text-[10px] text-text-muted leading-tight">
                    {lvl.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Footnote */}
          <div className="mt-4 pt-2.5 border-t border-border flex items-center justify-between text-[9px] text-text-muted">
            <span>Doselect Cognitive Audit Engine</span>
            <span className="font-mono text-client-accent">Bloom&apos;s Revised Standard</span>
          </div>
        </div>
      )}
    </div>
  );
};
