import type { LifeDriverType } from "../types/lifeDriver";
import type { LifeDriverMeaning } from "../types/lifeDriverInput";
import {
  matchLifeDriverRules,
  type MatchedLifeDriverRule,
} from "../rules/lifeDriverRules";

export type LifeDriverScore = {
  driver: LifeDriverType;
  score: number;
  matches: MatchedLifeDriverRule[];
};

const LIFE_DRIVER_TYPES: LifeDriverType[] = [
  "achievement",
  "wealth",
  "knowledge",
  "creation",
  "leadership",
  "relationship",
  "freedom",
  "stability",
];

function getStrengthMultiplier(
  strength: LifeDriverMeaning["strength"],
): number {
  switch (strength) {
    case "strong":
      return 1.5;
    case "medium":
      return 1;
    case "weak":
      return 0.5;
  }
}

function getConfidenceMultiplier(
  confidence: LifeDriverMeaning["confidence"],
): number {
  switch (confidence) {
    case "high":
      return 1.25;
    case "medium":
      return 1;
    case "low":
      return 0.75;
  }
}

export function scoreLifeDrivers(
  meanings: LifeDriverMeaning[],
): LifeDriverScore[] {
  const matches = matchLifeDriverRules(meanings);

  const scores = new Map<LifeDriverType, LifeDriverScore>();

  for (const driver of LIFE_DRIVER_TYPES) {
    scores.set(driver, {
      driver,
      score: 0,
      matches: [],
    });
  }

  for (const match of matches) {
    const current = scores.get(match.rule.driver);

    if (!current) {
      continue;
    }

    const strengthMultiplier = getStrengthMultiplier(
      match.meaning.strength,
    );

    const confidenceMultiplier = getConfidenceMultiplier(
      match.meaning.confidence,
    );

    current.score +=
      match.rule.weight *
      strengthMultiplier *
      confidenceMultiplier;

    current.matches.push(match);
  }

  return Array.from(scores.values()).sort(
    (a, b) => b.score - a.score,
  );
}