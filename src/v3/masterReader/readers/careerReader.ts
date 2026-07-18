import {
    buildCareerConfidence,
  } from "../../builders/careerConfidenceBuilder";
  import {
    buildCareerEvidence,
  } from "../../builders/careerEvidenceBuilder";
  import {
    buildCareerAreaInterpretation,
  } from "../../builders/careerAreaInterpretationBuilder";
  import {
    buildCareerInterpretation,
  } from "../../builders/careerInterpretationBuilder";
  import type {
    CareerArea,
    CareerEvidence,
    CareerJudgement,
    CareerResult,
  } from "../types/career";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import {
    scoreCareerAreas,
    type CareerAreaScore,
  } from "./careerScorer";
  import {
    selectCareerAreas,
    type CareerAreaSelection,
  } from "./careerSelector";
  
  const CAREER_AREAS: CareerArea[] = [
    "roleOrientation",
    "workStyle",
    "expertiseGrowth",
    "organizationFit",
    "independenceFit",
    "leadershipFit",
    "performanceConversion",
    "careerContinuity",
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
    evidenceList: CareerEvidence[],
  ): CareerEvidence[] {
    const seen = new Set<string>();
    const result: CareerEvidence[] = [];
  
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
    selection: CareerAreaSelection,
  ): CareerEvidence[] {
    return uniqueEvidence(
      selection.supportingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectLimitingEvidence(
    selection: CareerAreaSelection,
  ): CareerEvidence[] {
    return uniqueEvidence(
      selection.limitingMatches.map(
        (match) => match.evidence,
      ),
    );
  }
  
  function collectExceptionConditions(
    selection: CareerAreaSelection,
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
        (match) =>
          match.evidence.exceptions,
      );
  
    return uniqueTexts([
      ...limitingExceptions,
      ...supportingExceptions,
    ]);
  }
  
  function buildInsufficientJudgement(
    area: CareerArea,
  ): CareerJudgement {
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
  
  function buildCareerJudgement(
    selection: CareerAreaSelection,
  ): CareerJudgement {
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
        buildCareerAreaInterpretation(
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
        buildCareerConfidence(selection),
  
      exceptionConditions:
        collectExceptionConditions(
          selection,
        ),
    };
  }
  
  function findAreaSelection(
    area: CareerArea,
    selections: CareerAreaSelection[],
  ): CareerAreaSelection | null {
    return (
      selections.find(
        (selection) =>
          selection.area === area,
      )
      ?? null
    );
  }
  
  function findAreaScore(
    area: CareerArea,
    scores: CareerAreaScore[],
  ): CareerAreaScore | null {
    return (
      scores.find(
        (score) =>
          score.area === area,
      )
      ?? null
    );
  }
  
  function buildMissingAreaSelection(
    area: CareerArea,
  ): CareerAreaSelection {
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
    area: CareerArea,
    scores: CareerAreaScore[],
    selections: CareerAreaSelection[],
  ): CareerAreaSelection {
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
    area: CareerArea,
    judgements: Map<
      CareerArea,
      CareerJudgement
    >,
  ): CareerJudgement {
    const judgement =
      judgements.get(area);
  
    if (!judgement) {
      throw new Error(
        `CareerResult requires ${area} judgement.`,
      );
    }
  
    return judgement;
  }
  
  function buildCareerResult(
    scores: CareerAreaScore[],
    selections: CareerAreaSelection[],
  ): CareerResult {
    const judgements = new Map<
      CareerArea,
      CareerJudgement
    >();
  
    const normalizedSelections:
      CareerAreaSelection[] = [];
  
    for (const area of CAREER_AREAS) {
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
        buildCareerJudgement(
          selection,
        ),
      );
    }
  
    return {
      roleOrientation:
        requireJudgement(
          "roleOrientation",
          judgements,
        ),
  
      workStyle:
        requireJudgement(
          "workStyle",
          judgements,
        ),
  
      expertiseGrowth:
        requireJudgement(
          "expertiseGrowth",
          judgements,
        ),
  
      organizationFit:
        requireJudgement(
          "organizationFit",
          judgements,
        ),
  
      independenceFit:
        requireJudgement(
          "independenceFit",
          judgements,
        ),
  
      leadershipFit:
        requireJudgement(
          "leadershipFit",
          judgements,
        ),
  
      performanceConversion:
        requireJudgement(
          "performanceConversion",
          judgements,
        ),
  
      careerContinuity:
        requireJudgement(
          "careerContinuity",
          judgements,
        ),
  
      interpretation:
        buildCareerInterpretation(
          normalizedSelections,
        ),
    };
  }
  
  export function readCareer(
    structureFacts: SajuStructureFact[],
  ): CareerResult {
    const evidence =
      buildCareerEvidence(
        structureFacts,
      );
  
    const scores =
      scoreCareerAreas(evidence);
  
    const selections =
      selectCareerAreas(scores);
  
    return buildCareerResult(
      scores,
      selections,
    );
  }