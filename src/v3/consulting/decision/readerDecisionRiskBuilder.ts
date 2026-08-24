import type {
    DecisionRisk,
  } from "./decisionTypes.js";
  import type {
    ReaderDecisionAssessment,
    ReaderDecisionAssessmentItem,
  } from "./readerDecisionAssessment.js";
  
  const READER_RISK_CONSEQUENCE: Record<
    ReaderDecisionAssessmentItem["source"],
    string
  > = {
    capacity:
      "감당 범위를 넘는 책임과 규모를 동시에 떠안으면 과부하와 실행 중단으로 이어질 수 있다.",
  
    money:
      "현금흐름, 고정비, 부채와 손실 한도를 확인하지 않으면 기존 자금 기반까지 흔들릴 수 있다.",
  
    career:
      "역할과 업무 방식이 맞지 않은 상태에서 추진하면 성과가 지속되지 않거나 경력의 연속성이 약해질 수 있다.",
  
    relationship:
      "역할, 책임, 권한과 경계를 정하지 않으면 갈등과 신뢰 손상으로 이어질 수 있다.",
  
    health:
      "현재의 업무량과 생활 리듬을 넘어서면 피로 누적과 회복 저하로 실행 지속성이 약해질 수 있다.",
  
    blessing:
      "확정되지 않은 외부 도움과 환경적 지원을 전제로 추진하면 실제 지원이 없을 때 계획이 흔들릴 수 있다.",
  
    destiny:
      "현재 선택이 장기 방향과 반복 과제에서 벗어나면 단기 성과가 있더라도 선택의 일관성을 유지하기 어려울 수 있다.",
  };
  
  function normalizeDescription(
    value: string,
  ): string {
    return value
      .replace(/\s+/g, " ")
      .trim();
  }
  
  function buildRiskDescription(
    item:
      ReaderDecisionAssessmentItem,
  ): string {
    const limitationDescription =
      item.limitationDescriptions
        .map(normalizeDescription)
        .filter(Boolean)
        .join(" ");
  
    const consequence =
      READER_RISK_CONSEQUENCE[
        item.source
      ];
  
    if (!limitationDescription) {
      return consequence;
    }
  
    return [
      limitationDescription,
      consequence,
    ].join(" ");
  }
  
  function buildRiskSeverity(
    item:
      ReaderDecisionAssessmentItem,
  ): DecisionRisk["severity"] {
    if (
      item.confidence === "high"
    ) {
      return "high";
    }
  
    return "medium";
  }
  
  function buildLimitationRisks(
    assessment:
      ReaderDecisionAssessment,
  ): DecisionRisk[] {
    const risks:
      DecisionRisk[] = [];
  
    const usedKeys =
      new Set<string>();
  
    for (
      const limitation
      of assessment.limitations
    ) {
      if (
        limitation.confidence
        === "low"
      ) {
        continue;
      }
  
      const key = [
        "readerDecisionRisk",
        limitation.source,
        limitation.area,
      ].join("-");
  
      if (usedKeys.has(key)) {
        continue;
      }
  
      usedKeys.add(key);
  
      risks.push({
        key,
  
        description:
          buildRiskDescription(
            limitation,
          ),
  
        severity:
          buildRiskSeverity(
            limitation,
          ),
  
        source:
          limitation.source,
      });
    }
  
    return risks;
  }
  
  function buildInsufficientRisk():
    DecisionRisk {
    return {
      key:
        "insufficientReaderDecisionEvidence",
  
      description:
        "질문 주제와 직접 관련된 감당력과 작동 방식의 근거가 충분하지 않은 상태에서 결정을 추진하면 실제 제한을 확인하지 못한 채 책임과 위험을 떠안을 수 있다.",
  
      severity: "medium",
  
      source: "questionIntent",
    };
  }
  
  export function buildReaderDecisionRisks(
    assessment:
      ReaderDecisionAssessment,
  ): DecisionRisk[] {
    switch (
      assessment.constraintLevel
    ) {
      case "high":
      case "moderate":
        return buildLimitationRisks(
          assessment,
        );
  
      case "insufficient":
        return [
          buildInsufficientRisk(),
        ];
  
      case "none":
        return [];
    }
  }