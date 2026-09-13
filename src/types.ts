export interface ProConItem {
  id: string;
  text: string;
  impact: 'high' | 'medium' | 'low';
  weight: number; // 1 to 5
  category: string;
}

export interface OptionSwot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface DecisionOption {
  id: string;
  name: string;
  tagline: string;
  pros: ProConItem[];
  cons: ProConItem[];
  swot: OptionSwot;
}

export interface CriterionScore {
  optionId: string;
  score: number; // 1 to 10
  verdict: string;
}

export interface ComparisonCriterion {
  category: string;
  description: string;
  scores: CriterionScore[];
  winnerOptionId: string;
}

export interface ConditionalAdvice {
  condition: string;
  choice: string;
}

export interface TiebreakerRecommendation {
  recommendedOptionId: string;
  headlineVerdict: string;
  reasoning: string;
  conditionalAdvice: ConditionalAdvice[];
  blindspotWarning: string;
  recommendedNextStep: string;
}

export interface DecisionAnalysis {
  id: string;
  createdAt: string;
  decisionTitle: string;
  coreConflict: string;
  options: DecisionOption[];
  comparisonCriteria: ComparisonCriterion[];
  tiebreakerRecommendation: TiebreakerRecommendation;
  userWeights?: Record<string, number>; // customizable weight per criterion
  userDisabledItems?: string[]; // IDs of pros/cons disabled by user in live calculation
}
