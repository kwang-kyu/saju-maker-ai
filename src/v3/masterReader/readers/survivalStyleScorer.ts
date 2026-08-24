import type {
    SurvivalEvidence,
    SurvivalStyleType,
  } from "../types/survivalStyle.js";
  import {
    matchSurvivalStyleRules,
    type MatchedSurvivalStyleRule,
  } from "../rules/survivalStyleRules.js";
  
  export type SurvivalStyleScore = {
    style: SurvivalStyleType;
    score: number;
    matches: MatchedSurvivalStyleRule[];
  };
  
  const SURVIVAL_STYLE_TYPES: SurvivalStyleType[] = [
    "push",
    "analysis",
    "relationship",
    "independent",
    "stability",
    "opportunity",
    "learning",
    "endurance",
  ];
  
  function getEvidenceWeightMultiplier(weight: number): number {
    if (weight >= 3) {
      return 1.5;
    }
  
    if (weight === 2) {
      return 1;
    }
  
    if (weight === 1) {
      return 0.5;
    }
  
    return 0;
  }
  
  export function scoreSurvivalStyles(
    evidenceList: SurvivalEvidence[],
  ): SurvivalStyleScore[] {
    const matches = matchSurvivalStyleRules(evidenceList);
  
    const scores = new Map<SurvivalStyleType, SurvivalStyleScore>();
  
    for (const style of SURVIVAL_STYLE_TYPES) {
      scores.set(style, {
        style,
        score: 0,
        matches: [],
      });
    }
  
    for (const match of matches) {
      const current = scores.get(match.rule.style);
  
      if (!current) {
        continue;
      }
  
      const evidenceMultiplier = getEvidenceWeightMultiplier(
        match.evidence.weight,
      );
  
      current.score += match.rule.weight * evidenceMultiplier;
      current.matches.push(match);
    }
  
    return Array.from(scores.values()).sort(
      (a, b) => b.score - a.score,
    );
  }