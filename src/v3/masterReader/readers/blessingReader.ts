import {
    buildBlessingAreaInterpretation,
  } from "../../builders/blessingAreaInterpretationBuilder";
  import {
    buildBlessingConfidence,
  } from "../../builders/blessingConfidenceBuilder";
  import {
    buildBlessingEvidence,
  } from "../../builders/blessingEvidenceBuilder";
  import {
    buildBlessingInterpretation,
  } from "../../builders/blessingInterpretationBuilder";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import type {
    BlessingArea,
    BlessingEvidence,
    BlessingJudgement,
    BlessingResult,
  } from "../types/blessing";
  import {
    scoreBlessingAreas,
    type BlessingAreaScore,
  } from "./blessingScorer";
  import {
    selectBlessingAreas,
    type BlessingAreaSelection,
  } from "./blessingSelector";
  
  const BLESSING_AREAS: BlessingArea[] = [
    "opportunityReception",
    "benefactorConnection",
    "relationshipSupport",
    "resourceSupport",
    "environmentSupport",
    "crisisProtection",
    "blessingRetention",
    "blessingCirculation",
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
    evidenceList: BlessingEvidence[],
  ): BlessingEvidence[] {
    const seen = new Set<string>();
    const result: BlessingEvidence[] = [];
  
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
    selection: BlessingAreaSelection,
  ): BlessingEvidence[] {
    return uniqueEvidence(
      selection.supportingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectLimitingEvidence(
    selection: BlessingAreaSelection,
  ): BlessingEvidence[] {
    return uniqueEvidence(
      selection.limitingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectExceptionConditions(
    selection: BlessingAreaSelection,
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
    area: BlessingArea,
  ): BlessingJudgement {
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
  
  function buildBlessingJudgement(
    selection: BlessingAreaSelection,
  ): BlessingJudgement {
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
        buildBlessingAreaInterpretation(
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
        buildBlessingConfidence(
          selection,
        ),
  
      exceptionConditions:
        collectExceptionConditions(
          selection,
        ),
    };
  }
  
  function findAreaSelection(
    area: BlessingArea,
    selections: BlessingAreaSelection[],
  ): BlessingAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function findAreaScore(
    area: BlessingArea,
    scores: BlessingAreaScore[],
  ): BlessingAreaScore | null {
    return (
      scores.find(
        (score) =>
          score.area === area,
      )
      ?? null
    );
  }
  
  function buildMissingAreaSelection(
    area: BlessingArea,
  ): BlessingAreaSelection {
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
    area: BlessingArea,
    scores: BlessingAreaScore[],
    selections: BlessingAreaSelection[],
  ): BlessingAreaSelection {
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
    area: BlessingArea,
    judgements: Map<
      BlessingArea,
      BlessingJudgement
    >,
  ): BlessingJudgement {
    const judgement =
      judgements.get(area);
  
    if (!judgement) {
      throw new Error(
        `BlessingResult requires ${area} judgement.`,
      );
    }
  
    return judgement;
  }
  
  function buildBlessingResult(
    scores: BlessingAreaScore[],
    selections: BlessingAreaSelection[],
  ): BlessingResult {
    const judgements = new Map<
      BlessingArea,
      BlessingJudgement
    >();
  
    const normalizedSelections:
      BlessingAreaSelection[] = [];
  
    for (const area of BLESSING_AREAS) {
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
        buildBlessingJudgement(
          selection,
        ),
      );
    }
  
    return {
      opportunityReception:
        requireJudgement(
          "opportunityReception",
          judgements,
        ),
  
      benefactorConnection:
        requireJudgement(
          "benefactorConnection",
          judgements,
        ),
  
      relationshipSupport:
        requireJudgement(
          "relationshipSupport",
          judgements,
        ),
  
      resourceSupport:
        requireJudgement(
          "resourceSupport",
          judgements,
        ),
  
      environmentSupport:
        requireJudgement(
          "environmentSupport",
          judgements,
        ),
  
      crisisProtection:
        requireJudgement(
          "crisisProtection",
          judgements,
        ),
  
      blessingRetention:
        requireJudgement(
          "blessingRetention",
          judgements,
        ),
  
      blessingCirculation:
        requireJudgement(
          "blessingCirculation",
          judgements,
        ),
  
      interpretation:
        buildBlessingInterpretation(
          normalizedSelections,
        ),
    };
  }
  
  export function readBlessing(
    structureFacts: SajuStructureFact[],
  ): BlessingResult {
    const evidence =
      buildBlessingEvidence(
        structureFacts,
      );
  
    const scores =
      scoreBlessingAreas(
        evidence,
      );
  
    const selections =
      selectBlessingAreas(
        scores,
      );
  
    return buildBlessingResult(
      scores,
      selections,
    );
  }