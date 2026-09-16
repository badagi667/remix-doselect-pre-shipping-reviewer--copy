import { CognitiveLevelDistribution } from "../types";

export interface NormalizedBloomLevel {
  level: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
  category: "Foundational" | "Application" | "Higher-Order";
  percentage: number;
  questionCount: number;
  definition: string;
}

export const BLOOM_DEFINITIONS: Record<
  NormalizedBloomLevel["level"],
  { category: NormalizedBloomLevel["category"]; definition: string }
> = {
  Remember: {
    category: "Foundational",
    definition: "Retrieving facts, syntax, formulas, and terminology from memory without altering context.",
  },
  Understand: {
    category: "Foundational",
    definition: "Explaining principles, interpreting mechanics, translating formats, and summarizing workflow behavior.",
  },
  Apply: {
    category: "Application",
    definition: "Executing rules, algorithms, and solving practical code or domain scenarios.",
  },
  Analyze: {
    category: "Higher-Order",
    definition: "Deconstructing systems, identifying component relationships, diagnosing bugs, and root-cause analysis.",
  },
  Evaluate: {
    category: "Higher-Order",
    definition: "Assessing trade-offs, critiquing code efficiency/security, and validating optimal technical choices.",
  },
  Create: {
    category: "Higher-Order",
    definition: "Designing novel architectures, assembling patterns, and generating new solutions or system schemas.",
  },
};

export const CANONICAL_BLOOM_LEVELS: NormalizedBloomLevel["level"][] = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];

/**
 * Normalizes any cognitive distribution array into all 6 canonical Bloom's Taxonomy levels.
 * Guarantees all 6 levels are always present in canonical order, even if 0%.
 * Automatically resolves merged labels like "Remember/Understand", calculates balanced
 * question counts summing to totalQuestions, and prevents rounding discrepancies.
 */
export function normalizeBloomTaxonomy(
  cognitiveDistribution?: CognitiveLevelDistribution[],
  totalQuestions: number = 0
): NormalizedBloomLevel[] {
  const pcts: Record<NormalizedBloomLevel["level"], number> = {
    Remember: 0,
    Understand: 0,
    Apply: 0,
    Analyze: 0,
    Evaluate: 0,
    Create: 0,
  };

  if (Array.isArray(cognitiveDistribution) && cognitiveDistribution.length > 0) {
    cognitiveDistribution.forEach((cd) => {
      if (!cd) return;
      const rawLevel = String(cd.level || "").toLowerCase().trim();
      const pct = typeof cd.percentage === "number" && !isNaN(cd.percentage) ? cd.percentage : 0;

      // Handle combined label "Remember/Understand" or "Recall/Comprehension"
      if (
        (rawLevel.includes("remember") || rawLevel.includes("recall")) &&
        (rawLevel.includes("understand") || rawLevel.includes("comprehen"))
      ) {
        pcts.Remember += Math.round(pct / 2);
        pcts.Understand += Math.round(pct / 2);
      } else if (
        rawLevel.includes("remember") ||
        rawLevel.includes("recall") ||
        rawLevel.includes("knowledg") ||
        rawLevel.includes("memory")
      ) {
        pcts.Remember += pct;
      } else if (
        rawLevel.includes("understand") ||
        rawLevel.includes("comprehen") ||
        rawLevel.includes("interpre") ||
        rawLevel.includes("concept")
      ) {
        pcts.Understand += pct;
      } else if (
        rawLevel.includes("apply") ||
        rawLevel.includes("application") ||
        rawLevel.includes("execut") ||
        rawLevel.includes("procedur")
      ) {
        pcts.Apply += pct;
      } else if (
        rawLevel.includes("analy") ||
        rawLevel.includes("debug") ||
        rawLevel.includes("troubleshoot") ||
        rawLevel.includes("decompos")
      ) {
        pcts.Analyze += pct;
      } else if (
        rawLevel.includes("evaluat") ||
        rawLevel.includes("critiq") ||
        rawLevel.includes("judg") ||
        rawLevel.includes("assess")
      ) {
        pcts.Evaluate += pct;
      } else if (
        rawLevel.includes("creat") ||
        rawLevel.includes("synthes") ||
        rawLevel.includes("design") ||
        rawLevel.includes("architect")
      ) {
        pcts.Create += pct;
      } else {
        // Fallback unclassified level to Apply
        pcts.Apply += pct;
      }
    });
  }

  // Calculate question counts using largest remainder method to ensure total sum matches totalQuestions exactly
  const totalQ = totalQuestions > 0 ? totalQuestions : 0;
  const rawCounts = CANONICAL_BLOOM_LEVELS.map((level) => {
    const p = pcts[level] || 0;
    const exact = totalQ > 0 ? (p / 100) * totalQ : 0;
    return {
      level,
      percentage: p,
      floor: Math.floor(exact),
      rem: exact - Math.floor(exact),
    };
  });

  const currentFloorSum = rawCounts.reduce((acc, c) => acc + c.floor, 0);
  let remainingQuestions = totalQ - currentFloorSum;

  const sortedByRem = [...rawCounts].sort((a, b) => b.rem - a.rem);
  const finalCounts: Record<NormalizedBloomLevel["level"], number> = {
    Remember: 0,
    Understand: 0,
    Apply: 0,
    Analyze: 0,
    Evaluate: 0,
    Create: 0,
  };

  rawCounts.forEach((r) => {
    finalCounts[r.level] = r.floor;
  });

  for (let i = 0; i < sortedByRem.length && remainingQuestions > 0; i++) {
    if (sortedByRem[i].percentage > 0 || totalQ === 0) {
      finalCounts[sortedByRem[i].level] += 1;
      remainingQuestions--;
    }
  }

  return CANONICAL_BLOOM_LEVELS.map((level) => ({
    level,
    category: BLOOM_DEFINITIONS[level].category,
    definition: BLOOM_DEFINITIONS[level].definition,
    percentage: Math.round(pcts[level] || 0),
    questionCount: finalCounts[level] || 0,
  }));
}
