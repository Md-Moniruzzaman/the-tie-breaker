import { DecisionAnalysis, DecisionOption } from '../types';

export function calculateOptionProsConsScore(
  option: DecisionOption,
  disabledItemIds: Set<string> = new Set()
): { prosScore: number; consScore: number; netScore: number } {
  let prosScore = 0;
  let consScore = 0;

  option.pros.forEach((pro) => {
    if (!disabledItemIds.has(pro.id)) {
      prosScore += pro.weight;
    }
  });

  option.cons.forEach((con) => {
    if (!disabledItemIds.has(con.id)) {
      consScore += con.weight;
    }
  });

  return {
    prosScore,
    consScore,
    netScore: prosScore - consScore,
  };
}

export function calculateMatrixOptionScore(
  analysis: DecisionAnalysis,
  optionId: string,
  criteriaWeights: Record<string, number> = {}
): { totalScore: number; maxPossibleScore: number; percentage: number } {
  let weightedSum = 0;
  let totalWeight = 0;

  analysis.comparisonCriteria.forEach((criterion) => {
    const weight = criteriaWeights[criterion.category] ?? 1;
    const match = criterion.scores.find((s) => s.optionId === optionId);
    const score = match ? match.score : 5;

    weightedSum += score * weight;
    totalWeight += 10 * weight;
  });

  const totalScore = Math.round(weightedSum * 10) / 10;
  const percentage = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

  return { totalScore, maxPossibleScore: totalWeight, percentage };
}

export function generateMarkdownReport(analysis: DecisionAnalysis): string {
  let md = `# Decision Report: ${analysis.decisionTitle}\n\n`;
  md += `**Core Trade-off**: ${analysis.coreConflict}\n`;
  md += `**Generated**: ${new Date(analysis.createdAt).toLocaleDateString()}\n\n`;

  md += `## 🏆 The Tiebreaker Verdict\n`;
  md += `**Recommendation**: ${analysis.tiebreakerRecommendation.headlineVerdict}\n\n`;
  md += `### Strategic Reasoning\n${analysis.tiebreakerRecommendation.reasoning}\n\n`;

  md += `### Conditional Guidance\n`;
  analysis.tiebreakerRecommendation.conditionalAdvice.forEach((adv) => {
    md += `- **${adv.condition}**: ${adv.choice}\n`;
  });
  md += `\n`;

  md += `### ⚠️ Blindspot Warning\n${analysis.tiebreakerRecommendation.blindspotWarning}\n\n`;
  md += `### 🚀 Recommended Next Step\n${analysis.tiebreakerRecommendation.recommendedNextStep}\n\n`;

  md += `---\n\n## ⚖️ Pros & Cons Evaluation\n\n`;
  analysis.options.forEach((opt) => {
    const scores = calculateOptionProsConsScore(opt);
    md += `### ${opt.name} (Net Score: ${scores.netScore > 0 ? '+' : ''}${scores.netScore})\n`;
    md += `*${opt.tagline}*\n\n`;

    md += `**Pros (+${scores.prosScore})**:\n`;
    opt.pros.forEach((p) => {
      md += `- [${p.impact.toUpperCase()}] (+${p.weight}) ${p.text} *(${p.category})*\n`;
    });
    md += `\n`;

    md += `**Cons (-${scores.consScore})**:\n`;
    opt.cons.forEach((c) => {
      md += `- [${c.impact.toUpperCase()}] (-${c.weight}) ${c.text} *(${c.category})*\n`;
    });
    md += `\n`;
  });

  md += `---\n\n## 📊 Comparison Matrix\n\n`;
  analysis.comparisonCriteria.forEach((crit) => {
    md += `### ${crit.category}\n*${crit.description}*\n`;
    crit.scores.forEach((sc) => {
      const opt = analysis.options.find((o) => o.id === sc.optionId);
      md += `- **${opt?.name || sc.optionId}**: ${sc.score}/10 — ${sc.verdict}\n`;
    });
    const winner = analysis.options.find((o) => o.id === crit.winnerOptionId);
    md += `👉 **Criterion Winner**: ${winner?.name || crit.winnerOptionId}\n\n`;
  });

  md += `---\n\n## 🧭 SWOT Analysis\n\n`;
  analysis.options.forEach((opt) => {
    md += `### SWOT: ${opt.name}\n`;
    md += `**Strengths**:\n${opt.swot.strengths.map((s) => `- ${s}`).join('\n')}\n\n`;
    md += `**Weaknesses**:\n${opt.swot.weaknesses.map((w) => `- ${w}`).join('\n')}\n\n`;
    md += `**Opportunities**:\n${opt.swot.opportunities.map((o) => `- ${o}`).join('\n')}\n\n`;
    md += `**Threats**:\n${opt.swot.threats.map((t) => `- ${t}`).join('\n')}\n\n`;
  });

  return md;
}
