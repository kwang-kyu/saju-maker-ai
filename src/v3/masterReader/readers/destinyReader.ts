import {
    buildDestinyAreaInterpretation,
  } from "../../builders/destinyAreaInterpretationBuilder.js";
  import {
    buildDestinyConfidence,
  } from "../../builders/destinyConfidenceBuilder.js";
  import {
    buildDestinyEvidence,
  } from "../../builders/destinyEvidenceBuilder.js";
  import {
    buildDestinyInterpretation,
  } from "../../builders/destinyInterpretationBuilder.js";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts.js";
  import type {
    DestinyArea,
    DestinyEvidence,
    DestinyJudgement,
    DestinyResult,
  } from "../types/destiny.js";
  import {
    scoreDestinyAreas,
    type DestinyAreaScore,
  } from "./destinyScorer.js";
  import {
    selectDestinyAreas,
    type DestinyAreaSelection,
  } from "./destinySelector.js";
  
  const DESTINY_AREAS: DestinyArea[] = [
    "lifeDirection",
    "coreLifeTask",
    "strengthFulfillment",
    "growthPath",
    "choiceAlignment",
    "changeIntegration",
    "contributionPattern",
    "longTermCoherence",
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
    evidenceList: DestinyEvidence[],
  ): DestinyEvidence[] {
    const seen = new Set<string>();
    const result: DestinyEvidence[] = [];
  
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
    selection: DestinyAreaSelection,
  ): DestinyEvidence[] {
    return uniqueEvidence(
      selection.supportingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectLimitingEvidence(
    selection: DestinyAreaSelection,
  ): DestinyEvidence[] {
    return uniqueEvidence(
      selection.limitingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectExceptionConditions(
    selection: DestinyAreaSelection,
  ): string[] {
    const limitingConditions =
      selection.limitingMatches.flatMap(
        (match) => [
          ...match.evidence.conditions,
          ...match.evidence.exceptions,
        ],
      );
  
    const supportingExceptions =
      selection.supportingMatches.flatMap(
        (match) =>
          match.evidence.exceptions,
      );
  
    return uniqueTexts([
      ...limitingConditions,
      ...supportingExceptions,
    ]);
  }
  
  function buildInsufficientJudgement(
    area: DestinyArea,
  ): DestinyJudgement {
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
  
  function buildDestinyJudgement(
    selection: DestinyAreaSelection,
  ): DestinyJudgement {
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
        buildDestinyAreaInterpretation(
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
        buildDestinyConfidence(
          selection,
        ),
  
      exceptionConditions:
        collectExceptionConditions(
          selection,
        ),
    };
  }
  
  function findAreaSelection(
    area: DestinyArea,
    selections: DestinyAreaSelection[],
  ): DestinyAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function findAreaScore(
    area: DestinyArea,
    scores: DestinyAreaScore[],
  ): DestinyAreaScore | null {
    return (
      scores.find(
        (score) =>
          score.area === area,
      )
      ?? null
    );
  }
  
  function buildMissingAreaSelection(
    area: DestinyArea,
  ): DestinyAreaSelection {
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
    area: DestinyArea,
    scores: DestinyAreaScore[],
    selections: DestinyAreaSelection[],
  ): DestinyAreaSelection {
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
      return buildMissingAreaSelection(
        area,
      );
    }
  
    return buildMissingAreaSelection(
      score.area,
    );
  }
  
  function requireJudgement(
    area: DestinyArea,
    judgements: Map<
      DestinyArea,
      DestinyJudgement
    >,
  ): DestinyJudgement {
    const judgement =
      judgements.get(area);
  
    if (!judgement) {
      throw new Error(
        `DestinyResult requires ${area} judgement.`,
      );
    }
  
    return judgement;
  }
  
  function buildDestinyResult(
    scores: DestinyAreaScore[],
    selections: DestinyAreaSelection[],
  ): DestinyResult {
    const judgements = new Map<
      DestinyArea,
      DestinyJudgement
    >();
  
    const normalizedSelections:
      DestinyAreaSelection[] = [];
  
    for (const area of DESTINY_AREAS) {
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
        buildDestinyJudgement(
          selection,
        ),
      );
    }
  
    return {
      lifeDirection:
        requireJudgement(
          "lifeDirection",
          judgements,
        ),
  
      coreLifeTask:
        requireJudgement(
          "coreLifeTask",
          judgements,
        ),
  
      strengthFulfillment:
        requireJudgement(
          "strengthFulfillment",
          judgements,
        ),
  
      growthPath:
        requireJudgement(
          "growthPath",
          judgements,
        ),
  
      choiceAlignment:
        requireJudgement(
          "choiceAlignment",
          judgements,
        ),
  
      changeIntegration:
        requireJudgement(
          "changeIntegration",
          judgements,
        ),
  
      contributionPattern:
        requireJudgement(
          "contributionPattern",
          judgements,
        ),
  
      longTermCoherence:
        requireJudgement(
          "longTermCoherence",
          judgements,
        ),
  
      interpretation:
        buildDestinyInterpretation(
          normalizedSelections,
        ),
    };
  }
  
  export function readDestiny(
    structureFacts: SajuStructureFact[],
  ): DestinyResult {
    const evidence =
      buildDestinyEvidence(
        structureFacts,
      );
  
    const scores =
      scoreDestinyAreas(
        evidence,
      );
  
    const selections =
      selectDestinyAreas(
        scores,
      );
  
    return buildDestinyResult(
      scores,
      selections,
    );
  }