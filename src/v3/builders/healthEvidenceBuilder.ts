import type {
    HealthEvidence,
  } from "../masterReader/types/health.js";
  import type {
    SajuEvidenceStrength,
    SajuStructureFact,
  } from "../types/sajuFacts.js";
  
  function toHealthWeight(
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
  
  export function buildHealthEvidence(
    structureFacts: SajuStructureFact[],
  ): HealthEvidence[] {
    return structureFacts.map(
      (
        fact,
      ): HealthEvidence => {
        const evidence:
          HealthEvidence = {
            source: fact.category,
  
            description:
              fact.description,
  
            weight:
              toHealthWeight(
                fact.strength,
              ),
  
            conditions:
              fact.conditions ?? [],
  
            exceptions:
              fact.exceptions ?? [],
          };
  
        if (fact.signal) {
          evidence.signal =
            fact.signal;
        }
  
        return evidence;
      },
    );
  }