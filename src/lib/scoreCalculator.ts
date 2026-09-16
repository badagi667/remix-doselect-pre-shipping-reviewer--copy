import { AssessmentAnalysis } from "../types";

export interface DimensionConfig {
  key: keyof AssessmentAnalysis['scores'];
  name: string;
  weightPercentage: number;
  displayName: string;
}

export const DIMENSION_CONFIGS: DimensionConfig[] = [
  { key: "quality", name: "Quality", weightPercentage: 25, displayName: "Quality(25%)" },
  { key: "competencyCoverage", name: "Competency Coverage", weightPercentage: 25, displayName: "Competency Coverage(25%)" },
  { key: "readiness", name: "Readiness", weightPercentage: 20, displayName: "Readiness(20%)" },
  { key: "differentiation", name: "Differentiation", weightPercentage: 10, displayName: "Differentiation(10%)" },
  { key: "diversification", name: "Diversification", weightPercentage: 10, displayName: "Diversification(10%)" },
  { key: "sectionBalance", name: "Section Balance", weightPercentage: 10, displayName: "Section Balance(10%)" },
];

export interface DimensionBreakdownItem {
  key: string;
  name: string;
  displayName: string;
  weightPercentage: number;
  rawScore: number; // Score out of 10 (e.g. 9.0)
  displayRatio: string; // e.g. "9.0/10"
  percentageOfMax: number; // 0 - 100 for visual progress bar
  weightedContribution: number; // e.g. 9.0 * 0.25 = 2.25
}

export interface ScoreBreakdownResult {
  items: DimensionBreakdownItem[];
  overallScore: number; // Weighted average out of 10
  displayOverallScore: string; // e.g. "9.0/10"
}

export function normalizeScoreValue(val: number | undefined | null): number {
  if (typeof val !== "number" || isNaN(val)) return 7.0;
  // If provided on a 0-100 scale, normalize to 0-10
  if (val > 10) {
    return Math.min(10, Math.max(0, val / 10));
  }
  return Math.min(10, Math.max(0, val));
}

export function calculateOverallScore(scores: AssessmentAnalysis['scores'] | undefined): number {
  if (!scores) return 7.0;
  const breakdown = getDimensionBreakdown(scores);
  return breakdown.overallScore;
}

export function getDimensionBreakdown(scores: AssessmentAnalysis['scores'] | undefined): ScoreBreakdownResult {
  const safeScores = scores || {
    quality: 7.0,
    competencyCoverage: 7.0,
    readiness: 7.0,
    differentiation: 7.0,
    diversification: 7.0,
    sectionBalance: 7.0,
  };

  let totalWeightedScore = 0;

  const items: DimensionBreakdownItem[] = DIMENSION_CONFIGS.map((config) => {
    const rawScore = normalizeScoreValue(safeScores[config.key as keyof typeof safeScores]); // 0 to 10
    const weightedContribution = rawScore * (config.weightPercentage / 100);
    totalWeightedScore += weightedContribution;

    return {
      key: config.key,
      name: config.name,
      displayName: config.displayName,
      weightPercentage: config.weightPercentage,
      rawScore,
      displayRatio: `${rawScore.toFixed(1)}/10`,
      percentageOfMax: Math.min(100, Math.max(0, rawScore * 10)),
      weightedContribution,
    };
  });

  const overallScore = Math.min(10, Math.max(0, Math.round(totalWeightedScore * 10) / 10));

  return {
    items,
    overallScore,
    displayOverallScore: `${overallScore.toFixed(1)}/10`,
  };
}
