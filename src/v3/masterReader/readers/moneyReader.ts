import {
    buildMoneyConfidence,
  } from "../../builders/moneyConfidenceBuilder.js";
  import {
    buildMoneyEvidence,
  } from "../../builders/moneyEvidenceBuilder.js";
  import {
    buildMoneyAreaInterpretation,
  } from "../../builders/moneyAreaInterpretationBuilder.js";
  import {
    buildMoneyInterpretation,
  } from "../../builders/moneyInterpretationBuilder.js";
  import type {
    MoneyArea,
    MoneyEvidence,
    MoneyJudgement,
    MoneyResult,
  } from "../types/money.js";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts.js";
  import {
    scoreMoneyAreas,
    type MoneyAreaScore,
  } from "./moneyScorer.js";
  import {
    selectMoneyAreas,
    type MoneyAreaSelection,
  } from "./moneySelector.js";
  
  const MONEY_AREAS: MoneyArea[] = [
    "generation",
    "repeatability",
    "retention",
    "assetConversion",
    "cashflowManagement",
    "debtHandling",
    "volatilityResponse",
    "lossRecovery",
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
    evidenceList: MoneyEvidence[],
  ): MoneyEvidence[] {
    const seen = new Set<string>();
    const result: MoneyEvidence[] = [];
  
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
    selection: MoneyAreaSelection,
  ): MoneyEvidence[] {
    return uniqueEvidence(
      selection.supportingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectLimitingEvidence(
    selection: MoneyAreaSelection,
  ): MoneyEvidence[] {
    return uniqueEvidence(
      selection.limitingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectExceptionConditions(
    selection: MoneyAreaSelection,
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
    area: MoneyArea,
  ): MoneyJudgement {
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
  
  function buildMoneyJudgement(
    selection: MoneyAreaSelection,
  ): MoneyJudgement {
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
        buildMoneyAreaInterpretation(selection),
  
      evidence:
        collectSupportingEvidence(selection),
  
      counterEvidence:
        collectLimitingEvidence(selection),
  
      confidence:
        buildMoneyConfidence(selection),
  
      exceptionConditions:
        collectExceptionConditions(selection),
    };
  }
  
  function findAreaSelection(
    area: MoneyArea,
    selections: MoneyAreaSelection[],
  ): MoneyAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function findAreaScore(
    area: MoneyArea,
    scores: MoneyAreaScore[],
  ): MoneyAreaScore | null {
    return (
      scores.find(
        (score) => score.area === area,
      )
      ?? null
    );
  }
  
  function buildMissingAreaSelection(
    area: MoneyArea,
  ): MoneyAreaSelection {
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
    area: MoneyArea,
    scores: MoneyAreaScore[],
    selections: MoneyAreaSelection[],
  ): MoneyAreaSelection {
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
  
  function requireJudgement(
    area: MoneyArea,
    judgements: Map<
      MoneyArea,
      MoneyJudgement
    >,
  ): MoneyJudgement {
    const judgement = judgements.get(area);
  
    if (!judgement) {
      throw new Error(
        `MoneyResult requires ${area} judgement.`,
      );
    }
  
    return judgement;
  }
  
  function buildMoneyResult(
    scores: MoneyAreaScore[],
    selections: MoneyAreaSelection[],
  ): MoneyResult {
    const judgements = new Map<
      MoneyArea,
      MoneyJudgement
    >();
  
    const normalizedSelections:
      MoneyAreaSelection[] = [];
  
    for (const area of MONEY_AREAS) {
      const selection =
        ensureAreaSelection(
          area,
          scores,
          selections,
        );
  
      normalizedSelections.push(selection);
  
      judgements.set(
        area,
        buildMoneyJudgement(selection),
      );
    }
  
    return {
      generation:
        requireJudgement(
          "generation",
          judgements,
        ),
  
      repeatability:
        requireJudgement(
          "repeatability",
          judgements,
        ),
  
      retention:
        requireJudgement(
          "retention",
          judgements,
        ),
  
      assetConversion:
        requireJudgement(
          "assetConversion",
          judgements,
        ),
  
      cashflowManagement:
        requireJudgement(
          "cashflowManagement",
          judgements,
        ),
  
      debtHandling:
        requireJudgement(
          "debtHandling",
          judgements,
        ),
  
      volatilityResponse:
        requireJudgement(
          "volatilityResponse",
          judgements,
        ),
  
      lossRecovery:
        requireJudgement(
          "lossRecovery",
          judgements,
        ),
  
      interpretation:
        buildMoneyInterpretation(
          normalizedSelections,
        ),
    };
  }
  
  export function readMoney(
    structureFacts: SajuStructureFact[],
  ): MoneyResult {
    const evidence =
      buildMoneyEvidence(structureFacts);
  
    const scores =
      scoreMoneyAreas(evidence);
  
    const selections =
      selectMoneyAreas(scores);
  
    return buildMoneyResult(
      scores,
      selections,
    );
  }