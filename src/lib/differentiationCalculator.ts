import { CognitiveLevelDistribution } from "../types";

export type DifferentiationTier = "Basic" | "Moderate" | "High";

export interface DifferentiationResult {
  tier: DifferentiationTier;
  title: string;
  reason: string;
  cognitiveDetails: {
    recallUnderstandPct: number;
    applyPct: number;
    higherCognitivePct: number;
  };
  mixSummary: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    accentBg: string;
    dot: string;
  };
}

/**
 * Evaluates candidate differentiation tier based strictly on question cognitive distribution:
 * - Basic (Red): More Recall + Understand with zero or very few Apply/Analyze
 * - Moderate (Yellow): More Apply + some Recall + some Understand
 * - High (Green): More Apply + some Analyze + some Recall and Understand
 */
export function evaluateCandidateDifferentiation(
  cognitiveDistribution?: CognitiveLevelDistribution[]
): DifferentiationResult {
  if (!cognitiveDistribution || cognitiveDistribution.length === 0) {
    return {
      tier: "Moderate",
      title: "Moderate",
      reason: "More Apply questions with balanced Recall and Understand foundational support.",
      cognitiveDetails: {
        recallUnderstandPct: 40,
        applyPct: 45,
        higherCognitivePct: 15,
      },
      mixSummary: "Recall & Understand: 40% • Apply: 45% • Analyze & Higher: 15%",
      color: {
        bg: "bg-amber-50/90",
        text: "text-amber-950",
        border: "border-amber-300",
        badgeBg: "bg-amber-500",
        badgeText: "text-neutral-900",
        badgeBorder: "border-amber-600",
        accentBg: "bg-amber-100",
        dot: "bg-amber-500",
      },
    };
  }

  let recall = 0;
  let understand = 0;
  let apply = 0;
  let analyze = 0;
  let evaluate = 0;

  cognitiveDistribution.forEach((cd) => {
    const lvl = (cd.level || "").toLowerCase().trim();
    const pct = typeof cd.percentage === "number" && !isNaN(cd.percentage) ? cd.percentage : 0;

    if (lvl.includes("recall") || lvl.includes("remember") || lvl.includes("knowledge")) {
      recall += pct;
    } else if (lvl.includes("understand") || lvl.includes("comprehen")) {
      understand += pct;
    } else if (lvl.includes("apply") || lvl.includes("application")) {
      apply += pct;
    } else if (lvl.includes("analy") || lvl.includes("analytical")) {
      analyze += pct;
    } else if (lvl.includes("evaluat") || lvl.includes("decide") || lvl.includes("create")) {
      evaluate += pct;
    } else {
      // Treat generic medium/scenario as apply, others split
      if (lvl.includes("scenario") || lvl.includes("problem")) {
        apply += pct;
      } else {
        understand += pct;
      }
    }
  });

  const recallUnderstand = Math.round(recall + understand);
  const applyRounded = Math.round(apply);
  const higherCognitive = Math.round(analyze + evaluate);

  let tier: DifferentiationTier = "Moderate";
  let reason = "";

  // 1. Basic: More Recall + Understand with zero or very few apply/analyze
  // (e.g. recall + understand >= 55%, or apply + higherCognitive <= 25%)
  if (recallUnderstand >= 55 || (applyRounded + higherCognitive) <= 20 || (recallUnderstand > (applyRounded + higherCognitive) && higherCognitive <= 10)) {
    tier = "Basic";
    reason = "More Recall + Understand questions with zero or very few Apply/Analyze questions.";
  }
  // 2. High: More Apply + some Analyze + some Recall and Understand
  // (e.g. apply >= 30%, analyze/higher >= 15%, recallUnderstand >= 10%)
  else if ((applyRounded >= 30 && higherCognitive >= 15 && recallUnderstand >= 10) || (higherCognitive >= 20 && applyRounded >= 25)) {
    tier = "High";
    reason = "More Apply questions with significant Analyze/Evaluate depth and foundational Recall/Understand coverage.";
  }
  // 3. Moderate: More Apply + some Recall + some Understand (with limited/moderate analyze)
  else {
    tier = "Moderate";
    reason = "More Apply questions supported by steady Recall and Understand foundational questions.";
  }

  const mixSummary = `Recall & Understand: ${recallUnderstand}% • Apply: ${applyRounded}% • Analyze/Evaluate: ${higherCognitive}%`;

  const colorMap = {
    Basic: {
      bg: "bg-red-50",
      text: "text-red-950",
      border: "border-red-300",
      badgeBg: "bg-red-600",
      badgeText: "text-white",
      badgeBorder: "border-red-700",
      accentBg: "bg-red-100",
      dot: "bg-red-600",
    },
    Moderate: {
      bg: "bg-amber-50",
      text: "text-amber-950",
      border: "border-amber-300",
      badgeBg: "bg-amber-500",
      badgeText: "text-neutral-900",
      badgeBorder: "border-amber-600",
      accentBg: "bg-amber-100",
      dot: "bg-amber-500",
    },
    High: {
      bg: "bg-emerald-50",
      text: "text-emerald-950",
      border: "border-emerald-300",
      badgeBg: "bg-emerald-600",
      badgeText: "text-white",
      badgeBorder: "border-emerald-700",
      accentBg: "bg-emerald-100",
      dot: "bg-emerald-600",
    },
  };

  return {
    tier,
    title: tier,
    reason,
    cognitiveDetails: {
      recallUnderstandPct: recallUnderstand,
      applyPct: applyRounded,
      higherCognitivePct: higherCognitive,
    },
    mixSummary,
    color: colorMap[tier],
  };
}
