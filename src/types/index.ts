// Pagespeed / Report types
export interface ScoreBlock {
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
}

export interface MetricEntry {
  value: string;
  status: string;
}

export interface Suggestion {
  title: string;
  score: number | null;
  displayValue: string | null;
  description: string;
}

export interface PageSpeedResult {
  scores: ScoreBlock;
  metrics: Record<string, MetricEntry>;
  suggestions: Suggestion[];
}

// Comparison types
export interface ScoreBlockPair {
  mobile: ScoreBlock;
  desktop: ScoreBlock;
}

export interface CompetitorInput {
  url: string;
  label?: string;
}
