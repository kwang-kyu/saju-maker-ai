import {
    buildHealthAreaInterpretation,
  } from "../../builders/healthAreaInterpretationBuilder";
  import {
    buildHealthConfidence,
  } from "../../builders/healthConfidenceBuilder";
  import {
    buildHealthEvidence,
  } from "../../builders/healthEvidenceBuilder";
  import {
    buildHealthInterpretation,
  } from "../../builders/healthInterpretationBuilder";
  import type {
    HealthArea,
    HealthEvidence,
    HealthJudgement,
    HealthResult,
  } from "../types/health";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import {
    scoreHealthAreas,
    type HealthAreaScore,
  } from "./healthScorer";
  import {
    selectHealthAreas,
    type HealthAreaSelection,
  } from "./healthSelector";
  
  const HEALTH_AREAS: HealthArea[] = [
    "vitalityStability",
    "stressRegulation",
    "fatigueManagement",
    "recoveryCapacity",
    "rhythmMaintenance",
    "overloadTolerance",
    "habitSelfManagement",
    "imbalanceAdaptation",
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
    evidenceList: HealthEvidence[],
  ): HealthEvidence[] {
    const seen = new Set<string>();
    const result: HealthEvidence[] = [];
  
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
    selection: HealthAreaSelection,
  ): HealthEvidence[] {
    return uniqueEvidence(
      selection.supportingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectLimitingEvidence(
    selection: HealthAreaSelection,
  ): HealthEvidence[] {
    return uniqueEvidence(
      selection.limitingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectExceptionConditions(
    selection: HealthAreaSelection,
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
    area: HealthArea,
  ): HealthJudgement {
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
  
  function buildHealthJudgement(
    selection: HealthAreaSelection,
  ): HealthJudgement {
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
        buildHealthAreaInterpretation(
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
        buildHealthConfidence(
          selection,
        ),
  
      exceptionConditions:
        collectExceptionConditions(
          selection,
        ),
    };
  }
  
  function findAreaSelection(
    area: HealthArea,
    selections: HealthAreaSelection[],
  ): HealthAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function findAreaScore(
    area: HealthArea,
    scores: HealthAreaScore[],
  ): HealthAreaScore | null {
    return (
      scores.find(
        (score) =>
          score.area === area,
      )
      ?? null
    );
  }
  
  function buildMissingAreaSelection(
    area: HealthArea,
  ): HealthAreaSelection {
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
    area: HealthArea,
    scores: HealthAreaScore[],
    selections: HealthAreaSelection[],
  ): HealthAreaSelection {
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
    area: HealthArea,
    judgements: Map<
      HealthArea,
      HealthJudgement
    >,
  ): HealthJudgement {
    const judgement =
      judgements.get(area);
  
    if (!judgement) {
      throw new Error(
        `HealthResult requires ${area} judgement.`,
      );
    }
  
    return judgement;
  }
  
  function buildHealthResult(
    scores: HealthAreaScore[],
    selections: HealthAreaSelection[],
  ): HealthResult {
    const judgements = new Map<
      HealthArea,
      HealthJudgement
    >();
  
    const normalizedSelections:
      HealthAreaSelection[] = [];
  
    for (const area of HEALTH_AREAS) {
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
        buildHealthJudgement(
          selection,
        ),
      );
    }
  
    return {
      vitalityStability:
        requireJudgement(
          "vitalityStability",
          judgements,
        ),
  
      stressRegulation:
        requireJudgement(
          "stressRegulation",
          judgements,
        ),
  
      fatigueManagement:
        requireJudgement(
          "fatigueManagement",
          judgements,
        ),
  
      recoveryCapacity:
        requireJudgement(
          "recoveryCapacity",
          judgements,
        ),
  
      rhythmMaintenance:
        requireJudgement(
          "rhythmMaintenance",
          judgements,
        ),
  
      overloadTolerance:
        requireJudgement(
          "overloadTolerance",
          judgements,
        ),
  
      habitSelfManagement:
        requireJudgement(
          "habitSelfManagement",
          judgements,
        ),
  
      imbalanceAdaptation:
        requireJudgement(
          "imbalanceAdaptation",
          judgements,
        ),
  
      interpretation:
        buildHealthInterpretation(
          normalizedSelections,
        ),
    };
  }
  
  export function readHealth(
    structureFacts: SajuStructureFact[],
  ): HealthResult {
    const evidence =
      buildHealthEvidence(
        structureFacts,
      );
  
    const scores =
      scoreHealthAreas(
        evidence,
      );
  
    const selections =
      selectHealthAreas(
        scores,
      );
  
    return buildHealthResult(
      scores,
      selections,
    );
  }