import type {
    CapacityEvidence,
  } from "../masterReader/types/capacity";
  import type {
    SajuEvidenceStrength,
    SajuStructureFact,
  } from "../types/sajuFacts";
  
  function toCapacityWeight(
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
  
  export function buildCapacityEvidence(
    structureFacts: SajuStructureFact[],
  ): CapacityEvidence[] {
    return structureFacts.map(
      (fact): CapacityEvidence => {
        const evidence: CapacityEvidence = {
          source: fact.category,
          description: fact.description,
          weight: toCapacityWeight(fact.strength),
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