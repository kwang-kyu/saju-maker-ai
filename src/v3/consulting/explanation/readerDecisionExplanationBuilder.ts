import type {
    DecisionExplanationCondition,
    DecisionExplanationInput,
    DecisionExplanationRisk,
  } from "./decisionResultReader.js";
  import type {
    ReaderDecisionSource,
  } from "../decision/readerDecisionSelectionBuilder.js";

  export type ReaderDecisionExplanation = {
    required: boolean;

    title:
      "사람의 구조가 판단에 미친 영향";

    content: string;

    sources:
      ReaderDecisionSource[];

    conditionDescriptions:
      string[];

    riskDescriptions:
      string[];

    insufficientEvidence:
      boolean;
  };

  const READER_SOURCE_LABELS: Record<
    ReaderDecisionSource,
    string
  > = {
    capacity:
      "감당력",

    money:
      "재물 구조",

    career:
      "직업 구조",

    relationship:
      "관계 구조",

    health:
      "건강·회복 구조",

    blessing:
      "도움·기회 수용 구조",

    destiny:
      "장기 방향 구조",
  };

  const READER_SOURCES:
    ReaderDecisionSource[] = [
      "capacity",
      "money",
      "career",
      "relationship",
      "health",
      "blessing",
      "destiny",
    ];

  function isReaderDecisionSource(
    value: string,
  ): value is ReaderDecisionSource {
    return READER_SOURCES.some(
      (source) =>
        source === value,
    );
  }

  function extractSourceFromKey(
    key: string,
  ): ReaderDecisionSource | null {
    const [
      prefix,
      source,
    ] = key.split("-");

    if (
      prefix
        !== "readerDecisionCondition"
      && prefix
        !== "readerDecisionRisk"
    ) {
      return null;
    }

    if (
      !source
      || !isReaderDecisionSource(
        source,
      )
    ) {
      return null;
    }

    return source;
  }

  function isReaderCondition(
    condition:
      DecisionExplanationCondition,
  ): boolean {
    return (
      condition.key.startsWith(
        "readerDecisionCondition-",
      )
      || condition.key
        === "confirmReaderDecisionEvidence"
    );
  }

  function isReaderRisk(
    risk:
      DecisionExplanationRisk,
  ): boolean {
    return (
      risk.key.startsWith(
        "readerDecisionRisk-",
      )
      || risk.key
        === "insufficientReaderDecisionEvidence"
    );
  }

  function collectSources(
    conditions:
      DecisionExplanationCondition[],
    risks:
      DecisionExplanationRisk[],
  ): ReaderDecisionSource[] {
    const sources =
      new Set<ReaderDecisionSource>();

    for (const condition of conditions) {
      const source =
        extractSourceFromKey(
          condition.key,
        );

      if (source) {
        sources.add(source);
      }
    }

    for (const risk of risks) {
      if (
        isReaderDecisionSource(
          risk.source,
        )
      ) {
        sources.add(
          risk.source,
        );

        continue;
      }

      const source =
        extractSourceFromKey(
          risk.key,
        );

      if (source) {
        sources.add(source);
      }
    }

    return [
      ...sources,
    ];
  }

  function buildSourceDescription(
    sources:
      ReaderDecisionSource[],
  ): string {
    if (sources.length === 0) {
      return "질문 주제와 직접 관련된 사람의 구조";
    }

    return sources
      .map(
        (source) =>
          READER_SOURCE_LABELS[
            source
          ],
      )
      .join(", ");
  }

  function buildVerdictEffectDescription(
    input:
      DecisionExplanationInput,
    sourceDescription: string,
    insufficientEvidence: boolean,
  ): string {
    if (insufficientEvidence) {
      return [
        sourceDescription,
        "질문에 직접 관련된 근거가 충분하지 않아 현재 상태만으로 결론을 확정하지 않고, 추가 확인이 필요한 판단에 반영했습니다.",
      ].join(" ");
    }
  
    switch (input.verdict) {
      case "wait":
        return [
          sourceDescription,
          "관련 판단에서 현재 실행을 제한하는 근거가 확인되어, 최종 판단의 제한 방향과 위험 설명에 반영했습니다.",
        ].join(" ");
  
      case "conditionallyRecommended":
        return [
          sourceDescription,
          "관련 판단에서 실행 여부에 영향을 주는 제한 근거가 확인되어, 최종 판단의 조건과 위험 설명에 반영했습니다.",
        ].join(" ");
  
      case "notRecommended":
        return [
          sourceDescription,
          "관련 판단에서 확인된 제한을 바탕으로, 현재 진행을 권하지 않는 판단의 위험 근거에 반영했습니다.",
        ].join(" ");
  
      case "insufficientEvidence":
        return [
          sourceDescription,
          "질문에 직접 관련된 근거가 충분하지 않아 현재 상태만으로 결론을 확정하지 않고, 필요한 정보를 추가로 확인해야 하는 판단에 반영했습니다.",
        ].join(" ");
  
      case "recommended":
        return [
          sourceDescription,
          "관련 근거를 현재 확정된 진행 판단을 설명하는 근거로 반영했습니다.",
        ].join(" ");
  
      case "interpreted":
        return [
          sourceDescription,
          "관련 근거를 요청한 기간의 운 흐름을 설명하는 자료로 반영했습니다.",
        ].join(" ");
    }
  }

  export function buildReaderDecisionExplanation(
    input:
      DecisionExplanationInput,
  ): ReaderDecisionExplanation {
    const readerConditions =
      input.conditions.filter(
        isReaderCondition,
      );

    const readerRisks =
      input.risks.filter(
        isReaderRisk,
      );

    const insufficientEvidence =
      readerConditions.some(
        (condition) =>
          condition.key
          === "confirmReaderDecisionEvidence",
      )
      || readerRisks.some(
        (risk) =>
          risk.key
          === "insufficientReaderDecisionEvidence",
      );

    const sources =
      collectSources(
        readerConditions,
        readerRisks,
      );

    const required =
      readerConditions.length > 0
      || readerRisks.length > 0;

    const sourceDescription =
      buildSourceDescription(
        sources,
      );

    return {
      required,

      title:
        "사람의 구조가 판단에 미친 영향",

      content:
        required
          ? buildVerdictEffectDescription(
              input,
              sourceDescription,
              insufficientEvidence,
            )
          : "",

      sources,

      conditionDescriptions:
        readerConditions.map(
          (condition) =>
            condition.description,
        ),

      riskDescriptions:
        readerRisks.map(
          (risk) =>
            risk.description,
        ),

      insufficientEvidence,
    };
  }
