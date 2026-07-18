import type {
    RelationshipEvidence,
  } from "../masterReader/types/relationship";
  import type {
    SajuEvidenceStrength,
    SajuStructureFact,
  } from "../types/sajuFacts";
  
  function toRelationshipWeight(
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
  
  export function buildRelationshipEvidence(
    structureFacts: SajuStructureFact[],
  ): RelationshipEvidence[] {
    return structureFacts.map(
      (
        fact,
      ): RelationshipEvidence => {
        const evidence:
          RelationshipEvidence = {
            source: fact.category,
  
            description:
              fact.description,
  
            weight:
              toRelationshipWeight(
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