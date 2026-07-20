import type {
    DecisionCondition,
  } from "./decisionTypes";
  import type {
    ReaderDecisionAssessment,
    ReaderDecisionAssessmentItem,
  } from "./readerDecisionAssessment";
  
  const READER_CONDITION_GUIDANCE: Record<
    ReaderDecisionAssessmentItem["source"],
    string
  > = {
    capacity:
      "실제로 감당할 수 있는 책임, 규모, 시간과 보완 수단을 구체적으로 확정해야 한다.",
  
    money:
      "현금흐름, 고정비, 부채와 감당 가능한 손실 한도를 수치로 확인해야 한다.",
  
    career:
      "필요한 역할, 업무 방식, 전문성, 조직 또는 독립 실행 조건을 구체적으로 확인해야 한다.",
  
    relationship:
      "상대방과의 역할, 책임, 권한, 경계와 갈등 조정 기준을 사전에 합의해야 한다.",
  
    health:
      "현재의 업무량, 생활 리듬, 휴식과 회복 시간을 해치지 않는 실행 범위를 마련해야 한다.",
  
    blessing:
      "확정되지 않은 외부 도움이나 환경적 지원을 전제로 삼지 말고, 실제로 확보된 지원만 실행 계획에 반영해야 한다.",
  
    destiny:
      "현재 선택이 장기 방향과 반복 과제에 부합하는지 확인하되, 미래가 정해져 있다고 전제하지 않아야 한다.",
  };
  
  function normalizeDescription(
    value: string,
  ): string {
    return value
      .replace(/\s+/g, " ")
      .trim();
  }
  
  function buildConditionDescription(
    item:
      ReaderDecisionAssessmentItem,
  ): string {
    const limitationDescription =
      item.limitationDescriptions
        .map(normalizeDescription)
        .filter(Boolean)
        .join(" ");
  
    const guidance =
      READER_CONDITION_GUIDANCE[
        item.source
      ];
  
    if (!limitationDescription) {
      return guidance;
    }
  
    return [
      limitationDescription,
      guidance,
    ].join(" ");
  }
  
  function buildLimitationConditions(
    assessment:
      ReaderDecisionAssessment,
  ): DecisionCondition[] {
    const conditions:
      DecisionCondition[] = [];
  
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
        "readerDecisionCondition",
        limitation.source,
        limitation.area,
      ].join("-");
  
      if (usedKeys.has(key)) {
        continue;
      }
  
      usedKeys.add(key);
  
      conditions.push({
        key,
  
        description:
          buildConditionDescription(
            limitation,
          ),
  
        required: true,
  
        satisfied: false,
      });
    }
  
    return conditions;
  }
  
  function buildInsufficientCondition():
    DecisionCondition {
    return {
      key:
        "confirmReaderDecisionEvidence",
  
      description:
        "질문 주제와 직접 관련된 감당력과 작동 방식의 근거가 충분하지 않으므로, 현재의 실제 경험, 준비 수준, 자원과 제한 사항을 먼저 확인해야 한다.",
  
      required: true,
  
      satisfied: false,
    };
  }
  
  export function buildReaderDecisionConditions(
    assessment:
      ReaderDecisionAssessment,
  ): DecisionCondition[] {
    switch (
      assessment.constraintLevel
    ) {
      case "high":
      case "moderate":
        return buildLimitationConditions(
          assessment,
        );
  
      case "insufficient":
        return [
          buildInsufficientCondition(),
        ];
  
      case "none":
        return [];
    }
  }