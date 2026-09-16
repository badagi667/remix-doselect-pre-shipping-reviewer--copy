import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AssessmentAnalysis } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses an executive summary text block into clean, scannable bullet points
 * on individual lines preserving all factual context.
 */
export function formatSummaryBullets(summary?: string): string[] {
  if (!summary || !summary.trim()) return [];

  let text = summary.trim();

  // Normalize inline bullet dividers (e.g. " • " or " - " or numbered " 1. ") to line breaks
  text = text.replace(/(?:^|\s+)[•\*\-–—]\s+/g, "\n");
  text = text.replace(/(?:^|\s+)\d+[\.\)]\s+/g, "\n");

  // Split on newlines
  let lines = text
    .split(/\r?\n+/)
    .map(line => line.trim())
    .map(line => line.replace(/^[\s•\-\*–—\d\.\)\:]+\s*/, "").trim())
    .filter(line => line.length > 0);

  // If text was a single solid block without bullet markers, split into sentences
  if (lines.length <= 1) {
    const single = lines[0] || text;
    const sentences = single
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])/g)
      .map(s => s.trim().replace(/^[\s•\-\*–—\d\.\)\:]+\s*/, "").trim())
      .filter(s => s.length > 5);

    if (sentences.length > 1) {
      lines = sentences;
    }
  }

  return lines.length > 0 ? lines : [text];
}

/**
 * Retrieves internal-focused executive summary bullet points emphasizing risks,
 * flagged items, cognitive/difficulty balance, and diagnostic feedback.
 */
export function getInternalSummaryBullets(analysis: AssessmentAnalysis): string[] {
  if (analysis.internalExecutiveSummary && analysis.internalExecutiveSummary.trim()) {
    // If distinct from client summary or explicitly set
    if (!analysis.clientExecutiveSummary || analysis.internalExecutiveSummary !== analysis.clientExecutiveSummary) {
      return formatSummaryBullets(analysis.internalExecutiveSummary);
    }
  }

  // Synthesize tailored internal diagnostic bullets if identical or legacy
  const bullets: string[] = [];

  // 1. Risk Summary bullet
  if (analysis.riskSummary && analysis.riskSummary.length > 0) {
    bullets.push(`Risk Evaluation: ${analysis.riskSummary.slice(0, 2).join(" ")}`);
  } else {
    bullets.push("Risk Evaluation: No critical systemic test delivery risks detected.");
  }

  // 2. Flagged Items bullet
  if (analysis.flaggedQuestions && analysis.flaggedQuestions.length > 0) {
    const topFlag = analysis.flaggedQuestions[0];
    bullets.push(
      `Flagged Items: ${analysis.flaggedQuestions.length} question(s) flagged for revision (e.g., "${topFlag.questionName || 'Question'}": ${topFlag.issueLabel}).`
    );
  } else {
    bullets.push("Flagged Items: All test items meet quality standards with no critical defect flags.");
  }

  // 3. Cognitive & Section Balance feedback
  if (analysis.compositionSummary?.cognitiveMix || analysis.compositionSummary?.difficultyBalance) {
    bullets.push(
      `Composition Diagnostics: ${analysis.compositionSummary.cognitiveMix || 'Taxonomy mix is aligned'}. ${analysis.compositionSummary.difficultyBalance || ''}`.trim()
    );
  }

  // 4. Overall Audit Readiness & Priority Action
  const topAction = analysis.actionPriorities?.[0] ? ` Priority action: ${analysis.actionPriorities[0]}` : "";
  bullets.push(`Audit Verdict: ${analysis.finalRecommendation}.${topAction}`);

  return bullets;
}

/**
 * Retrieves client-facing executive summary bullet points framed in a positive,
 * consultative tone highlighting curriculum alignment, comprehensive coverage,
 * candidate differentiation, and assessment readiness.
 */
export function getClientSummaryBullets(analysis: AssessmentAnalysis): string[] {
  if (analysis.clientExecutiveSummary && analysis.clientExecutiveSummary.trim()) {
    // If distinct from internal summary or explicitly set
    if (!analysis.internalExecutiveSummary || analysis.clientExecutiveSummary !== analysis.internalExecutiveSummary) {
      return formatSummaryBullets(analysis.clientExecutiveSummary);
    }
  }

  // Synthesize tailored positive client-facing bullets if identical or legacy
  const bullets: string[] = [];

  // 1. Role Alignment
  bullets.push(
    `Curriculum & Role Alignment: Thoughtfully constructed to reflect genuine technical and cognitive prerequisites for ${analysis.testSnapshot.testName}.`
  );

  // 2. Comprehensive Coverage
  const skillCount = analysis.skillMetrics?.length || 0;
  bullets.push(
    `Comprehensive Coverage: Evaluates ${skillCount > 0 ? `${skillCount} core competency domains` : "key functional competencies"} with balanced cognitive progression.`
  );

  // 3. Candidate Differentiation
  const diffTier = (analysis as any).candidateDifferentiation?.tier || "Standard";
  bullets.push(
    `Candidate Differentiation: Calibrated to effectively differentiate top-tier performers from average candidates through applied problem-solving.`
  );

  // 4. Assessment Readiness & Quality
  bullets.push(
    `Hiring Confidence: The assessment provides an objective, structured benchmark to streamline evaluation and support sound hiring decisions.`
  );

  return bullets;
}

/**
 * Normalizes verdict/shipping recommendation to clean Camel/Title case.
 * Examples: "Ready to Ship", "Ready with Minor Revisions", "Needs Revision Before Shipping"
 */
export function formatVerdictTitle(verdict?: string): string {
  if (!verdict) return "Ready to Ship";
  const str = verdict.trim();
  const lower = str.toLowerCase();

  if (lower.includes("ready to ship") || (lower.includes("ready") && !lower.includes("revision"))) {
    return "Ready to Ship";
  }
  if (lower.includes("minor revision") || lower.includes("ready with")) {
    return "Ready with Minor Revisions";
  }
  if (lower.includes("needs revision") || lower.includes("revision before") || lower.includes("major")) {
    return "Needs Revision Before Shipping";
  }

  // Fallback: title-case words
  return str
    .split(/\s+/)
    .map(word => {
      const w = word.toLowerCase();
      if (["to", "with", "before", "in", "for", "and", "or", "of"].includes(w)) {
        return w;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

