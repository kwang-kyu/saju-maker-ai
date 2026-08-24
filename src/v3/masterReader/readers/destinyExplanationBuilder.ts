import type {
    DestinyArea,
    DestinyConfidence,
    DestinyJudgement,
    DestinyLevel,
    DestinyResult,
  } from "../types/destiny.js";
  
  export type DestinyAreaExplanation = {
    area: DestinyArea;
  
    title: string;
  
    level: DestinyLevel | null;
  
    levelLabel: string;
  
    summary: string;
  
    confidence: DestinyConfidence;
  
    evidence: string[];
  
    counterEvidence: string[];
  
    exceptionConditions: string[];
  };
  
  export type DestinyResultExplanation = {
    title: string;
  
    summary: string;
  
    lifeDirection:
      DestinyAreaExplanation;
  
    coreLifeTask:
      DestinyAreaExplanation;
  
    strengthFulfillment:
      DestinyAreaExplanation;
  
    growthPath:
      DestinyAreaExplanation;
  
    choiceAlignment:
      DestinyAreaExplanation;
  
    changeIntegration:
      DestinyAreaExplanation;
  
    contributionPattern:
      DestinyAreaExplanation;
  
    longTermCoherence:
      DestinyAreaExplanation;
  
    strengths: string[];
  
    risks: string[];
  
    evidence: string[];
  
    supportiveConditions: string[];
  
    cautionConditions: string[];
  };
  
  const AREA_TITLES: Record<
    DestinyArea,
    string
  > = {
    lifeDirection:
      "장기적인 삶의 방향",
  
    coreLifeTask:
      "평생 다루어야 할 핵심 과제",
  
    strengthFulfillment:
      "타고난 강점의 완성 방식",
  
    growthPath:
      "장기적인 성장 경로",
  
    choiceAlignment:
      "자기 구조와 맞는 선택 기준",
  
    changeIntegration:
      "변화와 경험의 통합 방식",
  
    contributionPattern:
      "능력과 경험의 기여 방식",
  
    longTermCoherence:
      "장기 방향의 유지 구조",
  };
  
  function unique(
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
  
  function buildLevelLabel(
    level: DestinyLevel | null,
  ): string {
    if (level === "strong") {
      return "뚜렷하게 확인";
    }
  
    if (level === "moderate") {
      return "조건부 확인";
    }
  
    if (level === "limited") {
      return "보완 필요";
    }
  
    return "판단 보류";
  }
  
  function buildAreaSummary(
    judgement: DestinyJudgement,
  ): string {
    if (judgement.interpretation) {
      return [
        judgement.interpretation
          .corePattern,
  
        judgement.interpretation
          .directionExpression,
      ].join(" ");
    }
  
    return `${AREA_TITLES[judgement.area]}을 판단할 구조적 근거가 충분하지 않아 판단을 보류합니다.`;
  }
  
  function buildAreaExplanation(
    judgement: DestinyJudgement,
  ): DestinyAreaExplanation {
    return {
      area: judgement.area,
  
      title:
        AREA_TITLES[judgement.area],
  
      level: judgement.level,
  
      levelLabel:
        buildLevelLabel(
          judgement.level,
        ),
  
      summary:
        buildAreaSummary(
          judgement,
        ),
  
      confidence:
        judgement.confidence,
  
      evidence: unique(
        judgement.evidence.map(
          (evidence) =>
            evidence.description,
        ),
      ),
  
      counterEvidence: unique(
        judgement.counterEvidence.map(
          (evidence) =>
            evidence.description,
        ),
      ),
  
      exceptionConditions: unique(
        judgement.exceptionConditions,
      ),
    };
  }
  
  function buildResultSummary(
    result: DestinyResult,
  ): string {
    if (result.interpretation) {
      return [
        result.interpretation.corePattern,
  
        "이는 운명을 선고하거나 현재의 행동과 시기를 결정하는 판단이 아니라, 타고난 강점·반복 과제·선택·성장·기여가 장기적으로 연결되는 구조를 설명한 것입니다.",
      ].join(" ");
    }
  
    return "장기적인 삶의 방향과 핵심 과제를 판단할 구조적 근거가 충분하지 않아 현재는 해석을 보류합니다.";
  }
  
  function collectJudgements(
    result: DestinyResult,
  ): DestinyJudgement[] {
    return [
      result.lifeDirection,
      result.coreLifeTask,
      result.strengthFulfillment,
      result.growthPath,
      result.choiceAlignment,
      result.changeIntegration,
      result.contributionPattern,
      result.longTermCoherence,
    ];
  }
  
  function buildStrengths(
    explanations: DestinyAreaExplanation[],
  ): string[] {
    return unique(
      explanations
        .filter(
          (explanation) =>
            explanation.level === "strong"
            || explanation.level === "moderate",
        )
        .map(
          (explanation) =>
            explanation.summary,
        ),
    );
  }
  
  function buildRisks(
    explanations: DestinyAreaExplanation[],
  ): string[] {
    return unique(
      explanations.flatMap(
        (explanation) => {
          const risks: string[] = [];
  
          if (explanation.level === "limited") {
            risks.push(
              explanation.summary,
            );
          }
  
          risks.push(
            ...explanation.counterEvidence,
            ...explanation.exceptionConditions,
          );
  
          return risks;
        },
      ),
    );
  }
  
  export function buildDestinyExplanation(
    result: DestinyResult,
  ): DestinyResultExplanation {
    const lifeDirection =
      buildAreaExplanation(
        result.lifeDirection,
      );
  
    const coreLifeTask =
      buildAreaExplanation(
        result.coreLifeTask,
      );
  
    const strengthFulfillment =
      buildAreaExplanation(
        result.strengthFulfillment,
      );
  
    const growthPath =
      buildAreaExplanation(
        result.growthPath,
      );
  
    const choiceAlignment =
      buildAreaExplanation(
        result.choiceAlignment,
      );
  
    const changeIntegration =
      buildAreaExplanation(
        result.changeIntegration,
      );
  
    const contributionPattern =
      buildAreaExplanation(
        result.contributionPattern,
      );
  
    const longTermCoherence =
      buildAreaExplanation(
        result.longTermCoherence,
      );
  
    const explanations = [
      lifeDirection,
      coreLifeTask,
      strengthFulfillment,
      growthPath,
      choiceAlignment,
      changeIntegration,
      contributionPattern,
      longTermCoherence,
    ];
  
    const judgements =
      collectJudgements(result);
  
    return {
      title:
        "장기적인 삶의 방향과 핵심 과제",
  
      summary:
        buildResultSummary(result),
  
      lifeDirection,
  
      coreLifeTask,
  
      strengthFulfillment,
  
      growthPath,
  
      choiceAlignment,
  
      changeIntegration,
  
      contributionPattern,
  
      longTermCoherence,
  
      strengths:
        buildStrengths(
          explanations,
        ),
  
      risks:
        buildRisks(
          explanations,
        ),
  
      evidence: unique(
        judgements.flatMap(
          (judgement) =>
            judgement.evidence.map(
              (evidence) =>
                evidence.description,
            ),
        ),
      ),
  
      supportiveConditions: unique(
        result.interpretation
          ?.supportiveConditions
          ?? [],
      ),
  
      cautionConditions: unique(
        result.interpretation
          ?.cautionConditions
          ?? [],
      ),
    };
  }