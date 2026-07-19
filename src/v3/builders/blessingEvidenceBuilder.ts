import type {
    BlessingEvidence,
  } from "../masterReader/types/blessing";
  import type {
    SajuEvidenceStrength,
    SajuStructureFact,
  } from "../types/sajuFacts";
  
  function toBlessingWeight(
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
  
  export function buildBlessingEvidence(
    structureFacts: SajuStructureFact[],
  ): BlessingEvidence[] {
    return structureFacts.map(
      (fact): BlessingEvidence => {
        const evidence:
          BlessingEvidence = {
            source: fact.category,
  
            description:
              fact.description,
  
            weight:
              toBlessingWeight(
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