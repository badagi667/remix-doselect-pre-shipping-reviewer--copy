import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AssessmentAnalysis } from "../types";
import { calculateOverallScore } from "./scoreCalculator";
import { evaluateCandidateDifferentiation } from "./differentiationCalculator";
import { formatSummaryBullets, getInternalSummaryBullets, getClientSummaryBullets } from "./utils";
import { normalizeBloomTaxonomy } from "./cognitiveTaxonomy";

export { calculateOverallScore };

const COLORS: Record<string, [number, number, number]> = {
  primary: [20, 20, 20], // Dark
  accent: [66, 133, 244], // Google/Doselect blue
  bg: [245, 245, 245],
  text: [50, 50, 50],
  danger: [214, 48, 49],
  success: [39, 174, 96],
  warning: [243, 156, 18]
};


function addHeader(doc: jsPDF, title: string, version: string, testName: string, overallScore: number) {
  // Border
  doc.setDrawColor(230, 230, 230);
  doc.rect(5, 5, 200, 287);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(title, 15, 18);
  
  doc.setFontSize(10);
  doc.text(`Job Role: ${testName}`, 15, 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Type: ${version}`, 15, 30);

  // Overall Score Hero Circle/Box
  const scoreX = 170;
  const scoreY = 12;
  doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2], 0.05);
  doc.roundedRect(scoreX, scoreY, 25, 22, 2, 2, "FD");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.text("OVERALL SCORE", scoreX + 3.5, scoreY + 5);
  
  doc.setFontSize(14);
  doc.text(`${overallScore.toFixed(1)}/10`, scoreX + 5, scoreY + 14);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 35, 195, 35);
}

function buildInternalDoc(analysis: AssessmentAnalysis): jsPDF {
  const doc = new jsPDF();
  const testName = analysis.testSnapshot.testName;
  const overallScore = calculateOverallScore(analysis.scores);
  
  addHeader(doc, "Doselect Assessment Quality Audit", "INTERNAL DIAGNOSTIC REPORT", testName, overallScore);

  let y = 42;

  // 1. Snapshot Components
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("1. AUDIT SNAPSHOT", 15, y);
  y += 4;
  
  const snapshotData = [
    ["Structure", `${analysis.testSnapshot.totalSections} Sections / ${analysis.testSnapshot.totalQuestions} Questions`],
    ["Test Type", analysis.testSnapshot.testType],
    ["Target Exp", analysis.testSnapshot.experienceRange || "Not Specified"],
    ["Eval Mode", analysis.testSnapshot.evaluationMode]
  ];
  
  autoTable(doc, {
    startY: y,
    body: snapshotData,
    theme: "plain",
    styles: { fontSize: 7, cellPadding: 1 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 } },
    margin: { left: 15 }
  });
  
  y = (doc as any).lastAutoTable.finalY + 5;

  // 2. Skill Metrics Table
  doc.setFont("helvetica", "bold");
  doc.text("2. CORE COMPETENCY ALIGNMENT", 15, y);
  y += 4;
  const skillData = analysis.skillMetrics.slice(0, 6).map(s => [s.skill, `${s.coverage}%`, s.status]);
  autoTable(doc, {
    startY: y,
    head: [["Competency Area", "Coverage", "Alignment Status"]],
    body: skillData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
    margin: { left: 15 }
  });
  y = (doc as any).lastAutoTable.finalY + 5;

  // 3. Critical Flagged Items
  if (analysis.flaggedQuestions && analysis.flaggedQuestions.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.danger[0], COLORS.danger[1], COLORS.danger[2]);
    doc.text("3. CRITICAL QUALITY FLAGS (IMMEDIATE ACTION)", 15, y);
    doc.setTextColor(0, 0, 0);
    y += 4;
    const flagData = analysis.flaggedQuestions.slice(0, 4).map((f, i) => {
      const qName = f.questionName && f.questionName !== "Unknown" 
        ? f.questionName 
        : (f.sectionName && f.sectionName !== "Unknown" ? f.sectionName : `Question ${i + 1}`);
      return [qName, f.issueLabel, f.suggestedImprovement];
    });
    autoTable(doc, {
      startY: y,
      head: [["Question Name", "Primary Issue", "Replacement Suggestion"]],
      body: flagData,
      theme: "grid",
      styles: { fontSize: 6.5, cellPadding: 1.5 },
      headStyles: { fillColor: COLORS.danger, textColor: [255, 255, 255] },
      margin: { left: 15 }
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // 4. Action Priorities
  doc.setFont("helvetica", "bold");
  doc.text("4. PRIORITY REVISIONS", 15, y);
  y += 4;
  const actions = analysis.actionPriorities.slice(0, 3).map(a => `• ${a}`).join("\n");
  const splitActions = doc.splitTextToSize(actions, 175);
  doc.setFont("helvetica", "normal");
  doc.text(splitActions, 15, y);
  y += splitActions.length * 3.5 + 5;

  // 5. Enhancement Opportunities (Internal Quality Audit)
  if (analysis.enhancementOpportunities && analysis.enhancementOpportunities.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("5. ENHANCEMENT OPPORTUNITIES", 15, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const ops = analysis.enhancementOpportunities.slice(0, 2).map(o => `• ${o}`).join("\n");
    const splitOps = doc.splitTextToSize(ops, 175);
    doc.text(splitOps, 15, y);
    y += splitOps.length * 3 + 4;
  }

  // 6. Executive Summary (Internal Diagnostic Focus)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(analysis.enhancementOpportunities && analysis.enhancementOpportunities.length > 0 ? "6. EXECUTIVE SUMMARY (RISKS & FINDINGS)" : "5. EXECUTIVE SUMMARY", 15, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const bullets = getInternalSummaryBullets(analysis);
  bullets.slice(0, 4).forEach((bullet) => {
    const splitB = doc.splitTextToSize(`• ${bullet}`, 175);
    doc.text(splitB, 15, y);
    y += splitB.length * 3.3 + 1.2;
  });
  y += 4;

  // Recommendation Footer
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const recColor = analysis.finalRecommendation === "Ready to Ship" ? COLORS.success : 
                 analysis.finalRecommendation === "Ready with Minor Revisions" ? COLORS.warning : COLORS.danger;
  doc.setTextColor(recColor[0], recColor[1], recColor[2]);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const conclusionText = `AUDIT CONCLUSION: ${analysis.finalRecommendation.toUpperCase()}`;
  const splitConclusion = doc.splitTextToSize(conclusionText, 170);
  doc.text(splitConclusion, pageWidth / 2, 282, { align: "center" });

  return doc;
}

export function generateInternalReport(analysis: AssessmentAnalysis) {
  const doc = buildInternalDoc(analysis);
  doc.save(`${analysis.testSnapshot.testName}_Internal_Audit.pdf`);
}

export function getInternalReportPreviewData(analysis: AssessmentAnalysis): string {
  const doc = buildInternalDoc(analysis);
  return doc.output("datauristring");
}

function buildClientDoc(analysis: AssessmentAnalysis): jsPDF {
  const doc = new jsPDF();
  const testName = analysis.testSnapshot.testName;
  const overallScore = calculateOverallScore(analysis.scores);
  
  addHeader(doc, "Doselect Verified Assessment Report", "CLIENT SHIPPING EVALUATION", testName, overallScore);

  let y = 42;

  // 1. Distribution & Complexity
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("1. COGNITIVE COMPLEXITY MIX", 15, y);
  y += 4;
  const normalizedCog = normalizeBloomTaxonomy(analysis.cognitiveDistribution, analysis.testSnapshot.totalQuestions);
  const cogData = normalizedCog.map(c => [c.level, `${c.percentage}%`, `${c.questionCount} Qs`]);
  autoTable(doc, {
    startY: y,
    head: [["Taxonomy Level", "Distribution %", "Questions"]],
    body: cogData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: COLORS.accent, textColor: [255, 255, 255] },
    margin: { left: 15 }
  });
  y = (doc as any).lastAutoTable.finalY + 5;

  // 2. Skill Metrics Table
  doc.setFont("helvetica", "bold");
  doc.text("2. COMPETENCY COVERAGE SUMMARY", 15, y);
  y += 4;
  const skillData = analysis.skillMetrics.slice(0, 6).map(s => [s.skill, `${s.coverage}%`, s.status]);
  autoTable(doc, {
    startY: y,
    head: [["Domain / Skill", "Coverage %", "Proficiency Depth"]],
    body: skillData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: COLORS.success, textColor: [255, 255, 255] },
    margin: { left: 15 }
  });
  y = (doc as any).lastAutoTable.finalY + 5;

  // 3. Executive Summary
  doc.setFont("helvetica", "bold");
  doc.text("3. EXECUTIVE SUMMARY", 15, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const clientBullets = getClientSummaryBullets(analysis);
  clientBullets.slice(0, 5).forEach((bullet) => {
    const splitB = doc.splitTextToSize(`• ${bullet}`, 175);
    doc.text(splitB, 15, y);
    y += splitB.length * 3.3 + 1.2;
  });
  y += 3;

  // 4. Candidate Differentiation
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("4. CANDIDATE DIFFERENTIATION", 15, y);
  y += 4;
  const diffResult = evaluateCandidateDifferentiation(analysis.cognitiveDistribution);
  const tierColor = diffResult.tier === "Basic" ? COLORS.danger : diffResult.tier === "Moderate" ? COLORS.warning : COLORS.success;
  doc.setTextColor(tierColor[0], tierColor[1], tierColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`Rating: ${diffResult.tier.toUpperCase()}`, 15, y);
  y += 3.5;
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const diffSummaryText = `${diffResult.reason} [${diffResult.mixSummary}]`;
  const splitDiff = doc.splitTextToSize(diffSummaryText, 175);
  doc.text(splitDiff, 15, y);
  y += splitDiff.length * 3.2 + 5;

  // 5. Assessment Strengths
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("5. ASSESSMENT STRENGTHS", 15, y);
  y += 4;
  const strengths = analysis.strengths.slice(0, 3).map(s => `• ${s}`).join("\n");
  const splitStrengths = doc.splitTextToSize(strengths, 175);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(splitStrengths, 15, y);
  y += splitStrengths.length * 3.2 + 6;

  // Readiness Footer
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const readinessText = `SHIPPING READINESS: ${analysis.finalRecommendation.toUpperCase()}`;
  const splitReadiness = doc.splitTextToSize(readinessText, 170);
  doc.text(splitReadiness, pageWidth / 2, 282, { align: "center" });

  return doc;
}

export function generateClientReport(analysis: AssessmentAnalysis) {
  const doc = buildClientDoc(analysis);
  doc.save(`${analysis.testSnapshot.testName}_Client_Evaluation.pdf`);
}

export function getClientReportPreviewData(analysis: AssessmentAnalysis): string {
  const doc = buildClientDoc(analysis);
  return doc.output("datauristring");
}
