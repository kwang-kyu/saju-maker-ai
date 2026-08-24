import type {
    CareerEvidence,
  } from "../masterReader/types/career.js";
  import type {
    SajuEvidenceStrength,
    SajuStructureFact,
  } from "../types/sajuFacts.js";
  
  function toCareerWeight(
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
  
  export function buildCareerEvidence(
    structureFacts: SajuStructureFact[],
  ): CareerEvidence[] {
    return structureFacts.map(
      (fact): CareerEvidence => {
        const evidence: CareerEvidence = {
          source: fact.category,
  
          description: fact.description,
  
          weight:
            toCareerWeight(fact.strength),
  
          conditions:
            fact.conditions ?? [],
  
          exceptions:
            fact.exceptions ?? [],
        };
  
        if (fact.signal) {
          evidence.signal = fact.signal;
        }
  
        return evidence;
      },
    );
  }