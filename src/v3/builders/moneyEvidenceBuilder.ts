import type {
    MoneyEvidence,
  } from "../masterReader/types/money";
  import type {
    SajuEvidenceStrength,
    SajuStructureFact,
  } from "../types/sajuFacts";
  
  function toMoneyWeight(
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
  
  export function buildMoneyEvidence(
    structureFacts: SajuStructureFact[],
  ): MoneyEvidence[] {
    return structureFacts.map(
      (fact): MoneyEvidence => {
        const evidence: MoneyEvidence = {
          source: fact.category,
          description: fact.description,
          weight: toMoneyWeight(fact.strength),
          conditions: fact.conditions ?? [],
          exceptions: fact.exceptions ?? [],
        };
  
        if (fact.signal) {
          evidence.signal = fact.signal;
        }
  
        return evidence;
      },
    );
  }