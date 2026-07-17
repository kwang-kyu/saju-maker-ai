import {
    buildCapacityConfidence,
  } from "../../builders/capacityConfidenceBuilder";
  import {
    buildCapacityEvidence,
  } from "../../builders/capacityEvidenceBuilder";
  import {
    buildCapacityInterpretation,
  } from "../../builders/capacityInterpretationBuilder";
  import type {
    CapacityArea,
    CapacityEvidence,
    CapacityJudgement,
    CapacityResult,
  } from "../types/capacity";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import {
    scoreCapacityAreas,
    type CapacityAreaScore,
  } from "./capacityScorer";
  import {
    selectCapacityAreas,
    type CapacityAreaSelection,
  } from "./capacitySelector";
  
  const CAPACITY_AREAS: CapacityArea[] = [
    "responsibility",
    "money",
    "organization",
    "relationship",
    "risk",
    "time",
  ];
  
  function uniqueTexts(
    values: string[],
  ): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
  
    for (const value of values) {
      const normalized = value
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
    evidenceList: CapacityEvidence[],
  ): CapacityEvidence[] {
    const seen = new Set<string>();
    const result: CapacityEvidence[] = [];
  
    for (const evidence of evidenceList) {
      const identity = [
        evidence.source,
        evidence.signal?.kind ?? "no-signal",
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
    selection: CapacityAreaSelection,
  ): CapacityEvidence[] {
    return uniqueEvidence(
      selection.supportingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectLimitingEvidence(
    selection: CapacityAreaSelection,
  ): CapacityEvidence[] {
    return uniqueEvidence(
      selection.limitingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectExceptionConditions(
    selection: CapacityAreaSelection,
  ): string[] {
    const limitingExceptions =
      selection.limitingMatches.flatMap(
        (match) => [
          ...match.evidence.conditions,
          ...match.evidence.exceptions,
        ],
      );
  
    const supportingExceptions =
      selection.supportingMatches.flatMap(
        (match) => match.evidence.exceptions,
      );
  
    return uniqueTexts([
      ...limitingExceptions,
      ...supportingExceptions,
    ]);
  }
  
  function buildInsufficientJudgement(
    area: CapacityArea,
  ): CapacityJudgement {
    return {
      area,
  
      level: "moderate",
  
      interpretation: null,
  
      evidence: [],
  
      counterEvidence: [],
  
      confidence: "low",
  
      exceptionConditions: [],
    };
  }
  
  function buildCapacityJudgement(
    selection: CapacityAreaSelection,
  ): CapacityJudgement {
    if (
      selection.status === "insufficient"
      || selection.level === null
    ) {
      return buildInsufficientJudgement(
        selection.area,
      );
    }
  
    return {
      area: selection.area,
  
      level: selection.level,
  
      interpretation:
        buildCapacityInterpretation(selection),
  
      evidence:
        collectSupportingEvidence(selection),
  
      counterEvidence:
        collectLimitingEvidence(selection),
  
      confidence:
        buildCapacityConfidence(selection),
  
      exceptionConditions:
        collectExceptionConditions(selection),
    };
  }
  
  function findAreaSelection(
    area: CapacityArea,
    selections: CapacityAreaSelection[],
  ): CapacityAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function findAreaScore(
    area: CapacityArea,
    scores: CapacityAreaScore[],
  ): CapacityAreaScore | null {
    return (
      scores.find(
        (score) => score.area === area,
      )
      ?? null
    );
  }
  
  function buildMissingAreaSelection(
    area: CapacityArea,
  ): CapacityAreaSelection {
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
    area: CapacityArea,
    scores: CapacityAreaScore[],
    selections: CapacityAreaSelection[],
  ): CapacityAreaSelection {
    const selection =
      findAreaSelection(area, selections);
  
    if (selection) {
      return selection;
    }
  
    const score =
      findAreaScore(area, scores);
  
    if (!score) {
      return buildMissingAreaSelection(area);
    }
  
    return buildMissingAreaSelection(score.area);
  }
  
  function buildCapacityResult(
    scores: CapacityAreaScore[],
    selections: CapacityAreaSelection[],
  ): CapacityResult {
    const judgements = new Map<
      CapacityArea,
      CapacityJudgement
    >();
  
    for (const area of CAPACITY_AREAS) {
      const selection =
        ensureAreaSelection(
          area,
          scores,
          selections,
        );
  
      judgements.set(
        area,
        buildCapacityJudgement(selection),
      );
    }
  
    const responsibility =
      judgements.get("responsibility");
  
    const money =
      judgements.get("money");
  
    const organization =
      judgements.get("organization");
  
    const relationship =
      judgements.get("relationship");
  
    const risk =
      judgements.get("risk");
  
    const time =
      judgements.get("time");
  
    if (
      !responsibility
      || !money
      || !organization
      || !relationship
      || !risk
      || !time
    ) {
      throw new Error(
        "CapacityResult requires all capacity areas.",
      );
    }
  
    return {
      responsibility,
      money,
      organization,
      relationship,
      risk,
      time,
    };
  }
  
  export function readCapacity(
    structureFacts: SajuStructureFact[],
  ): CapacityResult {
    const evidence =
      buildCapacityEvidence(structureFacts);
  
    const scores =
      scoreCapacityAreas(evidence);
  
    const selections =
      selectCapacityAreas(scores);
  
    return buildCapacityResult(
      scores,
      selections,
    );
  }