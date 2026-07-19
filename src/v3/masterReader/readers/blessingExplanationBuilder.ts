import type {
    BlessingArea,
    BlessingConfidence,
    BlessingJudgement,
    BlessingLevel,
    BlessingResult,
  } from "../types/blessing";
  
  export type BlessingAreaExplanation = {
    area: BlessingArea;
  
    title: string;
  
    level: BlessingLevel | null;
  
    levelLabel: string;
  
    summary: string;
  
    confidence: BlessingConfidence;
  
    evidence: string[];
  
    counterEvidence: string[];
  
    exceptionConditions: string[];
  };
  
  export type BlessingResultExplanation = {
    title: string;
  
    summary: string;
  
    opportunityReception:
      BlessingAreaExplanation;
  
    benefactorConnection:
      BlessingAreaExplanation;
  
    relationshipSupport:
      BlessingAreaExplanation;
  
    resourceSupport:
      BlessingAreaExplanation;
  
    environmentSupport:
      BlessingAreaExplanation;
  
    crisisProtection:
      BlessingAreaExplanation;
  
    blessingRetention:
      BlessingAreaExplanation;
  
    blessingCirculation:
      BlessingAreaExplanation;
  
    strengths: string[];
  
    risks: string[];
  
    evidence: string[];
  
    supportiveConditions: string[];
  
    cautionConditions: string[];
  };
  
  const AREA_TITLES: Record<
    BlessingArea,
    string
  > = {
    opportunityReception:
      "기회 수용 통로",
  
    benefactorConnection:
      "도움을 주는 사람과의 연결",
  
    relationshipSupport:
      "관계를 통한 지원",
  
    resourceSupport:
      "정보·지식·현실 자원의 지원",
  
    environmentSupport:
      "환경과 제도를 통한 지원",
  
    crisisProtection:
      "위기에서의 보호와 완충",
  
    blessingRetention:
      "들어온 기회를 유지하는 힘",
  
    blessingCirculation:
      "받은 도움을 순환시키는 힘",
  };
  
  const STRONG_SUMMARIES: Record<
    BlessingArea,
    string
  > = {
    opportunityReception:
      "들어오는 기회를 알아보고 현실의 선택과 행동으로 연결하는 통로가 비교적 분명합니다.",
  
    benefactorConnection:
      "필요한 시점에 조언자·협력자·지원자와 연결될 수 있는 기반이 비교적 분명합니다.",
  
    relationshipSupport:
      "사람들과 지원을 주고받으며 관계를 현실적인 도움으로 연결하는 힘이 비교적 분명합니다.",
  
    resourceSupport:
      "정보·지식·기술·현실 자원을 받아들이고 활용하는 기반이 비교적 분명합니다.",
  
    environmentSupport:
      "환경·조직·제도 안에서 이용 가능한 지원을 발견하고 활용하는 힘이 비교적 분명합니다.",
  
    crisisProtection:
      "어려움이 생겼을 때 손실을 줄이고 다시 움직일 수 있는 보호와 완충 기반이 비교적 분명합니다.",
  
    blessingRetention:
      "들어온 기회와 도움을 일회성으로 소모하지 않고 지속 가능한 기반으로 유지하는 힘이 비교적 분명합니다.",
  
    blessingCirculation:
      "받은 도움을 성과·관계·기여로 돌려보내며 새로운 지원의 흐름을 만드는 힘이 비교적 분명합니다.",
  };
  
  const MODERATE_SUMMARIES: Record<
    BlessingArea,
    string
  > = {
    opportunityReception:
      "기회를 받아들이는 통로가 확인되지만, 실제 성과로 연결하려면 선택 기준과 실행 조건이 필요합니다.",
  
    benefactorConnection:
      "도움을 주는 사람과 연결될 가능성이 확인되지만, 신뢰 형성과 협력 조건이 함께 갖춰져야 합니다.",
  
    relationshipSupport:
      "관계를 통한 지원이 가능하지만, 역할·책임·상호성의 균형이 분명해야 안정적으로 이어집니다.",
  
    resourceSupport:
      "정보와 자원을 활용할 수 있지만, 필요한 자원을 선별하고 실제 행동으로 전환하는 과정이 필요합니다.",
  
    environmentSupport:
      "환경적 지원을 활용할 수 있지만, 현재 조건과 제도가 실제 목적에 맞는지 점검해야 합니다.",
  
    crisisProtection:
      "위기를 완충할 기반이 일부 확인되지만, 손실 한도와 회복 계획을 미리 준비해야 합니다.",
  
    blessingRetention:
      "들어온 기회와 도움을 유지할 수 있지만, 관리 기준과 반복 가능한 구조가 필요합니다.",
  
    blessingCirculation:
      "도움을 주고받는 흐름이 가능하지만, 과도한 희생이나 일방적인 의존을 피해야 합니다.",
  };
  
  const LIMITED_SUMMARIES: Record<
    BlessingArea,
    string
  > = {
    opportunityReception:
      "기회가 들어와도 판단 기준이나 실행 여건이 부족하면 놓치거나 부담으로 바뀔 수 있습니다.",
  
    benefactorConnection:
      "도움을 받을 가능성이 있어도 신뢰·요청·협력 방식이 맞지 않으면 연결이 약해질 수 있습니다.",
  
    relationshipSupport:
      "관계 안에서 책임이 한쪽으로 쏠리거나 경계가 흐려지면 지원보다 부담이 커질 수 있습니다.",
  
    resourceSupport:
      "정보와 자원이 들어와도 선별과 활용이 부족하면 실제 성과로 이어지기 어렵습니다.",
  
    environmentSupport:
      "환경이나 제도의 지원이 현재 상황과 맞지 않으면 기대한 도움을 받기 어려울 수 있습니다.",
  
    crisisProtection:
      "위기에서 버틸 여력이 제한될 수 있으므로 사전 준비와 외부 지원 경로를 명확히 해야 합니다.",
  
    blessingRetention:
      "들어온 기회와 도움을 유지하는 구조가 약하면 단기 성과 뒤에 자원이 빠르게 소진될 수 있습니다.",
  
    blessingCirculation:
      "도움의 교환이 불균형해지면 관계 피로·과잉 책임·의존으로 이어질 수 있습니다.",
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
    level: BlessingLevel | null,
  ): string {
    if (level === "strong") {
      return "강하게 확인";
    }
  
    if (level === "moderate") {
      return "조건부 확인";
    }
  
    if (level === "limited") {
      return "제한적으로 확인";
    }
  
    return "판단 보류";
  }
  
  function buildAreaSummary(
    judgement: BlessingJudgement,
  ): string {
    if (judgement.level === "strong") {
      return STRONG_SUMMARIES[
        judgement.area
      ];
    }
  
    if (judgement.level === "moderate") {
      return MODERATE_SUMMARIES[
        judgement.area
      ];
    }
  
    if (judgement.level === "limited") {
      return LIMITED_SUMMARIES[
        judgement.area
      ];
    }
  
    return `${AREA_TITLES[judgement.area]}을 판단할 구조적 근거가 충분하지 않아 판단을 보류합니다.`;
  }
  
  function buildAreaExplanation(
    judgement: BlessingJudgement,
  ): BlessingAreaExplanation {
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
    result: BlessingResult,
  ): string {
    if (result.interpretation) {
      return [
        result.interpretation.corePattern,
  
        "이는 행운의 발생 시점이나 결과를 예언하는 판단이 아니라, 도움·기회·자원이 들어오고 유지되며 다시 순환되는 구조적 통로를 설명한 것입니다.",
      ].join(" ");
    }
  
    return "기회·도움·자원이 들어오고 유지되는 통로를 판단할 구조적 근거가 충분하지 않아 현재는 해석을 보류합니다.";
  }
  
  function collectJudgements(
    result: BlessingResult,
  ): BlessingJudgement[] {
    return [
      result.opportunityReception,
      result.benefactorConnection,
      result.relationshipSupport,
      result.resourceSupport,
      result.environmentSupport,
      result.crisisProtection,
      result.blessingRetention,
      result.blessingCirculation,
    ];
  }
  
  function buildStrengths(
    explanations: BlessingAreaExplanation[],
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
    explanations: BlessingAreaExplanation[],
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
  
  export function buildBlessingExplanation(
    result: BlessingResult,
  ): BlessingResultExplanation {
    const opportunityReception =
      buildAreaExplanation(
        result.opportunityReception,
      );
  
    const benefactorConnection =
      buildAreaExplanation(
        result.benefactorConnection,
      );
  
    const relationshipSupport =
      buildAreaExplanation(
        result.relationshipSupport,
      );
  
    const resourceSupport =
      buildAreaExplanation(
        result.resourceSupport,
      );
  
    const environmentSupport =
      buildAreaExplanation(
        result.environmentSupport,
      );
  
    const crisisProtection =
      buildAreaExplanation(
        result.crisisProtection,
      );
  
    const blessingRetention =
      buildAreaExplanation(
        result.blessingRetention,
      );
  
    const blessingCirculation =
      buildAreaExplanation(
        result.blessingCirculation,
      );
  
    const explanations = [
      opportunityReception,
      benefactorConnection,
      relationshipSupport,
      resourceSupport,
      environmentSupport,
      crisisProtection,
      blessingRetention,
      blessingCirculation,
    ];
  
    const judgements =
      collectJudgements(result);
  
    return {
      title: "복이 들어오고 유지되는 구조",
  
      summary:
        buildResultSummary(result),
  
      opportunityReception,
  
      benefactorConnection,
  
      relationshipSupport,
  
      resourceSupport,
  
      environmentSupport,
  
      crisisProtection,
  
      blessingRetention,
  
      blessingCirculation,
  
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