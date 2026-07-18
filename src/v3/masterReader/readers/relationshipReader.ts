import {
    buildRelationshipConfidence,
  } from "../../builders/relationshipConfidenceBuilder";
  import {
    buildRelationshipEvidence,
  } from "../../builders/relationshipEvidenceBuilder";
  import {
    buildRelationshipAreaInterpretation,
  } from "../../builders/relationshipAreaInterpretationBuilder";
  import {
    buildRelationshipInterpretation,
  } from "../../builders/relationshipInterpretationBuilder";
  import type {
    RelationshipArea,
    RelationshipEvidence,
    RelationshipJudgement,
    RelationshipResult,
  } from "../types/relationship";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import {
    scoreRelationshipAreas,
    type RelationshipAreaScore,
  } from "./relationshipScorer";
  import {
    selectRelationshipAreas,
    type RelationshipAreaSelection,
  } from "./relationshipSelector";
  
  const RELATIONSHIP_AREAS:
    RelationshipArea[] = [
      "connectionExpansion",
      "intimacyMaintenance",
      "emotionalExchange",
      "boundaryMaintenance",
      "conflictAdjustment",
      "trustRecovery",
      "partnershipCooperation",
      "spouseBonding",
    ];
  
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
  
  function uniqueEvidence(
    evidenceList:
      RelationshipEvidence[],
  ): RelationshipEvidence[] {
    const seen = new Set<string>();
  
    const result:
      RelationshipEvidence[] = [];
  
    for (
      const evidence
      of evidenceList
    ) {
      const identity = [
        evidence.source,
        evidence.signal?.kind
          ?? "no-signal",
        evidence.description,
        evidence.weight.toString(),
      ].join("::");
  
      if (seen.has(identity)) {
        continue;
      }
  
      seen.add(identity);
      result.push(evidence);
    }
  
    return result;
  }
  
  function collectSupportingEvidence(
    selection:
      RelationshipAreaSelection,
  ): RelationshipEvidence[] {
    return uniqueEvidence(
      selection.supportingMatches.map(
        (match) =>
          match.evidence,
      ),
    );
  }
  
  function collectLimitingEvidence(
    selection:
      RelationshipAreaSelection,
  ): RelationshipEvidence[] {
    return uniqueEvidence(
      selection.limitingMatches.map(
        (match) =>
          match.evidence,
      ),
    );
  }
  
  function collectExceptionConditions(
    selection:
      RelationshipAreaSelection,
  ): string[] {
    const limitingExceptions =
      selection.limitingMatches
        .flatMap(
          (match) => [
            ...match.evidence.conditions,
            ...match.evidence.exceptions,
          ],
        );
  
    const supportingExceptions =
      selection.supportingMatches
        .flatMap(
          (match) =>
            match.evidence.exceptions,
        );
  
    return uniqueTexts([
      ...limitingExceptions,
      ...supportingExceptions,
    ]);
  }
  
  function buildInsufficientJudgement(
    area: RelationshipArea,
  ): RelationshipJudgement {
    return {
      area,
  
      level: null,
  
      interpretation: null,
  
      evidence: [],
  
      counterEvidence: [],
  
      confidence: "low",
  
      exceptionConditions: [],
    };
  }
  
  function buildRelationshipJudgement(
    selection:
      RelationshipAreaSelection,
  ): RelationshipJudgement {
    if (
      selection.status
        === "insufficient"
      || selection.level === null
    ) {
      return (
        buildInsufficientJudgement(
          selection.area,
        )
      );
    }
  
    return {
      area: selection.area,
  
      level: selection.level,
  
      interpretation:
        buildRelationshipAreaInterpretation(
          selection,
        ),
  
      evidence:
        collectSupportingEvidence(
          selection,
        ),
  
      counterEvidence:
        collectLimitingEvidence(
          selection,
        ),
  
      confidence:
        buildRelationshipConfidence(
          selection,
        ),
  
      exceptionConditions:
        collectExceptionConditions(
          selection,
        ),
    };
  }
  
  function findAreaSelection(
    area: RelationshipArea,
    selections:
      RelationshipAreaSelection[],
  ): RelationshipAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function findAreaScore(
    area: RelationshipArea,
    scores: RelationshipAreaScore[],
  ): RelationshipAreaScore | null {
    return (
      scores.find(
        (score) =>
          score.area === area,
      )
      ?? null
    );
  }
  
  function buildMissingAreaSelection(
    area: RelationshipArea,
  ): RelationshipAreaSelection {
    return {
      area,
  
      level: null,
  
      status: "insufficient",
  
      supportScore: 0,
  
      limitScore: 0,
  
      finalScore: 0,
  
      supportingMatches: [],
  
      limitingMatches: [],
  
      signalSupportCount: 0,
  
      signalLimitCount: 0,
    };
  }
  
  function ensureAreaSelection(
    area: RelationshipArea,
    scores: RelationshipAreaScore[],
    selections:
      RelationshipAreaSelection[],
  ): RelationshipAreaSelection {
    const selection =
      findAreaSelection(
        area,
        selections,
      );
  
    if (selection) {
      return selection;
    }
  
    const score =
      findAreaScore(
        area,
        scores,
      );
  
    if (!score) {
      return (
        buildMissingAreaSelection(
          area,
        )
      );
    }
  
    return (
      buildMissingAreaSelection(
        score.area,
      )
    );
  }
  
  function requireJudgement(
    area: RelationshipArea,
    judgements: Map<
      RelationshipArea,
      RelationshipJudgement
    >,
  ): RelationshipJudgement {
    const judgement =
      judgements.get(area);
  
    if (!judgement) {
      throw new Error(
        `RelationshipResult requires ${area} judgement.`,
      );
    }
  
    return judgement;
  }
  
  function buildRelationshipResult(
    scores: RelationshipAreaScore[],
    selections:
      RelationshipAreaSelection[],
  ): RelationshipResult {
    const judgements = new Map<
      RelationshipArea,
      RelationshipJudgement
    >();
  
    const normalizedSelections:
      RelationshipAreaSelection[] = [];
  
    for (
      const area
      of RELATIONSHIP_AREAS
    ) {
      const selection =
        ensureAreaSelection(
          area,
          scores,
          selections,
        );
  
      normalizedSelections.push(
        selection,
      );
  
      judgements.set(
        area,
        buildRelationshipJudgement(
          selection,
        ),
      );
    }
  
    return {
      connectionExpansion:
        requireJudgement(
          "connectionExpansion",
          judgements,
        ),
  
      intimacyMaintenance:
        requireJudgement(
          "intimacyMaintenance",
          judgements,
        ),
  
      emotionalExchange:
        requireJudgement(
          "emotionalExchange",
          judgements,
        ),
  
      boundaryMaintenance:
        requireJudgement(
          "boundaryMaintenance",
          judgements,
        ),
  
      conflictAdjustment:
        requireJudgement(
          "conflictAdjustment",
          judgements,
        ),
  
      trustRecovery:
        requireJudgement(
          "trustRecovery",
          judgements,
        ),
  
      partnershipCooperation:
        requireJudgement(
          "partnershipCooperation",
          judgements,
        ),
  
      spouseBonding:
        requireJudgement(
          "spouseBonding",
          judgements,
        ),
  
      interpretation:
        buildRelationshipInterpretation(
          normalizedSelections,
        ),
    };
  }
  
  export function readRelationship(
    structureFacts:
      SajuStructureFact[],
  ): RelationshipResult {
    const evidence =
      buildRelationshipEvidence(
        structureFacts,
      );
  
    const scores =
      scoreRelationshipAreas(
        evidence,
      );
  
    const selections =
      selectRelationshipAreas(
        scores,
      );
  
    return buildRelationshipResult(
      scores,
      selections,
    );
  }