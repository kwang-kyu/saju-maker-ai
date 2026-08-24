import type {
    HealthArea,
    HealthAreaInterpretation,
    HealthConfidence,
    HealthJudgement,
    HealthLevel,
    HealthResult,
  } from "../types/health.js";
  
  export type HealthJudgementExplanation = {
    area: HealthArea;
  
    title: string;
  
    level: HealthLevel | null;
  
    levelLabel: string;
  
    summary: string;
  
    interpretation:
      HealthAreaInterpretation | null;
  
    evidence: string[];
  
    counterEvidence: string[];
  
    confidence: HealthConfidence;
  
    exceptionConditions: string[];
  };
  
  export type HealthResultExplanation = {
    title: string;
  
    disclaimer: string;
  
    summary: string;
  
    vitalityStability:
      HealthJudgementExplanation;
  
    stressRegulation:
      HealthJudgementExplanation;
  
    fatigueManagement:
      HealthJudgementExplanation;
  
    recoveryCapacity:
      HealthJudgementExplanation;
  
    rhythmMaintenance:
      HealthJudgementExplanation;
  
    overloadTolerance:
      HealthJudgementExplanation;
  
    habitSelfManagement:
      HealthJudgementExplanation;
  
    imbalanceAdaptation:
      HealthJudgementExplanation;
  
    strengths: string[];
  
    risks: string[];
  
    evidence: string[];
  
    supportiveConditions: string[];
  
    cautionConditions: string[];
  };
  
  const HEALTH_AREA_TITLES: Record<
    HealthArea,
    string
  > = {
    vitalityStability:
      "활력 안정성",
  
    stressRegulation:
      "스트레스 조절력",
  
    fatigueManagement:
      "피로 관리력",
  
    recoveryCapacity:
      "회복 역량",
  
    rhythmMaintenance:
      "생활 리듬 유지력",
  
    overloadTolerance:
      "과부하 감당력",
  
    habitSelfManagement:
      "생활 습관 자기관리력",
  
    imbalanceAdaptation:
      "불균형 적응력",
  };
  
  const HEALTH_LEVEL_LABELS: Record<
    HealthLevel,
    string
  > = {
    limited: "제한적",
  
    moderate: "보통",
  
    strong: "강함",
  };
  
  function unique(
    values: string[],
  ): string[] {
    return [
      ...new Set(
        values
          .map(
            (value) =>
              value
                .replace(/\s+/g, " ")
                .trim(),
          )
          .filter(Boolean),
      ),
    ];
  }
  
  function buildPendingSummary(
    judgement: HealthJudgement,
  ): string {
    const title =
      HEALTH_AREA_TITLES[judgement.area];
  
    return `${title}은 현재 구조 근거만으로 강약을 구체적으로 판단하기 어렵습니다.`;
  }
  
  function buildLevelSummary(
    judgement: HealthJudgement,
  ): string {
    const title =
      HEALTH_AREA_TITLES[judgement.area];
  
    switch (judgement.level) {
      case "strong":
        return `${title}은 비교적 안정적으로 유지될 가능성이 높지만, 실제 상태는 생활 환경과 현재 조건에 따라 달라질 수 있습니다.`;
  
      case "moderate":
        return `${title}은 보통 수준으로, 생활 리듬과 부담 관리 방식에 따라 실제 발현 범위가 달라질 수 있습니다.`;
  
      case "limited":
        return `${title}은 구조적으로 제한될 가능성이 있으므로 무리한 지속과 과도한 부담을 피하는 관리가 중요합니다.`;
  
      case null:
        return buildPendingSummary(
          judgement,
        );
    }
  }
  
  function buildHealthJudgementExplanation(
    judgement: HealthJudgement,
  ): HealthJudgementExplanation {
    return {
      area: judgement.area,
  
      title:
        HEALTH_AREA_TITLES[
          judgement.area
        ],
  
      level: judgement.level,
  
      levelLabel:
        judgement.level === null
          ? "판단 보류"
          : HEALTH_LEVEL_LABELS[
              judgement.level
            ],
  
      summary:
        buildLevelSummary(
          judgement,
        ),
  
      interpretation:
        judgement.interpretation,
  
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
  
      confidence:
        judgement.confidence,
  
      exceptionConditions: unique(
        judgement.exceptionConditions,
      ),
    };
  }
  
  function buildFallbackSummary(
    explanations:
      HealthJudgementExplanation[],
  ): string {
    const strongAreas =
      explanations.filter(
        (explanation) =>
          explanation.level === "strong",
      );
  
    const moderateAreas =
      explanations.filter(
        (explanation) =>
          explanation.level === "moderate",
      );
  
    const limitedAreas =
      explanations.filter(
        (explanation) =>
          explanation.level === "limited",
      );
  
    const sentences: string[] = [];
  
    if (strongAreas.length > 0) {
      sentences.push(
        `${strongAreas
          .map(
            (explanation) =>
              explanation.title,
          )
          .join(", ")}에서 비교적 안정적인 구조가 확인됩니다.`,
      );
    }
  
    if (moderateAreas.length > 0) {
      sentences.push(
        `${moderateAreas
          .map(
            (explanation) =>
              explanation.title,
          )
          .join(", ")}은 생활 조건과 관리 방식에 따라 실제 유지 범위가 달라질 수 있습니다.`,
      );
    }
  
    if (limitedAreas.length > 0) {
      sentences.push(
        `${limitedAreas
          .map(
            (explanation) =>
              explanation.title,
          )
          .join(", ")}에서는 과도한 부담과 무리한 지속을 피해야 합니다.`,
      );
    }
  
    if (sentences.length === 0) {
      return "현재 구조 근거만으로 활력과 회복의 강약을 구체적으로 판단하기 어렵습니다.";
    }
  
    return sentences.join(" ");
  }
  
  function collectStrengths(
    explanations:
      HealthJudgementExplanation[],
  ): string[] {
    return unique(
      explanations.flatMap(
        (explanation) =>
          explanation.level === "strong"
            ? [
                `${explanation.title}이 비교적 안정적으로 유지될 가능성이 있습니다.`,
                ...explanation.evidence,
              ]
            : [],
      ),
    );
  }
  
  function collectRisks(
    explanations:
      HealthJudgementExplanation[],
  ): string[] {
    return unique(
      explanations.flatMap(
        (explanation) => [
          ...(
            explanation.level === "limited"
              ? [
                  `${explanation.title}에서 무리한 지속과 과도한 부담을 피해야 합니다.`,
                ]
              : []
          ),
  
          ...explanation.counterEvidence,
  
          ...explanation.exceptionConditions,
        ],
      ),
    );
  }
  
  export function buildHealthExplanation(
    health: HealthResult,
  ): HealthResultExplanation {
    const vitalityStability =
      buildHealthJudgementExplanation(
        health.vitalityStability,
      );
  
    const stressRegulation =
      buildHealthJudgementExplanation(
        health.stressRegulation,
      );
  
    const fatigueManagement =
      buildHealthJudgementExplanation(
        health.fatigueManagement,
      );
  
    const recoveryCapacity =
      buildHealthJudgementExplanation(
        health.recoveryCapacity,
      );
  
    const rhythmMaintenance =
      buildHealthJudgementExplanation(
        health.rhythmMaintenance,
      );
  
    const overloadTolerance =
      buildHealthJudgementExplanation(
        health.overloadTolerance,
      );
  
    const habitSelfManagement =
      buildHealthJudgementExplanation(
        health.habitSelfManagement,
      );
  
    const imbalanceAdaptation =
      buildHealthJudgementExplanation(
        health.imbalanceAdaptation,
      );
  
    const explanations = [
      vitalityStability,
      stressRegulation,
      fatigueManagement,
      recoveryCapacity,
      rhythmMaintenance,
      overloadTolerance,
      habitSelfManagement,
      imbalanceAdaptation,
    ];
  
    const interpretation =
      health.interpretation;
  
    const evidence = unique(
      explanations.flatMap(
        (explanation) =>
          explanation.evidence,
      ),
    );
  
    const counterEvidence = unique(
      explanations.flatMap(
        (explanation) =>
          explanation.counterEvidence,
      ),
    );
  
    const exceptionConditions = unique(
      explanations.flatMap(
        (explanation) =>
          explanation.exceptionConditions,
      ),
    );
  
    const supportiveConditions =
      interpretation
        ? unique(
            interpretation
              .supportiveConditions,
          )
        : [];
  
    const cautionConditions =
      interpretation
        ? unique([
            ...interpretation
              .cautionConditions,
  
            ...counterEvidence,
  
            ...exceptionConditions,
          ])
        : unique([
            ...counterEvidence,
  
            ...exceptionConditions,
          ]);
  
    return {
      title:
        "이 사람의 활력·스트레스·피로·회복 구조",
  
      disclaimer:
        "이 설명은 사주 구조에서 확인되는 생활 에너지와 회복 경향을 설명하며, 질병 진단·장기 상태 예측·의학적 검사 또는 치료 판단을 제공하지 않습니다.",
  
      summary:
        interpretation?.corePattern
        ?? buildFallbackSummary(
          explanations,
        ),
  
      vitalityStability,
  
      stressRegulation,
  
      fatigueManagement,
  
      recoveryCapacity,
  
      rhythmMaintenance,
  
      overloadTolerance,
  
      habitSelfManagement,
  
      imbalanceAdaptation,
  
      strengths:
        collectStrengths(
          explanations,
        ),
  
      risks: unique([
        ...collectRisks(
          explanations,
        ),
  
        ...cautionConditions,
      ]),
  
      evidence,
  
      supportiveConditions,
  
      cautionConditions,
    };
  }