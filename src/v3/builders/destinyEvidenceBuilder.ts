import type {
    DestinyEvidence,
  } from "../masterReader/types/destiny.js";
  import type {
    SajuEvidenceStrength,
    SajuStructureFact,
  } from "../types/sajuFacts.js";
  
  function toDestinyWeight(
    strength: SajuEvidenceStrength,
  ): number {
    switch (strength) {
      case "strong":
        return 3;
  
      case "medium":
        return 2;
  
      case "weak":
        return 1;
    }
  }
  
  function uniqueTexts(
    values: string[],
  ): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
  
    for (const value of values) {
      const normalized =
        value
          .replace(/\s+/g, " ")
          .trim();
  
      if (
        !normalized
        || seen.has(normalized)
      ) {
        continue;
      }
  
      seen.add(normalized);
      result.push(normalized);
    }
  
    return result;
  }
  
  export function buildDestinyEvidence(
    structureFacts: SajuStructureFact[],
  ): DestinyEvidence[] {
    return structureFacts.map(
      (fact): DestinyEvidence => {
        const evidence:
          DestinyEvidence = {
            source: fact.category,
  
            description:
              fact.description,
  
            weight:
              toDestinyWeight(
                fact.strength,
              ),
  
            conditions:
              uniqueTexts(
                fact.conditions ?? [],
              ),
  
            exceptions:
              uniqueTexts(
                fact.exceptions ?? [],
              ),
          };
  
        if (fact.signal) {
          evidence.signal =
            fact.signal;
        }
  
        return evidence;
      },
    );
  }